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
            url: '/{user_id}/all-lists',
            templateUrl: 'all-lists.html',
            controller: 'AllListsController'
        })
        .state({
            name: 'index.scratch_pad',
            url: '/{user_id}/scratch-pad',
            templateUrl: 'scratch-pad.html',
            controller: 'ScratchPadController'
        })
        .state({
            name: 'index.one_list',
            url: '/{user_id}/{list_id}',
            templateUrl: 'one-list.html',
            controller: 'OneListController'
        });
    $urlRouterProvider.otherwise('/welcome/auth-buttons');
});

app.controller('IndexController', function($rootScope, $scope, busyListService, $state, $timeout, $urlRouter) {
    $rootScope.$on('$stateChangeStart', function(event, newState, newParams, oldState, oldParams) {
        console.log('Transition from:', oldState.name);
        console.log('Transition to:', newState.name);
        if ((oldState.name === 'welcome.login' || oldState.name === 'welcome.signup') && (newState.name === 'index.all_lists')){
            $rootScope.className = 'loggingin';
            console.log($rootScope.className);
            $timeout(function(){
                $rootScope.className = 'all_lists';
                console.log($rootScope.className);
            },2000);
        } else if ((oldState.name === 'index.all_lists') && (newState.name === 'welcome.login')) {
            event.preventDefault();
            $rootScope.className = 'loggingout';
            console.log($rootScope.className);
            $timeout(function(){
                $state.go(newState.name, {}, {notify: false}).then(function() {
                    $rootScope.$broadcast('$stateChangeSuccess', newState, newParams, oldState, oldParams);
                });
            }, 500);
        } else {
            $rootScope.className = newState.name.split('.')[1];
            console.log($rootScope.className);
        }
    });
});

app.controller('WelcomeController', function($rootScope, $scope, busyListService, $state, $timeout, $urlRouter) {
    // $state.go('welcome.login');
    $rootScope.$on('$stateChangeStart', function(event, newState, newParams, oldState, oldParams) {
        console.log('Transition from:', oldState.name);
        console.log('Transition to:', newState.name);
        if ((oldState.name === 'welcome.login' || oldState.name === 'welcome.signup') && (newState.name === 'index.all_lists')){
            $rootScope.className = 'loggingin';
            console.log($rootScope.className);
            $timeout(function(){
                $rootScope.className = 'all_lists';
                console.log($rootScope.className);
            },2000);
        } else if ((oldState.name === 'index.all_lists') && (newState.name === 'welcome.login')) {
            event.preventDefault();
            $rootScope.className = 'loggingout';
            console.log($rootScope.className);
            $timeout(function(){
                $state.go(newState.name, {}, {notify: false}).then(function() {
                    $rootScope.$broadcast('$stateChangeSuccess', newState, newParams, oldState, oldParams);
                });
            }, 500);
        } else {
            $rootScope.className = newState.name.split('.')[1];
            console.log($rootScope.className);
        }
    });
});

app.controller('AuthButtonsController', function($rootScope, $scope, busyListService, $state) {

});

app.controller('SignUpController', function($rootScope, $scope, busyListService, $state) {
    $scope.signUpForm = {};
    $scope.signUp = function(){
        console.log('Clicked signup button');
        busyListService.submitSignUp($scope.signUpForm)
        .then(function(result){
            console.log(result);
            $state.go('index.all_lists', {user_id: result.data.data._id});
        })
        .catch(function(result){
            console.log(result);
            $scope.signUpError = true;
            $scope.signUpMsg = 'There was a problem signing up';
        });
    };
});

app.controller('LoginController', function($rootScope, $scope, busyListService, $state) {
    $scope.loginForm = {};
    $scope.login = function(){
        console.log('Clicked login button');
        busyListService.submitLogin($scope.loginForm)
        .then(function(result){
            console.log(result);
            $state.go('index.all_lists', {user_id: result.data._id});
        })
        .catch(function(result){
            console.log(result);
            $scope.loginError = true;
            $scope.loginMsg = 'Incorrect username or password';
        });
    };
});

