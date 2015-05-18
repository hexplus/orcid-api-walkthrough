var wizardNgModule = angular.module('wizardApp',['ngCookies'])
.config(['$locationProvider', function($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);
