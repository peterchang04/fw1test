<cfoutput>
	<cfset rc.title = "Browsing View" />	<!--- set a variable to be used in a layout --->
	<p>This is the login view</p>
	<!--- use the named result from the service call --->
	<p><a href="#buildURL('main.setup')#">Setup</a>!</p>

	<form action="#buildURL('main.authenticate')#" method="POST">
		<input name="email" type="text" placeholder="email : peter.chang.04@gmail.com" value="peter.chang.04@gmail.com" />
		<input name="password" type="password" placeholder="password : welcome" value="welcome" />
		<button type="submit" name="login">Log In</button>
	</form>
</cfoutput>