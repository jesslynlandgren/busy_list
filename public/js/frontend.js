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
        });
    $urlRouterProvider.otherwise('/welcome');
});


app.controller('IndexController', function($scope, busyListService, $state) {
    $state.go('welcome');
});


app.controller('WelcomeController', function($scope, busyListService, $state) {

});

app.factory('busyListService', function($http, $state) {
    var service = {};

    return service;
});
