angular.module('services.eventquery', []).

factory('eventquery', ['$rootScope', 'Facebook',
function($rootScope, Facebook) {
    var eventqueryService = {};

    eventqueryService.events = [];
    eventqueryService._facebookReady = false;
    eventqueryService._userIsConnected = false;
    eventqueryService.dataReadyCb = null;

    eventqueryService.getCurrent = function() {
        return new Date();
    }

    eventqueryService.isSdkReady = function() {
        return Facebook.isReady();
    }

    eventqueryService.retrieveEvents = function() {
        Facebook.api('/954447087970025', 'GET', {'fields': 'events{owner,id,place,start_time,end_time,description,name,is_viewer_admin,attending_count}' },
        function(response) {
            eventqueryService.events = response.events.data;
            if(eventqueryService.dataReadyCb) {
                eventqueryService.dataReadyCb();
            }
        });
    }

    eventqueryService.init_user = function () {
        eventqueryService._facebookReady = true;

        Facebook.getLoginStatus(function(response) {
            if(response.status == 'connected') {
                eventqueryService._userIsConnected = true;
                eventqueryService.retrieveEvents();
            }
        });
    }

    eventqueryService.isUserConnected = function () {
        return eventqueryService._userIsConnected;
    };

    eventqueryService.login = function() {
        if(!eventqueryService.isUserConnected()) {
            Facebook.login(function(response) {
                if (response.status == 'connected') {
                    eventqueryService._userIsConnected = true;
                }
            });
        }
        eventqueryService.init_user();
    };

    eventqueryService.getCoworkingDate = function(id) {
        for (var i = 0; i < $rootScope.coworking_nights.length; i++) {
            if (id == $rootScope.coworking_nights[i].id) {
                return new Date($rootScope.coworking_nights[i].date);
            }
        }
    }

    eventqueryService.getCoworkingId = function(event) {
        for (var i = 0; i < $rootScope.coworking_nights.length; i++) {
            var event_date = new Date(event.start_time);
            var night_date = new Date($rootScope.coworking_nights[i].date);

            if ( event_date.getDate() == night_date.getDate() && event_date.getMonth() == night_date.getMonth() && event_date.getYear() == night_date.getYear() ) {
               return $rootScope.coworking_nights[i].id;
            }
        }
        return -1;
    }

    eventqueryService.getCoworkingVenue = function(event) {
        for (var i = 0; i < $rootScope.coworking_venues.length; i++) {
            if (event.place.name.indexOf($rootScope.coworking_venues[i].match) != -1) {
                return $rootScope.coworking_venues[i];
            }
        }
        return {"match": "To Be Posted", "full": "To Be Posted", "floor": "" };
    }

    return eventqueryService;
}]);