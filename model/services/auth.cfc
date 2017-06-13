component accessors="true" {

	property beanFactory;
	property userDao;
	
	public boolean function authenticate(email="", password="") {
		if(arguments.email == "" || arguments.password == ""){
			return false;
		}

		local.userID = variables.userDao.getLoginUser(argumentCollection=arguments);

		if(len(local.userID) == 36){
			session.userID = local.userID;
			return true;
		}
		
		return false;
	}
	
}
