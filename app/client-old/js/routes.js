console.log('Starting Angular');

var registration = angular.module('registration', ['ui.router']);

registration.config(function($stateProvider) {

    /*
    $stateProvider
        .state('login', {
            url: "/login"
        })
        .state('app', {
            views: {
                '': {
                    templateUrl: 'views/base.html'
                },
                'navbar@app': {
                    templateUrl: 'views/navbar/navbar.html',
                    controller: 'NavbarController'
                }
            },
            data: {
                requireAuth: true
            }
        })
        .state('app.dashboard', {
            url: "/",
            templateURL: "views/dashboard/dashboard.html",
            controller: "DashboardController"
        });*/

    var helloState = {
        name: 'hello',
        url: '/hello',
        template: '<h3>hello world!</h3>'
    }

    var aboutState = {
        name: 'about',
        url: '/about',
        template: '<h3>Its the UI-Router hello world app!</h3>'
    }

    $stateProvider.state(helloState);
    $stateProvider.state(aboutState);


});

/*
angular.module('registration', [
    '$stateProvider',
    '$locationProvider',
    '$urlRouterProvider',
    function(
        $stateProvider,
        $locationProvider,
        $urlRouterProvider) {

        $stateProvider
            .state('login', {
                url: "/login"
            })
            .state('app', {
                views: {
                    '': {
                        templateUrl: 'views/base.html'
                    },
                    'navbar@app': {
                        templateUrl: 'views/navbar/navbar.html',
                        controller: 'NavbarController'
                    }
                },
                data: {
                    requireAuth: true
                }
            })
            .state('app.dashboard', {
                url: "/",
                templateURL: "views/dashboard/dashboard.html",
                controller: "DashboardController"
            });


        $locationProvider.html5Mode({
            enabled: true,
        });

    }])
    .run([
        '$rootScope',
        '$state',
        function(
            $rootScope,
            $state) {

        }
    ]);*/