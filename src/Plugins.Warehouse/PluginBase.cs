using System;
using Microsoft.Xrm.Sdk;

namespace Plugins.Warehouse
{
    public interface ILocalPluginContext
    {
        IPluginExecutionContext PluginExecutionContext { get; }
        IOrganizationServiceFactory OrgSvcFactory { get; }
        ITracingService TracingService { get; }
    }

    public abstract class PluginBase : IPlugin
    {
        private readonly Type _pluginType;

        protected PluginBase(Type pluginType)
        {
            _pluginType = pluginType;
        }

        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new ArgumentNullException(nameof(serviceProvider));
            }

            var context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var localPluginContext = new LocalPluginContext(
                context,
                (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory)),
                (ITracingService)serviceProvider.GetService(typeof(ITracingService)));

            try
            {
                ExecuteDataversePlugin(localPluginContext);
            }
            catch (Exception exception)
            {
                localPluginContext.TracingService.Trace("{0}: {1}", _pluginType.FullName, exception);
                throw;
            }
        }

        protected abstract void ExecuteDataversePlugin(ILocalPluginContext localPluginContext);

        private sealed class LocalPluginContext : ILocalPluginContext
        {
            public LocalPluginContext(
                IPluginExecutionContext pluginExecutionContext,
                IOrganizationServiceFactory orgSvcFactory,
                ITracingService tracingService)
            {
                PluginExecutionContext = pluginExecutionContext;
                OrgSvcFactory = orgSvcFactory;
                TracingService = tracingService;
            }

            public IPluginExecutionContext PluginExecutionContext { get; }
            public IOrganizationServiceFactory OrgSvcFactory { get; }
            public ITracingService TracingService { get; }
        }
    }
}
