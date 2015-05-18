wizardNgModule.controller('stepsController', ['$scope','wizardSrvc','$location', function($scope, wizardSrvc, $location){
	$scope.steps = [
		{'title' : 'Introduction'},
		{'title' : 'Description'},
		{'title' : 'Technologies'},
		{'title' : 'Get access token'},
		{'title' : 'Get token'},
		{'title' : 'Read record'},
		{'title' : 'Update record'}
	];
	
	$scope.init = function() {
		var code = $location.search()['code'];
		if (code === undefined || code === null) {
			console.log('Nothing here');
		} else {
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
		$scope.form.client_id = '0000-0003-3064-5929';
	}

	$scope.authString = "http://[api_url]/oauth/authorize?client_id=[client_id]&response_type=code&redirect_uri=[redirect_uri]&scope=[scope]";
	$scope.wizardSrvc = wizardSrvc;

	$scope.getAuthorizationCode = function() {

		// Build the string
		var apiUri = $scope.authString;

		apiUri = apiUri.replace('[api_url]', 'qa.orcid.org');
		apiUri = apiUri.replace('[client_id]', $scope.form.client_id);
		apiUri = apiUri.replace('[redirect_uri]', 'http://' + location.hostname + ':8000');
		apiUri = apiUri.replace('[scope]', $scope.form.scope);
		
		console.log(apiUri);

		// Save values in cookies so we can use them later
		$cookies.put('current', $scope.wizardSrvc.current); //Current Wizard location
		$cookies.put('orcid_oauth2_client_id', $scope.form.client_id);
		$cookies.put('orcid_oauth2_redirect_uri', 'http://' + location.hostname+ ':8000');

		
		setTimeout(function() {
			window.location.href = apiUri;
		}, 125);

	};


}]);

wizardNgModule.controller('tokenController', ['$scope','$location', '$cookies', function($scope, $location, $cookies){

	/* THIS CONTROLLER NEEDS TO BE UPDATED */

	$scope.access_code = null;
	$scope.client_id = null;
	
	$scope.getCode = function() {
		$scope.access_code = $location.search()['code'];
		$scope.client_id = $cookies.get('orcid_oauth2_client_id');																			
		console.log($scope.access_code);
		console.log($scope.client_id);
		// If the code is not specified, return the view
		// to the root view
		if ($scope.access_code === undefined || $scope.access_code === null) {
			$location.path("/");
		}
	};

	$scope.exchangeCode = function() {		
		
		$http({
		   	url:'http://pub.qa.orcid.org/oauth/token',
		    method:'post',
		    headers: {'Content-Type': 'application/x-www-form-urlencoded',
		              'Accept': 'application/json',
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
					client_id:'0000-0003-3064-5929',
	                client_secret:'20877677-5001-4d86-820e-5f527aa9bd14',
	                grant_type:'authorization_code',
	                redirect_uri:'http://localhost:8080/orcid-api-walkthrough/',
				    code:$scope.access_code
			}})
			.success (function(data){	
		  		console.log(data);
			})
			.error(function(data, status, headers, config){
		        console.log("***OOPS "+status + " H: "+ angular.toJson(data));
		});																							
	};

	$scope.getCode();
}]);



/*

  REVIEW


OauthController.controller("IntroductionController", [ '$scope', '$http','$routeParams', '$location',
	function($scope, $http, $routeParams, $location) {
		var code = $location.search()['code'];
		if (code === undefined || code === null) {
			$location.path("/");
		} else {
			$location.path("/get_token");
		}
	} 
]); */