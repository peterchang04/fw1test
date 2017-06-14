var Main = (function(){
	function render(componentMethod,args,success,error){
		var urlStruct = URL.toStruct();
		$.ajax({
			url:urlStruct.domainRoot + '/fw1test/index.cfm?action=remote.ajax&component='+componentMethod.split('.')[0]+'&method='+componentMethod.split('.')[1],
			data:args,
			method:"POST",
			error:function(e){
				console.log(e);
				if(typeof error === 'function'){
					error(e);
				}
			},
			success:function(data){
				if(typeof success === 'function'){
					success(data);
				}
			}
		});
	}

	function invoke(componentMethod,args,success,error){
		var urlStruct = URL.toStruct();
		$.ajax({
			url:urlStruct.domainRoot + '/fw1test/index.cfm?action=remote.ajax&component='+componentMethod.split('.')[0]+'&method='+componentMethod.split('.')[1],
			data:args,
			method:"POST",
			dataType:"json",
			error:function(e){
				if(typeof success === 'function'){
					success(e.responseText);
				}
			},
			success:function(data){
				if(typeof success === 'function'){
					success(data);
				}
			}
		});
	}

	return {
		ajaxRender:render,
		ajaxInvoke:invoke
	}
})();