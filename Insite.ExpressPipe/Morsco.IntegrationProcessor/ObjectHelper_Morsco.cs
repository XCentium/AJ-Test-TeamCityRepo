// Decompiled with JetBrains decompiler
// Type: Insite.Common.Helpers.ObjectHelper
// Assembly: Insite.Common, Version=4.2.0.25461, Culture=neutral, PublicKeyToken=null
// MVID: C2AD4130-231A-46B2-85EF-501CFC656EC9
// Assembly location: C:\aa-Github\ExpressPipe\Insite.ExpressPipe\Lib\Insite.Common.dll

using System;
using System.Collections;
using System.Data;
using System.Linq;
using System.Reflection;

namespace Morsco.IntegrationProcessor
{
    public class ObjectHelper_Morsco
    {
        //public static void SimplePropertyCopyObject(object source, object destination)
        //{
        //    ObjectHelper.SimplePropertyCopyObject(source, destination, false);
        //}

        //public static void SimplePropertyCopyObject(object source, object destination, bool excludeIdProperty)
        //{
        //    Type type1 = source.GetType();
        //    Type type2 = destination.GetType();
        //    foreach (PropertyInfo property in type1.GetProperties())
        //    {
        //        if ((!excludeIdProperty || !(property.Name == type1.Name + "Id") && !(property.Name == "Id") && !(property.Name == "IdString")) && (property.CanWrite && !property.PropertyType.UnderlyingSystemType.FullName.StartsWith("System.Collections") && property.PropertyType.UnderlyingSystemType.FullName.StartsWith("System.")))
        //        {
        //            PropertyInfo propertyInfo = type2.GetProperty(property.Name, BindingFlags.DeclaredOnly | BindingFlags.Instance | BindingFlags.Public) ?? type2.GetProperty(property.Name);
        //            if (propertyInfo != (PropertyInfo)null)
        //            {
        //                object obj = property.GetValue(source, (object[])null);
        //                propertyInfo.SetValue(destination, obj, (object[])null);
        //            }
        //        }
        //    }
        //}

        //public static void CopyDataRowToObject(DataRow source, object destination)
        //{
        //    Type type = destination.GetType();
        //    string message = "";
        //    foreach (PropertyInfo property in type.GetProperties())
        //    {
        //        if (property.CanWrite && !property.PropertyType.UnderlyingSystemType.FullName.StartsWith("System.Collections") && (property.PropertyType.UnderlyingSystemType.FullName.StartsWith("System.") && !(property.Name == type.Name + "Id")) && (!(property.Name == "Id") && !(property.Name == "IdString")))
        //        {
        //            if (source.Table.Columns.Contains(property.Name))
        //            {
        //                try
        //                {
        //                    if (property.PropertyType.UnderlyingSystemType == typeof(string))
        //                        property.SetValue(destination, (object)source[property.Name].ToString(), (object[])null);
        //                    else if (source[property.Name] is DBNull || source[property.Name] == null)
        //                        property.SetValue(destination, (object)null, (object[])null);
        //                    else if (property.PropertyType.UnderlyingSystemType == typeof(Decimal) || property.PropertyType.UnderlyingSystemType == typeof(Decimal?))
        //                    {
        //                        if (source[property.Name] == null || source[property.Name].ToString() == "")
        //                            property.SetValue(destination, (object)null, (object[])null);
        //                        else
        //                            property.SetValue(destination, (object)Convert.ToDecimal(source[property.Name]), (object[])null);
        //                    }
        //                    else if (property.PropertyType.UnderlyingSystemType == typeof(int) || property.PropertyType.UnderlyingSystemType == typeof(int?))
        //                    {
        //                        if (source[property.Name] == null || source[property.Name].ToString() == "")
        //                            property.SetValue(destination, (object)null, (object[])null);
        //                        else
        //                            property.SetValue(destination, (object)Convert.ToInt32(source[property.Name]), (object[])null);
        //                    }
        //                    else if (property.PropertyType.UnderlyingSystemType == typeof(DateTime) || property.PropertyType.UnderlyingSystemType == typeof(DateTime?))
        //                    {
        //                        if (source[property.Name] == null || source[property.Name].ToString() == "")
        //                            property.SetValue(destination, (object)null, (object[])null);
        //                        else
        //                            property.SetValue(destination, (object)Convert.ToDateTime(source[property.Name]), (object[])null);
        //                    }
        //                    else if (property.PropertyType.UnderlyingSystemType == typeof(DateTimeOffset) || property.PropertyType.UnderlyingSystemType == typeof(DateTimeOffset?))
        //                    {
        //                        if (source[property.Name] == null || source[property.Name].ToString() == "")
        //                            property.SetValue(destination, (object)null, (object[])null);
        //                        else
        //                            property.SetValue(destination, (object)new DateTimeOffset(Convert.ToDateTime(source[property.Name])), (object[])null);
        //                    }
        //                    else if (property.PropertyType.UnderlyingSystemType == typeof(bool))
        //                        property.SetValue(destination, (object)Convert.ToBoolean(source[property.Name]), (object[])null);
        //                    else
        //                        property.SetValue(destination, source[property.Name], (object[])null);
        //                }
        //                catch (Exception ex)
        //                {
        //                    if (!message.IsBlank())
        //                        message += Environment.NewLine;
        //                    message = message + "Setting Field " + property.Name + " to Value " + source[property.Name] + ": " + ex.Message;
        //                }
        //            }
        //        }
        //    }
        //    if (!message.IsBlank())
        //        throw new Exception(message);
        //}

