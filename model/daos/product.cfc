component {

	public any function init( fw ) {
		variables.fw = fw;
		return this;
	}
	
	public string function get() {
		local.q = new Query();
		local.q.setDatasource('fw1db');
		local.q.setSQL("

			select
			product.id,
			product.title,
			product.description,
			product.image,
			poduct.price 
			from product
			inner join product_category on product_category.id = product.product_category_id
				and product_category.active = 1
			where product.active = 1

		"); 

		return local.q.execute().getResult();
	}
}