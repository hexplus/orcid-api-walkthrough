var wizardNgModule = angular.module('wizardApp',['ngCookies','ngResource'])
.config(['$locationProvider', '$resourceProvider', function($locationProvider, $resourceProvider) {
        $locationProvider.html5Mode(true);
		$resourceProvider.defaults.stripTrailingSlashes = true;
    }]);
