<!--- had to do cfml... see below --->
<cfcomponent accessors="true">
	<cfproperty name="beanfactory" />

	<cffunction name="ajax" access="public" output="false" returntype="void">
		<cfargument name="rc" required="true" />

		<cfset local.cfc = variables.beanFactory.getBean(arguments.rc.component) />
		<cfinvoke 
			component="#local.cfc#" 
			method="#arguments.rc.method#" 
			returnVariable="arguments.rc.result"
			argumentCollection="#arguments.rc#"
		/>

	</cffunction>

	<!--- 
		component accessors="true" {

			property beanFactory;

			public any function init( fw ) {
				variables.fw = fw;
				return this;
			}
			
			/* Page methods */
			public void function ajax( rc ) {
				local.cfc = variables.beanFactory.getBean(rc.component);
				local.method = local.cfc[rc.method];
				rc.result = local.method(argumentCollection=rc);   This was the only way i could find to invoke a dynamic function. However, the invoked function was missing references to its sibling functions

			}
		}
	--->

</cfcomponent>
