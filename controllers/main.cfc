component accessors="true" {

	property beanFactory;
	property formatterService;
	property authService;
	property userDao;
	property productDao;
	
	public any function init( fw ) {
		variables.fw = fw;
		return this;
	}
	
	/* Page methods */
	public void function default( rc ) {
	}

	public void function setup(rc){
		// check for valid session
		if(structKeyExists(session,"userID") && len(session.userID) == 36){
			rc.message = "Welcome!";
		} else {
			variables.fw.redirect('main.login');
		}

		// proceed
	}

	/* User Actions */
	public void function authenticate(rc){
		local.result = variables.authService.authenticate(argumentCollection=rc);

		if(!local.result){
			session.message = "Login Failed";
			variables.fw.redirect('main.login');
		} else{
			session.message = "Login Successful";
			variables.fw.redirect('main.setup');
		}
	}

	public void function logout(rc){
		session.message = "Logged Out";
		session.userID = "";
		variables.fw.redirect('main.default');
	}

	public void function saveProduct(rc){
		rc.users = variables.userDao.get();
		writeDump(rc.users);
		writedump('Hello');
		abort();
	}
}