app.controller('AllListsController', function($rootScope, $scope, busyListService, $state, $stateParams) {
    // console.log("In ALL LISTS");
    $scope.showSettings = false;
    $scope.addingList = false;
    $rootScope.user_id = $stateParams.user_id;

    $scope.toggleSettings = function(){
        $scope.showSettings = !$scope.showSettings;
    };
    $scope.logout = function() {
        $state.go('welcome.login');
    };

    busyListService.getAllLists($rootScope.user_id)
    .then(function(result){
        $scope.lists = result.data.lists;
    });

    $scope.toggleNewList = function(){
        $scope.addingList = !$scope.addingList;
    };

    $scope.addList = function(){
        if ($scope.newListTitle && $scope.newListTitle.length > 2) {
            busyListService.addList($rootScope.user_id, $scope.newListTitle)
            .then(function(result){
                console.log('ADDED NEW LIST');
                console.log(result);
                console.log($rootScope.user_id);
                $scope.addingList = false;
                busyListService.getAllLists($rootScope.user_id)
                .then(function(result){
                    console.log('Lists:', result);
                    $scope.lists = result.data.lists;
                });
                $state.go('index.all_lists', {user_id: $rootScope.user_id});
                // state.go('one_list', {list_id: result.data._id});
            })
            .catch(function(result){
                console.log(result);
            });
        } else {
            $scope.message = 'Give your new list a name!';
        }
    };
});

app.controller('ScratchPadController', function($rootScope, $scope, busyListService, $state, $stateParams) {
    $scope.addingItem = false;
    $rootScope.user_id = $stateParams.user_id;

    busyListService.getScratchPad($rootScope.user_id)
    .then(function(result){
        $scope.items = result.data.items;
    });

    $scope.toggleNewItem = function(){
        $scope.addingItem = !$scope.addingItem;
    };

    $scope.addItem = function(){
        if ($scope.newItemText) {
            busyListService.addItemScratchPad($rootScope.user_id, $scope.newItemText)
            .then(function(result){
                $scope.newItemText = "";
                $scope.addingItem = false;
                busyListService.getScratchPad($rootScope.user_id)
                .then(function(result){
                    $scope.items = result.data.items;
                });
            })
            .catch(function(result){
                console.log(result);
            });
        } else {
            $scope.message = "You can't add an empty item!";
        }
    };
});

