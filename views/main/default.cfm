<cfoutput>
	<cfset rc.title = "Browsing View" />	<!--- set a variable to be used in a layout --->
	<p>This is the browsing view</p>
	<!--- use the named result from the service call --->
	<p><a href="#buildURL('main.setup')#">Setup</a>!</p>
</cfoutput>