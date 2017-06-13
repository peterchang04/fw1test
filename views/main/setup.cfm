<cfoutput>
	<cfset rc.title = "Setup View" />	<!--- set a variable to be used in a layout --->
	<p>This is the setup view</p>
	<!--- use the named result from the service call --->
	<p><a href="#buildURL('main')#">browse</a>!</p>

	<form action="#buildURL('main.logout')#" method="POST">
		<button type="submit" name="logout">Log Out</button>
	</form>
</cfoutput>