app.controller('OneListController', function($rootScope, $scope, busyListService, $state, $stateParams) {
    $scope.addingItem = false;
    $rootScope.user_id = $stateParams.user_id;
    $scope.list_id = $stateParams.list_id;

    busyListService.getListItems($rootScope.user_id, $scope.list_id)
    .then(function(result){
        console.log(result);
        $scope.list = result.data.lists[0];
        $scope.items = result.data.items;
    });

    $scope.toggleNewItem = function(){
        $scope.addingItem = !$scope.addingItem;
    };

    $scope.addItem = function(){
        console.log($scope.newItemText);
        if ($scope.newItemText) {
            busyListService.addItem($rootScope.user_id, $scope.list_id, $scope.newItemText)
            .then(function(result){
                console.log('ADDED NEW ITEM');
                console.log(result);
                console.log($rootScope.user_id);
                $scope.newItemText = "";
                $scope.addingItem = false;
                busyListService.getListItems($rootScope.user_id, $scope.list_id)
                .then(function(result){
                    $scope.items = result.data.items;
                });
            })
            .catch(function(result){
                console.log(result);
            });
        } else {
            $scope.message = "You can't add an empty item!";
        }
    };

    $scope.markItem = function(item_id, done) {
        console.log(item_id);
        console.log(done);
        busyListService.markItem(item_id, done)
        .then(function(result) {
            console.log('MARKED ITEM');
            busyListService.getListItems($rootScope.user_id, $scope.list_id)
            .then(function(result){
                $scope.items = result.data.items;
            });
        })
        .catch(function(result){
            console.log(result);
        });
    };

    $scope.deleteItem = function(item_id) {
        busyListService.deleteItem(item_id)
        .then(function(result) {
            console.log('DELETED ITEM');
            busyListService.getListItems($rootScope.user_id, $scope.list_id)
            .then(function(result){
                $scope.items = result.data.items;
            });
        })
        .catch(function(result){
            console.log(result);
        });
    };
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

    service.submitLogin = function(data) {
        var url = '/submit_login';
        return $http({
            method: 'POST',
            url: url,
            data: data
        });
    };

    service.getAllLists = function(user_id) {
        var url = '/' + user_id + '/all_lists';
        return $http({
            method: 'GET',
            url: url,
            params: {
                user_id: user_id
            }
        });
    };

    service.addList = function(user_id, newListTitle) {
        var url = '/add_list';
        return $http({
            method: 'POST',
            url: url,
            data: {
                user_id: user_id,
                newListTitle: newListTitle
            }
        });
    };

    service.getScratchPad = function(user_id) {
        var url = '/' + user_id + '/scratch_pad';
        return $http({
            method: 'GET',
            url: url,
            params: {
                user_id: user_id
            }
        });
    };

    service.addItemScratchPad = function(user_id, newItemText) {
        var url = '/' + user_id + '/scratch_pad/add';
        return $http({
            method: 'POST',
            url: url,
            params: {
                user_id: user_id
            },
            data: {
                newItemText: newItemText
            }
        });
    };

    service.getListItems = function(user_id, list_id) {
        var url = '/' + user_id + '/' + list_id;
        return $http({
            method: 'GET',
            url: url,
            params: {
                user_id: user_id,
                list_id: list_id
            }
        });
    };

    service.addItem = function(user_id, list_id, newItemText) {
        var url = '/' + user_id + '/' + list_id + '/add';
        return $http({
            method: 'POST',
            url: url,
            params: {
                user_id: user_id,
                list_id: list_id
            },
            data: {
                newItemText: newItemText
            }
        });
    };

    service.markItem = function(item_id, done) {
        var url = '/' + item_id + '/mark';
        return $http({
            method: 'POST',
            url: url,
            params: {
                item_id: item_id,
                done: done
            }
        });
    };

    service.deleteItem = function(item_id) {
        var url = '/' + item_id + '/delete';
        return $http({
            method: 'POST',
            url: url,
            params: {
                item_id: item_id
            }
        });
    };

    // service.deleteList = function(user_id) {
    //     var url = '/add_list';
    //     return $http({
    //         method: 'POST',
    //         url: url,
    //     });
    // };
    //
    // service.copyList = function(user_id) {
    //     var url = '/add_list';
    //     return $http({
    //         method: 'POST',
    //         url: url,
    //     });
    // };

    // service.getScratchPad = function() {
    //     var url = '/scratch_pad';
    //     return $http({
    //         method: 'GET',
    //         url: url,
    //     });
    // };
    //
    // service.getOneList = function(list_id) {
    //     var url = '/scratch_pad';
    //     return $http({
    //         method: 'GET',
    //         url: url,
    //     });
    // };
    //
    // service.addItem = function(list_id) {
    //     var url = '/scratch_pad';
    //     return $http({
    //         method: 'GET',
    //         url: url,
    //     });
    // };

    // service.updateItem = function(list_id) {
    //     var url = '/scratch_pad';
    //     return $http({
    //         method: 'GET',
    //         url: url,
    //     });
    // };
    //
    // service.deleteItem = function(list_id) {
    //     var url = '/scratch_pad';
    //     return $http({
    //         method: 'GET',
    //         url: url,
    //     });
    // };
    //
    // service.copyItem = function(list_id) {
    //     var url = '/scratch_pad';
    //     return $http({
    //         method: 'GET',
    //         url: url,
    //     });
    // };

    return service;
});
