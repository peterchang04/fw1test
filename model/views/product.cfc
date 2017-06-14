<cfcomponent accessors="true">
	<cfproperty name="beanfactory" />

	<!--- --->

	<cffunction name="renderFilters" access="public" output="true" returntype="string">

		<cfset local.categories = variables.beanFactory.getBean('productDao').getCategories() />

		<cfsavecontent variable="local.result">
			<div class="col-md-3" id="filters">
                <p class="lead">Categories</p>
                <div class="list-group">
                	<cfloop query="local.categories">
                		<a href="##" categoryID="#local.categories.id#" class="list-group-item">#local.categories.title# (#local.categories.product_count#)</a>
                	</cfloop>
                </div>
            </div>
		</cfsavecontent>

		<cfreturn trim(local.result) />

	</cffunction>

	<!--- --->

	<cffunction name="renderProduct" access="public" output="true" returntype="string">
		<cfargument name="ID" required="true" />
		<cfargument name="title" required="true" />
		<cfargument name="description" required="true" />
		<cfargument name="price" required="true" />
		<cfargument name="image" required="true" />
		<cfargument name="product_category_id" required="true" />
		<cfargument name="edit" required="false" default="false" />

		<!--- load from DB if only ID is passed in --->
		<cfif arguments.id neq "" and arguments.title eq "">
			<cfset local.product = variables.beanFactory.getBean('productDao').get(id=arguments.id) />
			<cfset arguments.title = local.product.title />
			<cfset arguments.description = local.product.description />
			<cfset arguments.price = local.product.price />
			<cfset arguments.image = local.product.image />
			<cfset arguments.product_category_id = local.product.product_category_id />
		</cfif> 

		<cfsavecontent variable="local.result">
			<div class="col-sm-4 col-lg-4 col-md-4 product" productID="#arguments.ID#" title="#arguments.title#">
				<cfif arguments.edit eq true>
					<button class="btn btn-xs edit">edit</button>
					<button class="btn btn-xs btn-danger delete">delete</button>
				</cfif>

				<div class="thumbnail">
					<img src="#arguments.image#" alt="">

					<div class="caption">
						<h4 class="pull-right">$#decimalFormat(arguments.price)#</h4>
						<h4><a href="##">#arguments.title#</a></h4>
						<p>#arguments.description#</p>
					</div>

					<div class="ratings">
						<p class="pull-right">#randrange(2,50)# reviews</p>

						<p>
							<cfloop from="1" to="#randrange(3,5)#" index="local.i">
								<span class="glyphicon glyphicon-star"></span>
							</cfloop>
						</p>
					</div>
				</div>
			</div>
		</cfsavecontent>

		<cfreturn trim(local.result) />

	</cffunction>

	<!--- --->

	<cffunction name="renderList" access="public" output="true" returntype="string">
		<cfargument name="product_category_id" required="false" default="" />
		<cfargument name="edit" required="false" default="false" />
		<cfset local.products = variables.beanFactory.getBean('productDao').get(argumentCollection=arguments) />

		<cfsavecontent variable="local.result">
			<div class="col-md-9" id="products">
				<cfloop query="local.products">
					#renderProduct(
						id=local.products.id,
						title=local.products.title,
						description=local.products.description,
						price=local.products.price,
						image=local.products.image,
						product_category_id=local.products.product_category_id,
						edit=arguments.edit
					)#
				</cfloop>

				<cfif local.products.recordcount eq 0>
					Sorry, No Results
				</cfif>

				<cfif arguments.edit>
					<!--- render a button if there are --->
					<button class="btn btn-primary add" onclick="Products.add();">Add Product</button>
				</cfif>
			</div>
		</cfsavecontent>

		<cfreturn trim(local.result) />

	</cffunction>

	<!--- --->

	<cffunction name="renderEdit" access="public" output="true" returntype="string">
		<cfset local.products = variables.beanFactory.getBean('productDao').get() />
		<cfsavecontent variable="local.result">
			<b>asdfasdf asdfasdf asdfasdf</b>
			<cfdump var="#local.products#">
		</cfsavecontent>

		<cfreturn trim(local.result) />

	</cffunction>

	<!--- --->

	<cffunction name="renderProductEdit" access="public" output="true" returntype="string">
		<cfargument name="ID" required="true" />

		<cfset local.categories = variables.beanfactory.getBean('productDao').getCategories() />

		<cfif arguments.id neq "">
			<cfset local.product = variables.beanFactory.getBean('productDao').get(id=arguments.id) />
		<cfelse>
			<cfset local.product = {
				id="",
				title="",
				description="",
				image="",
				price="",
				product_category_id=""
			} />
		</cfif>

		<cfsavecontent variable="local.result">
			<div class="col-sm-4 col-lg-4 col-md-4 product-edit" productID="#local.product.ID#" title="#local.product.title#">
				<div class="thumbnail">
					<img src="#local.product.image#" alt="">

					<div class="caption" style="height:auto">
						<form>
							<span class="form-label">Image URL</span>
							<input name="image" value="#local.product.image#" type="text" class="form-control input-sm" style="margin-bottom:5px;">
							<span class="form-label">Title</span>
							<input name="title" value="#local.product.title#" type="text" class="form-control input-sm" style="margin-bottom:5px;">
							<span class="form-label">Description</span>
							<textarea name="description" type="text" class="form-control input-sm" style="resize:vertical;margin-bottom:5px;height:100px;">#local.product.description#</textarea>
							<span class="form-label">$ Price</span>
							<input name="price" value="#decimalFormat(local.product.price)#" validate="money,positive" type="text" class="form-control input-sm" style="margin-bottom:5px;">
							<span class="form-label">Category</span>
							<select name="product_category_id" class="form-control input-sm">
								<cfloop query="local.categories">
									<option value="#local.categories.id#" <cfif local.product.product_category_id eq local.categories.id>selected</cfif>>
										#local.categories.title#
									</option>
								</cfloop>
							</select>
							<input type="hidden" name="id" value="#local.product.id#" />
						</form>
					</div>

					<div class="ratings">
						<p><button class="btn btn-primary btn-block" onclick="Products.save(this);">Save</button></p>
					</div>
				</div>
			</div>
		</cfsavecontent>

		<cfreturn trim(local.result) />

	</cffunction>

	<!--- --->

</cfcomponent>