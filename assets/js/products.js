var Products = {
	init:function(){
		var $delete = $('.product .btn.delete');
		var $edit = $('.product .btn.edit');

		$delete.off('click.fw1').on('click.fw1',function(){
			Products.showDelete(this);
		});

		$edit.off('click.fw1').on('click.fw1',function(){
			Products.edit(this);
		});
	},
	delete:function(productID){
		var $product = $('[productid='+productID+']');
		if(!productID || $product.length === 0){throw "invalid productID!";}

		Main.ajaxInvoke('productDao.delete',{id:productID},function(data){
			$product.fadeOut(function(){
				$product.remove();
			});
		});
	},
	showDelete:function(el){
		var productID = $(el).closest('.product').attr('productid');

		toastr.options = {
			"closeButton": true,
			"debug": false,
			"newestOnTop": false,
			"progressBar": true,
			"positionClass": "toast-top-center",
			"showDuration": "300",
			"hideDuration": "1000",
			"timeOut": "5000",
			"extendedTimeOut": "1000",
			"showEasing": "swing",
			"hideEasing": "linear",
			"showMethod": "fadeIn",
			"hideMethod": "fadeOut"
		}
		toastr["error"]("<button class='btn btn-sm' onclick='Products.delete(\""+productID+"\");'>Make it So</button>", "Delete this item?")
	},
	edit:function(el){
		var productID = $(el).closest('.product').attr('productID').replace(' ','');
		var $product = $('[productid='+productID+']');
		if(!productID || $product.length === 0){throw "invalid productID!";}

		$product.css({opacity:.5});
		Main.ajaxRender('productView.renderProductEdit',{id:productID},function(data){
			$product.replaceWith(data);
			Products.initEdit();
		});
	},
	initEdit:function(){
		$('.product-edit input:first').on('change',function(){
			// reload the photo as preview with new link
			var $caption = $(this).closest('div.caption');
			$caption.prev().attr('src',$(this).val());
		});
		EasyValidate.init();
	},
	save:function(button){
		var $form = $(button).closest('.product-edit').find('form');
		var $product = $form.closest('.product-edit');
		var valid = true;
		var package = {};

		// manually validate each field
		var $image = $form.find('[name=image]');
		if($image.val() === ""){
			valid = false;
			$image.addClass('validationFailed');
			setTimeout(function(){
				$image.removeClass('validationFailed');
			},3000)
		} else{
			package.image = $image.val();
		}
		var $title = $form.find('[name=title]');
		if($title.val() === ""){
			valid = false;
			$title.addClass('validationFailed');
			setTimeout(function(){
				$title.removeClass('validationFailed');
			},3000);
		} else{
			package.title = $title.val();
		}
		var $price = $form.find('[name=price]');
		if($price.val() === ""){
			valid = false;
			$price.addClass('validationFailed');
			setTimeout(function(){
				$price.removeClass('validationFailed');
			},3000);
		} else{
			package.price = $price.val();
		}
		var $category = $form.find('[name=product_category_id]');
		package.product_category_id = $category.val();
		var $description = $form.find('[name=description]');
		package.description = $description.val();
		var $id = $form.find('[name=id]');
		package.id = $id.val();

		if(valid){
			Main.ajaxInvoke('productDao.save',package,function(productID){
				Main.ajaxRender('productView.renderProduct',{edit:"true",id:productID,title:"",description:"",price:"",product_category_id:"",image:""},function(data){
					$product.replaceWith(data);
					Products.init();
				});
			});
		}
	},
	add:function(){
		Main.ajaxRender('productView.renderProductEdit',{id:"00000000-0000-0000-0000-000000000000",title:"",description:"",price:"",product_category_id:"",image:""},function(data){
			$('.btn.add').before(data);
			Products.init();
			Products.initEdit();
			$('[name=title]:first').focus();
		});
	}
}

$(function(){
	Products.init();
})