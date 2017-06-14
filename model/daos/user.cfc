component {

	public any function init( fw ) {
		variables.fw = fw;
		return this;
	}
	
	public string function getLoginUser(email,password) {
		local.q = new Query();
		local.q.setDatasource('fw1db');
		local.q.setSQL("

			select top 1
			[user].id
			from [user]
			where [user].active = 1
			and [user].password = 'welcome'
			and [user].email = :email

		"); // password hardcoded for now

		local.q.addParam(name="email",value=arguments.email,CFSQLTYPE="CF_SQL_VARCHAR");

		local.users = local.q.execute();

		return local.users.getResult().id;
	}
}