        //public static void CopyDataRowToObject(DataRow source, object destination, List<string> propertiesToIgnore)
        //{
        //    List<string> stringList = new List<string>();
        //    foreach (string str in propertiesToIgnore)
        //        stringList.Add(str.ToLower());
        //    foreach (PropertyInfo property in destination.GetType().GetProperties())
        //    {
        //        if (property.CanWrite && !property.PropertyType.UnderlyingSystemType.FullName.StartsWith("System.Collections") && (property.PropertyType.UnderlyingSystemType.FullName.StartsWith("System.") && !stringList.Contains(property.Name.ToLower())) && source.Table.Columns.Contains(property.Name))
        //        {
        //            if (property.PropertyType.UnderlyingSystemType == typeof(string))
        //                property.SetValue(destination, (object)source[property.Name].ToString(), (object[])null);
        //            else if (source[property.Name] is DBNull)
        //                property.SetValue(destination, (object)null, (object[])null);
        //            else if (property.PropertyType.UnderlyingSystemType == typeof(Decimal))
        //                property.SetValue(destination, (object)Convert.ToDecimal(source[property.Name]), (object[])null);
        //            else if (property.PropertyType.UnderlyingSystemType == typeof(int))
        //                property.SetValue(destination, (object)Convert.ToInt32(source[property.Name]), (object[])null);
        //            else if (property.PropertyType.UnderlyingSystemType == typeof(DateTime) || property.PropertyType.UnderlyingSystemType == typeof(DateTime?))
        //                property.SetValue(destination, (object)Convert.ToDateTime(source[property.Name]), (object[])null);
        //            else if (property.PropertyType.UnderlyingSystemType == typeof(bool))
        //                property.SetValue(destination, (object)Convert.ToBoolean(source[property.Name]), (object[])null);
        //            else
        //                property.SetValue(destination, source[property.Name], (object[])null);
        //        }
        //    }
        //}

        public static DataTable GetDataTableFromList(IList list, Type type)
        {
            return ObjectHelper_Morsco.GetDataTableFromList(list, type, null, new Guid?());
        }

