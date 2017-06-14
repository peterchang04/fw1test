-- LOGIN : fw1
-- PW : welcome

/**** USER ****/

use [fw1db]

if not exists (
	select column_name
	from information_schema.columns
	where table_name = 'User'
)
begin
	CREATE TABLE [dbo].[User] (
		[ID] [uniqueidentifier] NOT NULL,
		[Email] nvarchar(500) NOT NULL,
		[Password] nvarchar(500) NOT NULL,
		[Active] [bit] NULL,
		[Created_On] [datetime] NULL,
		[Created_By] [uniqueidentifier] NULL,
		[Modified_On] [datetime] NULL,
		[Modified_By] [uniqueidentifier] NULL,
		CONSTRAINT [PK_User] PRIMARY KEY CLUSTERED ([ID] ASC) WITH (
			PAD_INDEX  = OFF, 
			STATISTICS_NORECOMPUTE  = OFF, 
			IGNORE_DUP_KEY = OFF, 
			ALLOW_ROW_LOCKS  = ON, 
			ALLOW_PAGE_LOCKS  = ON
		) ON [PRIMARY]
	) ON [PRIMARY]
end

/**** PRODUCT_CATEGORY ****/
if not exists (
	select column_name
	from information_schema.columns
	where table_name = 'Product_Category'
)
begin
	CREATE TABLE [dbo].[Product_Category] (
		[ID] [uniqueidentifier] NOT NULL,
		[Title] nvarchar(500) NOT NULL,
		[Active] [bit] NULL,
		[Created_On] [datetime] NULL,
		[Created_By] [uniqueidentifier] NULL,
		[Modified_On] [datetime] NULL,
		[Modified_By] [uniqueidentifier] NULL,
		CONSTRAINT [FK_Product_Category_Created_By] FOREIGN KEY (Created_By) REFERENCES [User](ID),
		CONSTRAINT [FK_Product_Category_Modified_By] FOREIGN KEY (Modified_By) REFERENCES [User](ID),
		CONSTRAINT [PK_Product_Category] PRIMARY KEY CLUSTERED ([ID] ASC) WITH (
			PAD_INDEX  = OFF, 
			STATISTICS_NORECOMPUTE  = OFF, 
			IGNORE_DUP_KEY = OFF, 
			ALLOW_ROW_LOCKS  = ON, 
			ALLOW_PAGE_LOCKS  = ON
		) ON [PRIMARY]
	) ON [PRIMARY]

	insert into product_category(id, title, active, created_on, modified_on)
	values (newID(), 'Jewellery', 1, getDate(), getDate())
	insert into product_category(id, title, active, created_on, modified_on)
	values (newID(), 'Apparel', 1, getDate(), getDate())
	insert into product_category(id, title, active, created_on, modified_on)
	values (newID(), 'Furniture', 1, getDate(), getDate())
	insert into product_category(id, title, active, created_on, modified_on)
	values (newID(), 'Art', 1, getDate(), getDate())
end

/**** PRODUCT ****/
if not exists (
	select column_name
	from information_schema.columns
	where table_name = 'Product'
)
begin
	CREATE TABLE [dbo].[Product] (
		[ID] [uniqueidentifier] NOT NULL,
		[Title] nvarchar(500) NOT NULL,
		[Description] nvarchar(500) NOT NULL,
		[Image] nvarchar(500) NOT NULL,
		[Price] decimal not null,
		[Product_Category_ID] [uniqueidentifier],
		[Active] [bit] NULL,
		[Created_On] [datetime] NULL,
		[Created_By] [uniqueidentifier] NULL,
		[Modified_On] [datetime] NULL,
		[Modified_By] [uniqueidentifier] NULL,
		CONSTRAINT [FK_Product_Product_Category] FOREIGN KEY (Product_Category_ID) REFERENCES Product_Category(ID),
		CONSTRAINT [FK_Product_Created_By] FOREIGN KEY (Created_By) REFERENCES [User](ID),
		CONSTRAINT [FK_Product_Modified_By] FOREIGN KEY (Modified_By) REFERENCES [User](ID),
		CONSTRAINT [PK_Product] PRIMARY KEY CLUSTERED ([ID] ASC) WITH (
			PAD_INDEX  = OFF, 
			STATISTICS_NORECOMPUTE  = OFF, 
			IGNORE_DUP_KEY = OFF, 
			ALLOW_ROW_LOCKS  = ON, 
			ALLOW_PAGE_LOCKS  = ON
		) ON [PRIMARY]
	) ON [PRIMARY]
end

