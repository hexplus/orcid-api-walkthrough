var wizardNgModule = angular.module('wizardApp',['ngCookies','ngResource'])
.config(['$locationProvider', '$resourceProvider', function($locationProvider, $resourceProvider) {
        $locationProvider.html5Mode(true);
		$resourceProvider.defaults.stripTrailingSlashes = true;
    }]);

wizardNgModule.controller('stepsController', ['$scope','wizardSrvc','$location', function($scope, wizardSrvc, $location){
	$scope.steps = [
		{'title' : 'Introduction'},
		{'title' : 'Accessing the API'},
		{'title' : 'Using the API'},
		{'title' : 'Get access token'},
		{'title' : 'Get token'},
		{'title' : 'Show token'},
		{'title' : 'Read record'},
		{'title' : 'Update record'}
	];
	
	$scope.init = function() {
		var code = $location.search()['code'];

		if (code === undefined || code === null) {
			console.log('Nothing here');
		} else {
			//strip extra characters from code
			code = code.substr(0,6);
			$scope.wizardSrvc.current = 4;
		}
	}
	
	$scope.wizardSrvc = wizardSrvc;
	$scope.init();
}]);

wizardNgModule.controller('controlsController', ['$scope', 'wizardSrvc', function($scope, wizardSrvc){
	$scope.wizardSrvc = wizardSrvc;

	$scope.next = function(){
		wizardSrvc.next();
	}

	$scope.finish = function(){
		wizardSrvc.finish();
	}

	$scope.back = function(){
		wizardSrvc.back();
	}
}]);

wizardNgModule.controller('authorizationCodeController', ['$scope','$cookies', 'wizardSrvc', function($scope, $cookies, wizardSrvc){
	
	/* Only for dev environment */
	if (location.hostname == 'localhost'){
		$scope.form = {};
		$scope.form.client_id = 'APP-1X454QYQ66U6XW7X';
	}

	$scope.authString = "http://[api_url]/oauth/authorize?client_id=[client_id]&response_type=code&redirect_uri=[redirect_uri]&scope=[scope]";
	$scope.wizardSrvc = wizardSrvc;

	$scope.getAuthorizationCode = function() {

		// Build the string
		var apiUri = $scope.authString;

		apiUri = apiUri.replace('[api_url]', 'sandbox.orcid.org');
		apiUri = apiUri.replace('[client_id]', $scope.form.client_id);
		apiUri = apiUri.replace('[redirect_uri]', 'http://' + location.hostname + ':8000');
		apiUri = apiUri.replace('[scope]', '/activities/read-limited /activities/update /orcid-profile/read-limited');
		
		console.log(apiUri);

		// Save values in cookies so we can use them later
		//Current Wizard location
		$cookies.put('current', $scope.wizardSrvc.current); 
		$cookies.put('orcid_oauth2_client_id', $scope.form.client_id);
		$cookies.put('orcid_oauth2_redirect_uri', 'http://' + location.hostname+ ':8000');

		
		setTimeout(function() {
			window.location.href = apiUri;
		}, 125);

	};
}]);

wizardNgModule.controller('tokenController', ['$scope','$location', '$cookies', '$http', function($scope, $location, $cookies, $http){

	$scope.show_access_token=false;
	$scope.expires_in=false;
	$scope.name=false;
	$scope.orcid=false;
	$scope.scope=false;
	$scope.token_type=false;
	$scope.access_token=null;
	$scope.user_orcid=null;
	$scope.access_code = null;
	$scope.client_id = null;
	$scope.show_xml=false;
	
	/* Only for dev environment */
	if (location.hostname == 'localhost'){
		$scope.client_secret = '8fa38bea-48e2-4238-9479-e55448ffa225';
	}	
		
	$scope.getCode = function() {
		
		$scope.access_code = $location.search()['code'];
		$scope.client_id = $cookies.get('orcid_oauth2_client_id');																			
		// If the code is not specified, return the view
		// to the root view
		if ($scope.access_code === undefined || $scope.access_code === null) {
			$location.path("/");
		} else{
			//strip extra characters from code
			var rawCode = $location.search()['code'];
			$scope.access_code = rawCode.substr(0,6);
		}
	};

	$scope.exchangeCode = function() {	
		$http({
		   	url:'http://pub.sandbox.orcid.org/oauth/token',
		    method:'post',
		    headers: {'Content-Type': 'application/x-www-form-urlencoded',
		              'Accept': 'application/json'
		    },
		    transformRequest: function(obj) {
		       var str = [];
		       for(var p in obj)
		       str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		       var foo= str.join("&");
		       console.log ("****RETURNING "+foo);
		       return foo;
		    },
		    data: {
					client_id: $scope.client_id,
	                client_secret: $scope.client_secret,
	                grant_type:'authorization_code',
	                redirect_uri:'http://localhost:8000',
				    code:$scope.access_code
			}})
			.success (function(data){			  		
				$scope.wizardSrvc.current = 5;
				$scope.token = data;
				$scope.access_token = data.access_token;
				$scope.user_orcid = data.orcid;
			})
			.error(function(data, status, headers, config){
		        console.log("***OOPS "+status + " H: "+ angular.toJson(data));
		});																							
	};
	
	$scope.show = function(divId) {
		$scope.show_access_token=false;
		$scope.show_expires_in=false;
		$scope.show_name=false;
		$scope.show_orcid=false;
		$scope.show_scope=false;
		$scope.show_token_type=false;
		console.log(divId)
		switch(divId) {
			case 'token':
				$scope.show_access_token=true;
				break;
			case 'expiration':
				$scope.show_expires_in=true;
				break; 
			case 'name':
				$scope.show_name=true;
				break;
			case 'orcid':
				$scope.show_orcid=true;
				break;
			case 'scope':
				$scope.show_scope=true;
				break;
			case 'type':
				$scope.show_token_type=true;
				break;
			
		}
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	$scope.readRecord = function() {
		$scope.show_xml=true;				
	};

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	$scope.getCode();
}]);


wizardNgModule.service('wizardSrvc', ['$rootScope', function($rootScope){

	var srv = {
		current: 0, 
		elements: document.getElementsByClassName("step"),
		back: function(){
			if(srv.current > 0){
				srv.current--;
			}
		},
		next: function(){
			if(srv.current == srv.elements.length -1){
				srv.current = 0;	
			}else{
				srv.current++;
			}
		},
		finish: function(){
			srv.current = 0;
		}
	};

	return srv;
}]);