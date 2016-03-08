'use strict';

angular.module('flyerApp.schedule', ['ngRoute', 'services.eventquery'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/schedule/:id', {
        templateUrl: 'schedule/night-schedule.html',
        controller: 'NightScheduleCtrl'
    });
}])

.controller('NightScheduleCtrl', ['$scope', '$routeParams', '$rootScope', 'eventquery',

function($scope, $routeParams, $rootScope, eventquery) {
    $scope.draw = false;
    $scope.night_id = $routeParams.id;
    $scope.date = eventquery.getCoworkingDate($scope.night_id);

    eventquery.dataReadyCb = function() {
        $scope.night_id = $routeParams.id;
        $scope.events = eventquery.getEvents($scope.night_id);
        $scope.base_date = eventquery.getCoworkingDate($scope.night_id);

        while($rootScope.coworking_venues.length == 0) {
            console.log("Waiting for venues");
        }

        console.log("Got venues: " + $rootScope.coworking_venues);
        $scope.rooms = $rootScope.coworking_venues;
        var resources = [];
        for (var i = 0; i < $scope.rooms.length; i++) {
            if ($scope.rooms[i].capacity > 3)
            resources.push({
                id: $scope.rooms[i].map_id,
                title: $scope.rooms[i].full
            });
        }

        var calendar_events = [];
        for (var i = 0; i < $scope.events.length; i++) {
            var e = {}
            e.title = $scope.events[i].name;
            e.start = $scope.events[i].start_time;
            e.end = $scope.events[i].end_time;
            e.resourceId = eventquery.getCoworkingVenue($scope.events[i]).map_id;
            calendar_events.push(e);
        }

        console.log(resources);
        console.log(calendar_events);

        $scope.draw = true;

        $('#fullcalendar').fullCalendar({
            aspectRatio: 2,
            schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
            resources: resources,
            events: calendar_events,
            defaultView: 'agendaDay',
            header: false,
            defaultDate: $scope.base_date,
            allDaySlot: false,
            minTime: "18:00:00",
            maxTime: "23:00:00",
            slotDuration: "00:15:00",
            slotEventOverlap: false,
            editable: false,
            eventLimit: true
        });
    }

    $scope.$watch(
        function () {
            return eventquery.isSdkReady();
        },
        function(newVal) {
            eventquery.init_user(newVal);
        }
    );

    $scope.IntentLogin = function() {
        if(!eventquery.isUserConnected()) {
            eventquery.login();
        }
    };



}])