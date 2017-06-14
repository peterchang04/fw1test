<cfoutput>
	<cfset rc.page = "product" />	<!--- set a variable to be used in a layout --->

	<div class="container">
		#rc.productView.renderFilters(argumentCollection=rc)#
		#rc.productView.renderList(argumentCollection=rc)#
	</div>

</cfoutput>