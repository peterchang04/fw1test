(function(){
	var $filters = $('#filters');
	var $links = $filters.find('a');
	var categoryID = "";

	var queryProducts = _.debounce(function(){
		$('#products').css({opacity:.5});
		Main.ajaxRender('productView.renderList',{product_category_id:categoryID},function(data){
			$('#products').replaceWith(data).animate({opacity:1});
		});
	},500);

	var toggleCategory = function($el){
		// clear active
		
		if($el.hasClass('active')){
			$el.removeClass('active').blur();
			categoryID = "";
		} else {
			$links.removeClass('active');
			$el.addClass('active');
			categoryID = $el.attr('categoryID');
		}

		queryProducts();
	};

	// attach event
	$links.on('click',function(){
		toggleCategory($(this));
	});
})();
