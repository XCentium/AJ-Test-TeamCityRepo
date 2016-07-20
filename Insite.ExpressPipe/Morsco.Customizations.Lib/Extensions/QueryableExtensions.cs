using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Morsco.Customizations.Lib.Extensions
{
    public static class QueryableExtensions
    {
        public static IQueryable<T> OrderByList<T>(this IQueryable<T> queryable, string sortExpression, string defaultSortExpression)
        {
            if (sortExpression.IsBlank())
            {
                sortExpression = defaultSortExpression;
            }

            var isFirstSortTerm = true;

            foreach (var sortby in sortExpression.Split(','))
            {
                queryable = queryable.OrderBy(sortby, isFirstSortTerm);
                isFirstSortTerm = false;
            }

            return queryable;
        }

        public static IQueryable<T> OrderBy<T>(this IQueryable<T> queryable, string sortExpression, bool firstSortExpression)
        {
            if (queryable == null)
                throw new ArgumentNullException(nameof(queryable), "source is null.");

            if (string.IsNullOrEmpty(sortExpression))
                throw new ArgumentException("sortExpression is null or empty.", nameof(sortExpression));

            var parts = sortExpression.Split(new[] {' '}, StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length == 0)
                throw new ArgumentException("Invalid sort expression: " + sortExpression);

            // Get the property that we're going to sort on
            var tType = typeof(T);
            var propertyName = parts[0];
            var property = tType.GetProperty(propertyName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if (property == null)
            {
                throw new ArgumentException($"No property '{propertyName}' on type '{tType.Name}'");
            }

            // Determine if descending
            var isDescending = parts.Length > 1 && parts[1].ToLower().Contains("desc");

            // Make function type with parameters our queryable type and the property we're sorting on
            var funcType = typeof(Func<,>)
                .MakeGenericType(tType, property.PropertyType);

            // Make a lambda expression our sorting type
            var lambdaBuilder = typeof(Expression)
                .GetMethods()
                .First(x => x.Name == "Lambda" && x.ContainsGenericParameters && x.GetParameters().Length == 2)
                .MakeGenericMethod(funcType);

            var parameter = Expression.Parameter(tType);
            var propExpress = Expression.Property(parameter, property);

            var sortLambda = lambdaBuilder
                .Invoke(null, new object[] {propExpress, new ParameterExpression[] {parameter}});

            //Figure out which of the 4 sort methods we're going to use.
            var queryableMethodName = (firstSortExpression ? "OrderBy" : "ThenBy")
                                      + (isDescending ? "Descending" : string.Empty);
            var firstOrDefault = typeof(Queryable)
                .GetMethods()
                .FirstOrDefault(x => x.Name == queryableMethodName && x.GetParameters().Length == 2);

            //Not going to happen, but ...
            if (firstOrDefault == null)
            {
                throw new Exception("Did not find queryable method for " + queryableMethodName);
            }

            // Make the generic method for our queryable type and the type of property we're going to use
            var sorter = firstOrDefault.MakeGenericMethod(tType, property.PropertyType);

            // Execute the method on the queryable using that method and our lambda expression
            return (IQueryable<T>) sorter
                .Invoke(null, new[] {queryable, sortLambda});
        }

        //public static IQueryable<T> OrderBy2<T>(this IQueryable<T> queryable, string sortExpression, bool firstSortExpression)
        //{
        //    ParameterExpression[] typeParams = new ParameterExpression[] {Expression.Parameter(typeof(T), "")};


        //    System.Reflection.PropertyInfo pi = typeof(T).GetProperty(sortExpression);


        //    return (IOrderedQueryable<T>)queryable.Provider.CreateQuery(
        //        Expression.Call(
        //            typeof(Queryable),
        //            "OrderBy",
        //            new Type[]
        //            {
        //                typeof(T), pi.PropertyType
        //            },
        //            queryable.Expression,
        //            Expression.Lambda(Expression.Property(typeParams[0], pi), typeParams))
        //        );
        //}
    }
}
