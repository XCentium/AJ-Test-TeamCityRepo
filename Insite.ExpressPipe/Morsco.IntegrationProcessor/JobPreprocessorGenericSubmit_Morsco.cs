using System;
using System.Collections;
using System.Data;
using System.Linq;
using Insite.Common.Extensions;
using Insite.Common.Helpers;
using Insite.Core.Interfaces.Data;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.EntityUtilities;
using Insite.Data.Entities;
using Insite.Data.Extensions;
using Insite.Integration.WebService;
using Insite.Integration.WebService.Interfaces;
using Insite.Integration.WebService.PlugIns.Preprocessor;

namespace Morsco.IntegrationProcessor
{
    [DependencyName("GenericSubmitMorsco")]
    public class JobPreprocessorGenericSubmit_Morsco : JobPreprocessorGenericSubmit, IJobPreprocessor, IDependency
    {
        public JobPreprocessorGenericSubmit_Morsco(IUnitOfWorkFactory unitOfWorkFactory, ICustomerOrderUtilities customerOrderUtilities)
            : base(unitOfWorkFactory, customerOrderUtilities)
        {
        }

        public override IntegrationJob Execute()
        {
            var dataset = new DataSet();

            foreach (var jobDefinitionStep in IntegrationJob.JobDefinition.JobDefinitionSteps.OrderBy(s => s.Sequence))
            {
                var step = jobDefinitionStep;
                if (string.IsNullOrEmpty(step.ObjectName))
                    throw new ArgumentException(IntegrationMessages.StepObjectNameRequiredExceptionMessage);
                var typeForClassName = UnitOfWork.DataProvider.GetTypeForClassName(step.ObjectName);
                if (typeForClassName == null)
                    throw new ArgumentException(IntegrationMessages.StepObjectNameRequiredExceptionMessage);
                var keyValues = GetKeyValues(step, typeForClassName);
                var repository = UnitOfWork.GetRepository(typeForClassName);
                var obj = repository.GetType().GetMethod("GetByNaturalKey").Invoke(repository, new object[]{keyValues});
                if (obj == null)
                    throw new ArgumentException(string.Format(IntegrationMessages.UnableToRetrieveObjectExceptionMessage, step.ObjectName, string.Join(",", keyValues.Select(k => k.ToString()).ToArray())));
                var dataSet = new DataSet(typeForClassName.Name);
                if (typeForClassName == typeof(CustomerOrder))
                {
                    //Customization point: CustomerOrderUtilities requires customer have a number of subsidiary tables loaded.  They may have been by nHibernate.
                    //They were not loaded in 4.2.  So load these so the remainder of this job works!
                    var orderNumber = keyValues[0].ToString();
                    var order = UnitOfWork.GetRepository<CustomerOrder>().GetTable()
                        .Expand(o => o.CustomProperties)
                        .Expand(o => o.Customer)
                        .Expand(o => o.Customer.CustomProperties)
                        .Expand(o => o.Customer.State)
                        .Expand(o => o.Customer.Country)
                        .Expand(o => o.ShipTo)
                        .Expand(o => o.ShipTo.CustomProperties)
                        .Expand(o => o.ShipTo.State)
                        .Expand(o => o.ShipTo.Country)
                        .Expand(o => o.OrderLines)
                        .Expand(o => o.OrderLines.Select(ol => ol.Product))
                        .Expand(o => o.OrderLines.Select(ol => ol.CustomProperties))
                        .Expand(o => o.ShipVia)
                        .FirstOrDefault(o => o.OrderNumber.Equals(orderNumber, StringComparison.CurrentCultureIgnoreCase));
                    if (order == null)
                    {
                        throw new Exception("Order not found");
                    }
                    // End customization

                    dataSet = CustomerOrderUtilities.GetCustomerOrderDataSet(order);
                }
                else if (typeForClassName == typeof(Customer))
                {
                    var customer = obj as Customer;
                    var arrayList1 = new ArrayList();
                    arrayList1.Add(obj);
                    var type1 = typeForClassName;
                    var dataTableFromList1 = ObjectHelper.GetDataTableFromList(arrayList1, type1);
                    dataSet.Tables.Add(dataTableFromList1);
                    dataSet.Tables.Add(ObjectHelper.GetDataTableFromList(customer.CustomProperties.ToList(), typeof(CustomProperty), "CustomerId", customer.Id));
                    if (customer.Country != null)
                    {
                        var tables = dataSet.Tables;
                        var arrayList2 = new ArrayList();
                        arrayList2.Add(customer.Country);
                        var type2 = typeof(Country);
                        var dataTableFromList2 = ObjectHelper.GetDataTableFromList(arrayList2, type2);
                        tables.Add(dataTableFromList2);
                    }
                }
                else
                {
                    var arrayList = new ArrayList();
                    arrayList.Add(obj);
                    var type = typeForClassName;
                    var dataTableFromList = ObjectHelper.GetDataTableFromList(arrayList, type);
                    dataSet.Tables.Add(dataTableFromList);
                }

                foreach (DataTable dataTable in dataSet.Tables)
                {
                    dataTable.Columns.Add("StepSequence");
                    foreach (DataRow dataRow in (InternalDataCollectionBase)dataTable.Rows)
                        dataRow["StepSequence"] = step.Sequence;
                }

                dataset.Merge(dataSet);
                var integrationJobParameters = IntegrationJob.IntegrationJobParameters;
                foreach (var integrationJobParameter in integrationJobParameters.Where(integrationJobParameter => integrationJobParameter.JobDefinitionStepParameter.JobDefinitionStep.Id.Equals(step.Id)))
                    integrationJobParameter.JobDefinitionStepParameter.Value = integrationJobParameter.Value;
            }
            IntegrationJob.InitialData = XmlDatasetManager.ConvertDatasetToXml(dataset);
            return IntegrationJob;
        }
    }
}