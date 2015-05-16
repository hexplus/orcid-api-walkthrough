wizardNgModule.controller('name', ['$scope', function($scope){
	
}]);



wizardNgModule.service('wizard', ['$scope', function($scope){
	
}])


/*
OauthController.controller("IntroductionController", [ '$scope', '$http','$routeParams', '$location',
	function($scope, $http, $routeParams, $location) {
		var code = $location.search()['code'];
		if (code === undefined || code === null) {
			$location.path("/");
		} else {
			$location.path("/get_token");
		}
	} 
]);

OauthController.controller("GetPermissionsController",['$scope','$http','$cookies',function GetCodeController($scope, $http, $cookies) {
	$scope.authString = "http://[api_url]/oauth/authorize?client_id=[client_id]&response_type=code&redirect_uri=[redirect_uri]&scope=[scope]";
	
	$scope.load = function() {
		console.log("In get code controller");
	}
	
	$scope.getCode = function() {
		// Build the string
		var apiUri = $scope.authString;
		apiUri = apiUri.replace('[api_url]',
				'qa.orcid.org');
		apiUri = apiUri.replace('[client_id]',
				$scope.form.client_id);
		apiUri = apiUri
				.replace('[redirect_uri]',
						'http://localhost:8080/orcid-api-walkthrough/');
		apiUri = apiUri.replace('[scope]',
				$scope.form.scope);
		console.log(apiUri);

		// Save values in cookies so we can use
		// them later
		$cookies.put('orcid_oauth2_client_id',
				$scope.form.client_id);
		$cookies
				.put(
						'orcid_oauth2_redirect_uri',
						'http://localhost:8080/orcid-api-walkthrough/');

		setTimeout(function() {
			window.location.href = apiUri;
		}, 125);
	};

	$scope.load();
} ]);

OauthController.controller("GetTokenController",['$scope','$http','$location','$cookies',function($scope, $http, $location, $cookies) {

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
		    data: {client_id:'0000-0003-3064-5929',
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
	}
]);
*/