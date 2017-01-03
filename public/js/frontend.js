var app = angular.module('busy_list', ['ui.router', 'ngAnimate', 'hmTouchEvents']);

// Functions to handle login with Google
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
            name: 'index',
            url: '/index',
            templateUrl: 'index.html',
            controller: 'IndexController'
        })
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
            name: 'welcome.signup',
            url: '/signup',
            templateUrl: 'signup.html',
            controller: 'SignUpController'
        })
        .state({
            name: 'welcome.login',
            url: '/login',
            templateUrl: 'login.html',
            controller: 'LoginController'
        })
        .state({
            name: 'index.all_lists',
            url: '/all-lists',
            templateUrl: 'all-lists.html',
            controller: 'AllListsController'
        })
        .state({
            name: 'index.one_list',
            url: '/one-list',
            templateUrl: 'one-list.html',
            controller: 'OneListController'
        });
    $urlRouterProvider.otherwise('/welcome');
});

app.controller('IndexController', function($rootScope, $scope, busyListService, $state, $timeout) {
    $state.go('index.all_lists');
    $scope.className = 'all_lists';
    $rootScope.$on('$stateChangeStart', function(event, newState) {
        $scope.className = newState.name.split('.')[1];
    });
});


app.controller('WelcomeController', function($scope, busyListService, $state) {
    $state.go('welcome.auth-buttons');
});

app.controller('AuthButtonsController', function($scope, busyListService, $state) {

});

app.controller('SignUpController', function($scope, busyListService, $state) {
    $scope.signUp = function(){
        console.log('Clicked signup button');
        busyListService.submitSignUp()
        .success(function(){
            $state.go('index.all_lists');
        })
        .error(function(){
            $scope.loginError = true;
            $scope.loginMsg = 'Incorrect username or password';
        });
    };
});

app.controller('LoginController', function($scope, busyListService, $state) {
    $scope.login = function(){
        console.log('Clicked login button');
        busyListService.submitLogin()
        .success(function(){
            $state.go('index.all_lists');
        })
        .error(function(){
            $scope.signUpError = true;
            $scope.signUpMsg = 'There was a problem signing up';
        });
    };
});

app.controller('AllListsController', function($scope, busyListService, $state) {

});

app.controller('OneListController', function($scope, busyListService, $state) {

});

app.factory('busyListService', function($http, $state) {
    var service = {};

    service.submitSignUp = function(data) {
        var url = '/submit_signup';
        return $http({
            method: 'POST',
            url: url,
            data: data
        });
    };

    service.submitLogin= function(data) {
        var url = '/submit_login';
        return $http({
            method: 'POST',
            url: url,
            data: data
        });
    };

    return service;
});
