var app = angular.module('busy_list', ['ui.router']);

function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
}

function onFailure(error) {
    console.log(error);
}

function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',
        'longtitle': true,
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state({
            name: 'welcome',
            url: '/welcome',
            templateUrl: 'welcome.html',
            controller: 'WelcomeController'
        })
        .state({
            name: 'welcome.auth-buttons',
            url: '/auth-buttons',
            templateUrl: 'auth-buttons.html',
            controller: 'AuthButtonsController'
        })
        .state({
            name: 'welcome.login',
            url: '/login',
            templateUrl: 'login.html',
            controller: 'LoginController'
        })
        .state({
            name: 'welcome.signup',
            url: '/signup',
            templateUrl: 'signup.html',
            controller: 'SignUpController'
        });
    $urlRouterProvider.otherwise('/welcome');
});


app.controller('IndexController', function($scope, busyListService, $state) {
    $state.go('welcome');
});


app.controller('WelcomeController', function($scope, busyListService, $state) {
    $state.go('welcome.signup');
});

app.controller('AuthButtonsController', function($scope, busyListService, $state) {

});

app.controller('LoginController', function($scope, busyListService, $state) {

});

app.controller('SignUpController', function($scope, busyListService, $state) {

});

app.factory('busyListService', function($http, $state) {
    var service = {};

    return service;
});
