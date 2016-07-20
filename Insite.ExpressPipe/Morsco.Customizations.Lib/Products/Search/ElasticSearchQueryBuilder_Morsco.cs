using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Insite.Core.Interfaces.Dependency;
using Insite.Core.Plugins.Application;
using Insite.Core.Plugins.Search.Enums;
using Insite.Search.Elasticsearch;
using Nest;

namespace Morsco.Customizations.Lib.Products.Search
{
    public class ElasticsearchQueryBuilder_Morsco : IElasticsearchQueryBuilder, IDependency
    {
        protected IApplicationSettingProvider ApplicationSettingProvider;
        protected IBoostHelper BoostHelper;

        public virtual string MinumumMustMatch
        {
            get
            {
                var num1 = ApplicationSettingProvider.GetOrCreateByName<int>("Search_MinimumMatchCount");
                if (num1 < -10)
                    num1 = -10;
                if (num1 > 10)
                    num1 = 10;
                var num2 = ApplicationSettingProvider.GetOrCreateByName<int>("Search_MinimumMatchPercent");
                if (num2 > 100)
                    num2 = 100;
                if (num2 < -100)
                    num2 = -100;
                return $"{num1}<{num2}%";
            }
        }

        public ElasticsearchQueryBuilder_Morsco(IApplicationSettingProvider applicationSettingProvider, IBoostHelper boostHelper)
        {
            ApplicationSettingProvider = applicationSettingProvider;
            BoostHelper = boostHelper;
        }

        public QueryContainer MakeFieldQuery(string field, string value, FieldMatch match = FieldMatch.All, bool not = false, float? boost = null)
        {
            QueryContainer queryContainer;

            if (match == FieldMatch.Prefix)
            {
                queryContainer = new PrefixQuery
                {
                    Field = field,
                    Boost = boost.HasValue ? boost.GetValueOrDefault() : new double?(),
                    Value = value
                };
            }
            else
            {
                queryContainer = new MatchQuery
                {
                    Field = field,
                    Boost = boost.HasValue ? boost.GetValueOrDefault() : new double?(),
                    Query = value
                };
            }

            return not ? !queryContainer : queryContainer;
        }

        public FilterContainer MakeFieldFilter<T>(string field, string value, FieldMatch match = FieldMatch.All, bool not = false) where T : class
        {
            var filterContainer = match != FieldMatch.Prefix
                ? Filter<T>.Term(field, value)
                : Filter<T>.Query(q => q.Wildcard(field, value + "*", new double?(), new RewriteMultiTerm?()));

            return not ? !filterContainer : filterContainer;
        }

        public FilterContainer MakeFieldMultivalueFilter<T>(string field, IEnumerable<string> values, bool not = false) where T : class
        {
            var filterContainer = Filter<T>.Terms(field, values, new TermsExecution?());

            return not ? !filterContainer : filterContainer;
        }

        public QueryContainer MakeBooleanQuery(List<QueryContainer> queries, Operation operation)
        {
            if (queries.Count == 1)
                return queries.First();
            return CombineQueries(queries, operation);
        }

        public FilterContainer MakeBooleanFilter(List<FilterContainer> queries, Operation operation)
        {
            if (queries.Count == 1)
                return queries.First();
            var boolFilter = new BoolFilter();
            if (operation == Operation.And)
                boolFilter.Must = queries;
            else
                boolFilter.Should = queries;
            return boolFilter;
        }

        public QueryContainer MakeBooleanNotQuery(List<QueryContainer> queries, Operation operation)
        {
            if (queries.Count == 1)
                return !queries.First();
            return !CombineQueries(queries, operation);
        }

        public FilterContainer MakeBooleanNotFilter(List<FilterContainer> queries, Operation operation)
        {
            return !MakeBooleanFilter(queries, operation);
        }

        public QueryContainer MakeAllDocumentQuery()
        {
            return new MatchAllQuery();
        }

        public FilterContainer MakeAllDocumentFilter<T>() where T : class
        {
            return Filter<T>.MatchAll();
        }

        public FilterContainer MakeNumericRangeFilter<T>(string field, Decimal? min, Decimal? max) where T : class
        {
            if (min.HasValue && max.HasValue)
                return Filter<T>.Range(r => r.OnField(field).LowerOrEquals((double)max.Value).GreaterOrEquals((double)min.Value), new RangeExecution?());
            if (min.HasValue)
                return Filter<T>.Range(r => r.OnField(field).GreaterOrEquals((double)min.Value), new RangeExecution?());
            if (max.HasValue)
                return Filter<T>.Range(r => r.OnField(field).LowerOrEquals((double)max.Value), new RangeExecution?());
            return null;
        }

