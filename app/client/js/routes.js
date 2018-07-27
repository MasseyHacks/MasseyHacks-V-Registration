console.log('Starting Angular');

angular.module('registration', [
    '$stateProvider',
    '$locationProvider',
    '$urlRouterProvider',
    function(
        $stateProvider,
        $locationProvider,
        $urlRouterProvider) {

        $stateProvider.state('login', {
            url: "/login"
        })

    }
]);