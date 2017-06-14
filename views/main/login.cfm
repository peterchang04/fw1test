<cfoutput>
	<cfset rc.page = "login" />	<!--- set a variable to be used in a layout --->

	<div class="container">
		<div class="row">
			<div class="col-sm-6">
				<form action="#buildURL('main.authenticate')#" method="POST">
					<div class="form-group input-group">
						<span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
						<input 
							class="form-control" 
							type="text" 
							name='email' 
							placeholder="email : peter.chang.04@gmail.com"
						/>
					</div>

					<div class="form-group input-group">
						<span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
						<input class="form-control" type="password" name='password' placeholder="password : welcome"/>
					</div>

					<div class="form-group">
						<button type="submit" class="btn btn-def btn-block">Login</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</cfoutput>