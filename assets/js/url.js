var URL = (function(){
	var current = document.URL;

	function toStruct(){
		var result = {};
		var urlSplit = current.split('?');
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

		// solve for domain
		result.protocol = result.root.split('://')[0];
		result.domain = result.root.split('://')[1].split("/")[0];
		result.domainRoot = result.protocol + "://" + result.domain;
		return result;
	}

	function toURL(struct){
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
	}

	function removeValue(key){
		var struct = toStruct();
		delete struct.params[key];
		current = toURL(struct);
		set();
	}

	function setValue(key, value, noCommit){
		var noCommit = noCommit || false;
		var value = value || "";
		var struct = toStruct();
		struct.params[key] = value;
		current = toURL(struct);
		if(!noCommit){
			set();
		}
	}

	function set(){
		try{
			window.history.replaceState({},'',current);
		}catch(e){
			/*do nothing*/
		}
	}

	return {
		setValue:setValue,
		removeValue:removeValue,
		toStruct:toStruct
	}
})();