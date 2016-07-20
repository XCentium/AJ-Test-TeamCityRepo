using System;
using System.IO;
using System.Linq;
using System.Reflection;
using Insite.Admin;
using Insite.Admin.Providers;
using Insite.Admin.Services;
using Insite.Common.Extensions;
using Insite.Common.Providers;
using Insite.Core.Interfaces.Dependency;

namespace Morsco.Customizations.Lib.EntityFramework.Infrastructure
{
    public class EntityDefinitionRepository_Morsco : JsonRepositoryBase<EntityDefinition>, IEntityDefinitionRepository, IDependency
    {
        private Assembly _jsonFileAssembly = default(Assembly);
        private const string MorscoCustomResourcePath = "Morsco.Customizations.Lib.EntityFramework.Json.";

        private Assembly JsonFileAssembly
        {
            get
            {
                // Getting property this way will let us lazy load the value because EntityDefinitionRepository is not loaded when this class is instantiated
                if (_jsonFileAssembly == default(Assembly))
                {
                    _jsonFileAssembly = Assembly.GetAssembly(typeof(EntityDefinitionRepository));
                }
                return _jsonFileAssembly;
            }
        }

        protected readonly IEntityDefinitionCacheKeyProvider EntityDefinitionCacheKeyProvider;

        protected override string JsonEntityFolderPath => "EntityDefinitions";

        private EntityDefinition LoadJsonEntityFromFilePath(string filePath)
        {
            return LoadJsonEntityFromSerializedString(File.ReadAllText(filePath));
        }

        private EntityDefinition LoadJsonEntityFromResource(string resourceName, Assembly assembly)
        {
            return LoadJsonEntityFromSerializedString(new StreamReader(assembly.GetManifestResourceStream(resourceName)).ReadToEnd());
        }
        public override EntityDefinition GetByName(string name)
        {
            string str = Path.Combine(GetEntityFilePath(), $"{name}.json");
            if (File.Exists(str))
            {
                return LoadJsonEntityFromFilePath(str);
            }

            // check Insite for json file
            var assemblyName = $"{EmbeddedResourcePath}{name.ToLower()}.json";
            var entityDefinition = GetByName(assemblyName, JsonFileAssembly);

            // This is the one reason why we overrode this class: otherwise could make non-embedded, put json file in specified folder and load from there.  
            // As of this release (4.2.0.25461), Insite uses a guid for the path of non-embedded resources -- on disk, rather than a usable one.
            // appears to be a b.u.g that is in JsonRepositoryBase.GetJsonPath that returns that guid if the machine isn't "ishq-rnd-web1"
            // otherwise it returns a usable disk path.
            if (entityDefinition == default(EntityDefinition))
            { 
                assemblyName = $"{MorscoCustomResourcePath}{name}.json".ToLower();
                entityDefinition = GetByName(assemblyName, Assembly.GetExecutingAssembly());
            }

            return entityDefinition;
        }

        private EntityDefinition GetByName(string name, Assembly assembly)
        {
            string resourceName = assembly.GetManifestResourceNames()
                .FirstOrDefault(o => o.ToLower() == name);

            if (resourceName == null)
            {
                return default(EntityDefinition);
            }

            return LoadJsonEntityFromResource(resourceName, assembly);
        }

        public EntityDefinitionRepository_Morsco(IEntityDefinitionCacheKeyProvider entityDefinitionCacheKeyProvider)
        {
            EntityDefinitionCacheKeyProvider = entityDefinitionCacheKeyProvider;
        }

        public override void Save(EntityDefinition jsonEntity)
        {
            Save(jsonEntity);
            EntityDefinitionCacheKeyProvider.Reset();
        }

        protected new string GetEntityFilePath()
        {
            if (UseModulePath)
                return Path.Combine(new DirectoryInfo(PathProvider.Current.MapPath("~/")).Parent.FullName, "Modules\\Admin\\Insite.Admin\\" + JsonEntityFolderPath);
            if (!Environment.MachineName.EqualsIgnoreCase("ishq-rnd-web1"))
                return Guid.NewGuid().ToString();
            string path = PathProvider.Current.MapPath("~/App_Data/" + JsonEntityFolderPath);
            new DirectoryInfo(path).CreateIfDoesNotExist();
            return path;
        }
    }
}
