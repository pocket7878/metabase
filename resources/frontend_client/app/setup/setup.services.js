'use strict';

var SetupServices = angular.module('corvus.setup.services', ['ngResource', 'ngCookies']);

SetupServices.factory('Setup', ['$resource', '$cookies', function($resource, $cookies) {
    return $resource('/api/setup/user', {}, {
        create_user: {
            method: 'POST'
        }
    });
}]);