        public QueryContainer MakeFuzzyQuery(string field, string value, Decimal minimumSimilarity, int prefixLength, float? boost)
        {
            var fuzzyStringQuery = new FuzzyStringQuery
            {
                Fuzziness = minimumSimilarity.ToString(CultureInfo.InvariantCulture),
                PrefixLength = prefixLength,
                Boost = boost.HasValue ? boost.GetValueOrDefault() : 1.0,
                Name = field,
                Value = value
            };

            return fuzzyStringQuery;
        }

        public QueryContainer MakeMultimatchQuery(string query, List<string> fields, bool allMatch = false, string boostName = null)
        {
            var fields1 = fields.Select(x => new PropertyPathMarker { Name = x }).ToList();

            var boostValue = BoostHelper.GetBoostValue(boostName ?? "Query_Word");

            var multiMatchQuery = new MultiMatchQuery
            {
                Query = query,
                Analyzer = "iscQueryAnalyzer",
                Operator = Operator.Or,
                Fields = fields1,
                Type = TextQueryType.CrossFields,
                MinimumShouldMatch = allMatch ? "100%" : MinumumMustMatch,
                Boost = boostValue.HasValue ? boostValue.GetValueOrDefault() : new double?()
            };

            AddFieldBoostValues(fields1);
            return multiMatchQuery;
        }

        public QueryContainer MakeMultimatchPrefixQuery(string query, List<string> fields)
        {
            var fields1 = fields.Select(x => new PropertyPathMarker { Name = x }).ToList();

            var boostValue = BoostHelper.GetBoostValue("Query_Prefix");

            var multiMatchQuery = new MultiMatchQuery
            {
                Query = query,
                Analyzer = "iscQueryAnalyzer",
                Operator = Operator.Or,
                Fields = fields1,
                MinimumShouldMatch = MinumumMustMatch,
                Type = TextQueryType.PhrasePrefix,
                Slop = 100,
                Boost = boostValue.HasValue ? boostValue.GetValueOrDefault() : new double?(),
            };

            AddFieldBoostValues(fields1);
            return multiMatchQuery;
        }

        public QueryContainer MakeMultiMatchFuzzyQuery(string query, List<string> fields)
        {
            var fields1 = fields.Select(x => new PropertyPathMarker { Name = x }).ToList();

            var orCreateByName = ApplicationSettingProvider.GetOrCreateByName<int>("Search_FuzzySearch_MaxEdits");

            var boostValue = BoostHelper.GetBoostValue("Query_Fuzzy");

            var num = ApplicationSettingProvider.GetOrCreateByName<int>("Search_FuzzySearch_PrefixLength");
            if (num < 1)
                num = 1;
            if (num > 10)
                num = 10;

            var multiMatchQuery = new MultiMatchQuery
            {
                Query = query,
                Analyzer = "iscQueryAnalyzer",
                Operator = Operator.Or,
                MinimumShouldMatch = MinumumMustMatch,
                Fields = fields1,
                Fuzziness = orCreateByName,
                PrefixLength = num,
                Boost = boostValue.HasValue ? boostValue.GetValueOrDefault() : new double?()
            };

            AddFieldBoostValues(fields1);
            return multiMatchQuery;
        }

        public QueryContainer MakeMultiMatchPhraseQuery(string query, List<string> fields)
        {
            var fields1 = fields.Select(x => new PropertyPathMarker { Name = x }).ToList();
            var boostValue = BoostHelper.GetBoostValue("Query_Phrase");

            var multiMatchQuery = new MultiMatchQuery
            {
                Query = query,
                Analyzer = "iscQueryAnalyzer",
                Operator = Operator.And,
                Fields = fields1,
                Type = TextQueryType.Phrase,
                Boost = boostValue.HasValue ? boostValue.GetValueOrDefault() : new double?()
            };

            AddFieldBoostValues(fields1);
            return multiMatchQuery;
        }

        protected QueryContainer CombineQueries(List<QueryContainer> queries, Operation operation)
        {
            var boolQuery = new BoolQuery();
            if (operation == Operation.And)
                boolQuery.Must = queries;
            else
                boolQuery.Should = queries;
            return boolQuery;
        }

        protected void AddFieldBoostValues(List<PropertyPathMarker> fields)
        {
            foreach (var propertyPathMarker1 in fields)
            {
                var propertyPathMarker2 = propertyPathMarker1;
                var boostValue = BoostHelper.GetBoostValue("Field_" + propertyPathMarker1.Name);
                var nullable = boostValue.HasValue ? boostValue.GetValueOrDefault() : new double?();
                propertyPathMarker2.Boost = nullable;
            }
        }
    }
}
