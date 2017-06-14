<cfoutput>
	<cfset rc.page = "setup" />	<!--- set a variable to be used in a layout --->

	<div class="container">
		#rc.productView.renderList(argumentCollection=rc,edit=true)#
	</div>

</cfoutput>