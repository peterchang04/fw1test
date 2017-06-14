component {

	public any function init( fw ) {
		variables.fw = fw;
		return this;
	}
	
	public query function get(product_category_id="",id="") {
		local.q = new Query();
		local.q.setDatasource('fw1db');
		local.sql = "

			select
			product.id,
			product.title,
			product.description,
			product.image,
			product.price,
			product.product_category_id
			from product
			inner join product_category on product_category.id = product.product_category_id
				and product_category.active = 1
			where product.active = 1

		";

		if(arguments.product_category_id != ""){
			local.sql = local.sql & "and product.product_category_id = :product_category_id";
			local.q.addParam(name="product_category_id",value=arguments.product_category_id,CFSQLTYPE="CF_SQL_VARCHAR");
		}

		if(arguments.id != ""){
			local.sql = local.sql & "and product.id = :id";
			local.q.addParam(name="id",value=arguments.id,CFSQLTYPE="CF_SQL_VARCHAR");
		}

		local.q.setSQL(local.sql);

		return local.q.execute().getResult();
	}

	public string function save() {
		if(arguments.id == ""){
			return _create(argumentCollection=arguments).id;
		}
		return _update(argumentCollection=arguments).id;
	}

	private query function _create(id="",title="",description="",price="",image="",product_category_id="") {
		local.q = new Query();
		local.q.setDatasource('fw1db');
		local.q.setSQL("

			declare @newID uniqueidentifier = newID();

			insert into product(id, title, description, price, image, product_category_id, active, created_on, modified_on)
			values (@newID, :title, :description, :price, :image, :product_category_id, 1, getDate(), getDate());

			select @newID as id;

		");

		local.q.addParam(name="title",value=arguments.title,CFSQLTYPE="CF_SQL_VARCHAR");
		local.q.addParam(name="description",value=arguments.description,CFSQLTYPE="CF_SQL_VARCHAR");
		local.q.addParam(name="price",value=arguments.price,CFSQLTYPE="CF_SQL_DECIMAL");
		local.q.addParam(name="image",value=arguments.image,CFSQLTYPE="CF_SQL_VARCHAR");
		local.q.addParam(name="product_category_id",value=arguments.product_category_id,CFSQLTYPE="CF_SQL_VARCHAR");

		return local.q.execute().getResult();
	}

	private query function _update(id,title,description,price,image,product_category_id) {
		local.q = new Query();
		local.q.setDatasource('fw1db');
		local.q.setSQL("

			declare @newID uniqueidentifier = :id

			update product 

			set title = :title, 
			description = :description,
			price = :price, 
			image = :image,
			product_category_id = :product_category_id
			where active = 1
			and id = :id

			select @newID as id;

		");

		local.q.addParam(name="id",value=arguments.id,CFSQLTYPE="CF_SQL_VARCHAR");
		local.q.addParam(name="title",value=arguments.title,CFSQLTYPE="CF_SQL_VARCHAR");
		local.q.addParam(name="description",value=arguments.description,CFSQLTYPE="CF_SQL_VARCHAR");
		local.q.addParam(name="price",value=arguments.price,CFSQLTYPE="CF_SQL_DECIMAL");
		local.q.addParam(name="image",value=arguments.image,CFSQLTYPE="CF_SQL_VARCHAR");
		local.q.addParam(name="product_category_id",value=arguments.product_category_id,CFSQLTYPE="CF_SQL_VARCHAR");

		return local.q.execute().getResult();
	}


	public query function getCategories() {
		local.q = new Query();
		local.q.setDatasource('fw1db');
		local.q.setcachedwithin(createTimeSpan(0,1,0,0));
		local.q.setSQL("

			select
			product_category.id,
			product_category.title,
			count(product.id) as product_count
			from product_category
			left join product on product.product_category_id = product_category.id
				and product.active = 1
			where product_category.active = 1
			group by product_category.id, product_category.title

		"); 

		return local.q.execute().getResult();
	}

	public boolean function delete(id="") {
		if(arguments.id == ""){
			return false;
		}
		local.q = new Query();
		local.q.setDatasource('fw1db');
		local.q.setSQL("

			update product
			set product.active = 0
			where product.active = 1
			and product.id = :id

		");
		local.q.addParam(name="id",value=arguments.id,CFSQLTYPE="CF_SQL_VARCHAR");

		local.result = local.q.execute().getResult();

		return true;
	}
}