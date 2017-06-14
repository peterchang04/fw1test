<cfoutput>
	<html>
		<head>
			<!--- title set by a view - there is no default --->
			<title>Peter FW/1</title>

			<cfinclude template="_css.cfm" />
		</head>
		<body>
			<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
				<div class="container">
					<!-- Brand and toggle get grouped for better mobile display -->
					<div class="navbar-header">

					<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="##bs-example-navbar-collapse-1">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>

					<a class="navbar-brand" href="#buildURL('main.default')#">Peter FW/1</a>
					
					</div>
					<!-- Collect the nav links, forms, and other content for toggling -->
					<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
						<ul class="nav navbar-nav">
							<li>
								<cfif rc.page eq "product">
									<a href="##" class="active">Products</a>
								<cfelse>
									<a href="#buildURL('main.default')#">Products</a>
								</cfif>
							</li>
							<li>
								<cfif rc.page eq "setup" or rc.page eq "login">
									<a href="##" class="active">Setup</a>
								<cfelse>
									<a href="#buildURL('main.setup')#">Setup</a>
								</cfif>
							</li>
						</ul>

						<cfif structKeyExists(session,"userID") and len(session.userID) eq 36>
							<form id="logButton" action="#buildURL('main.logout')#" method="POST">
								<button type="submit" class="btn btn-sm">Sign Out</button>
							</form>
						<cfelse>
							<form id="logButton" action="" method="POST">
								<a href="#buildURL('main.login')#"><button type="button" class="btn btn-sm">Sign In</button></a>
							</form>
						</cfif>
					</div>
				</div>
			</nav>

			#body#	<!--- body is result of views --->

			<button type="button" style="position:fixed; bottom:5px; left:5px;" onclick="reloadTrue();">RELOAD</button>

			<script>
				var reloadTrue = function(){
					URL.setValue('reload','true');
					location.reload();
				};
			</script>

			<cfinclude template="_javascript.cfm" />

			<!--- Messages --->
			<cfif structKeyExists(session,"message") and session.message neq "">
				<script>
					toastr.options = {
						"closeButton": false,
						"debug": false,
						"newestOnTop": false,
						"progressBar": true,
						"positionClass": "toast-top-right",
						"preventDuplicates": false,
						"onclick": null,
						"showDuration": "300",
						"hideDuration": "1000",
						"timeOut": "4000",
						"extendedTimeOut": "1000",
						"showEasing": "swing",
						"hideEasing": "linear",
						"showMethod": "fadeIn",
						"hideMethod": "fadeOut"
					}
					toastr.warning("#session.message#");
				</script>
				<cfset session.message = "" />
			</cfif>
		</body>
	</html>
</cfoutput>