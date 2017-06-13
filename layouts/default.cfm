<html>
	<head>
		<!--- title set by a view - there is no default --->
		<title>FW/1 Skeleton - <cfoutput>#rc.title#</cfoutput></title>
	</head>
	<body>
		<h1>FW/1 Default Layout</h1>

		<!--- Messages --->
		<cfif structKeyExists(session,"message") and session.message neq "">
			<cfoutput><div>#session.message#</div></cfoutput>
			<cfset session.message = "" />
		</cfif>

		<cfoutput>#body#</cfoutput>	<!--- body is result of views --->

		<p style="font-size: small;">
			Powered by FW/1 version <cfoutput>#variables.framework.version#</cfoutput>.<br />
			This request took <cfoutput>#getTickCount() - rc.startTime#</cfoutput>ms.
		</p>

		<button type="button" onclick="reloadTrue();">RELOAD</button>

		<script>
			var reloadTrue = function(){
				URL.setValue('reload','true');
				location.reload();
			};

			URL = {
				current:document.URL,
				toStruct:function(){
					var result = {};
					var urlSplit = URL.current.split('?');
					result.root = urlSplit[0]; // set the root path
					result.params = {};
					
					// set the arguments
					var args = "";
					if(urlSplit.length > 1){
						args = urlSplit[1];
					}
					var argSplit = args.split('&');
					for(var i = 0; i < argSplit.length; i++){
						if(argSplit[i].length > 1){
							var thisKey = "";
							var thisValue = "";
							var thisSplit = argSplit[i].split('=');
							thisKey = thisSplit[0];
							if(thisSplit.length > 1){
								thisValue = thisSplit[1];
							}
							result.params[thisKey] = thisValue;
						}
					}
					return result;
				},
				toURL:function(struct){
					var result = struct.root;
					for(var key in struct.params){
						if(result.indexOf('?') == -1){
							result += '?';
						} else {
							result += '&';
						}
						result = result + key;
						if(struct.params[key] != ""){
							result = result + '=' + struct.params[key];
						}
					}
					return result;
				},
				removeValue:function(key){
					var struct = URL.toStruct();
					delete struct.params[key];
					URL.current = URL.toURL(struct);
					URL.set();
				},
				setValue:function(key,value,noCommit){
					var noCommit = noCommit || false;
					var value = value || "";
					var struct = URL.toStruct();
					struct.params[key] = value;
					URL.current = URL.toURL(struct);
					if(!noCommit){
						URL.set();
					}
				},
				set:function(){
					try{
						window.history.replaceState({},'',URL.current);
					}catch(e){
						/*do nothing*/
					}
				}
			};
		</script>
	</body>
</html>