        public static DataTable GetDataTableFromList(IList list, Type type, string parentFieldName, Guid? parentFieldValue)
        {
            DataTable dataTable = new DataTable();
            dataTable.TableName = type.Name;
            foreach (PropertyInfo property in type.GetProperties())
            {
                if (IsSimpleProperty(property))
                    dataTable.Columns.Add(property.Name, NullableToRegularDateType(property.PropertyType));
            }
            if (parentFieldName != null && parentFieldValue.HasValue)
            {
                if (dataTable.Columns.Contains(parentFieldName))
                    dataTable.Columns.Remove(parentFieldName);
                dataTable.Columns.Add(parentFieldName, typeof(Guid));
            }
            foreach (object obj1 in list)
            {
                DataRow row = dataTable.NewRow();
                foreach (DataColumn column in dataTable.Columns)
                {
                    PropertyInfo property = type.GetProperty(column.ColumnName);
                    if (property != null)
                    {
                        object obj2 = property.GetValue(obj1, null);
                        if (obj2 != null)
                            row[column.ColumnName] = obj2;
                    }
                }
                if (parentFieldName != null && parentFieldValue.HasValue)
                    row[parentFieldName] = parentFieldValue;
                dataTable.Rows.Add(row);
            }
            return dataTable;
        }

        private static bool IsSimpleProperty(PropertyInfo pi)
        {
            if (pi.GetCustomAttributes(true).FirstOrDefault(a => (a.GetType().Name == "ExcludeFromDataTable")) != null)
            {
                return false;
            }
            if (((pi.Name == "CustomerNumberPrefix") || (pi.Name == "CustomerNumberFormat")) || ((pi.Name == "OrderNumberPrefix") || (pi.Name == "OrderNumberFormat")))
            {
                return false;
            }

            return
                pi.PropertyType.IsPrimitive ||
                new[]
                {
                    typeof(string),
                    typeof(DateTime),
                    typeof(DateTime?),
                    typeof(decimal),
                    typeof(Guid),
                    typeof(DateTimeOffset),
                    typeof(DateTimeOffset?)
                }.Contains(pi.PropertyType);
        }

        private static Type NullableToRegularDateType(Type type)
        {
            if (type == typeof(DateTime?))
                return typeof(DateTime);
            if (type == typeof(DateTimeOffset?))
                return typeof(DateTimeOffset);
            return type;
        }

        //public static object GetDefaultValue(Type t)
        //{
        //    if (t != (Type)null && t.IsValueType && Nullable.GetUnderlyingType(t) == (Type)null)
        //        return Activator.CreateInstance(t);
        //    return (object)null;
        //}

        //public static object GetPropertyValueIfExists(object instance, string propertyName)
        //{
        //    if (instance == null)
        //        return (object)null;
        //    PropertyInfo property = instance.GetType().GetProperty(propertyName);
        //    if (property == null)
        //        return (object)null;
        //    object obj = instance;
        //    // ISSUE: variable of the null type
        //    __Null local = null;
        //    return property.GetValue(obj, (object[])local);
        //}

        //public static bool IsNumericType(object instance)
        //{
        //    if (instance == null)
        //        return false;
        //    switch (Type.GetTypeCode(instance.GetType()))
        //    {
        //        case TypeCode.SByte:
        //        case TypeCode.Byte:
        //        case TypeCode.Int16:
        //        case TypeCode.UInt16:
        //        case TypeCode.Int32:
        //        case TypeCode.UInt32:
        //        case TypeCode.Int64:
        //        case TypeCode.UInt64:
        //        case TypeCode.Single:
        //        case TypeCode.Double:
        //        case TypeCode.Decimal:
        //            return true;
        //        default:
        //            return false;
        //    }
        //}

        //public static bool IsIntegerType(object instance)
        //{
        //    if (instance == null)
        //        return false;
        //    switch (Type.GetTypeCode(instance.GetType()))
        //    {
        //        case TypeCode.SByte:
        //        case TypeCode.Byte:
        //        case TypeCode.Int16:
        //        case TypeCode.UInt16:
        //        case TypeCode.Int32:
        //        case TypeCode.UInt32:
        //        case TypeCode.Int64:
        //        case TypeCode.UInt64:
        //            return true;
        //        default:
        //            return false;
        //    }
        //}
    }
}
