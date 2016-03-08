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

    eventquery.dataReadyCb = function() {
        $scope.night_id = $routeParams.id;
        $scope.events = eventquery.getEvents($scope.night_id);

        $scope.base_date = eventquery.getCoworkingDate($scope.night_id);

        $scope.rooms = $rootScope.coworking_venues;
        $scope.times = [];

        var base_hours = 18;
        var base_mins = 0;

        for (var i = 0; i < 21; i++) {
            var new_date = new Date();
            new_date.setDate($scope.base_date.getDate());
            var new_mins = base_mins + i * 15;
            var new_hours = base_hours;
            while (new_mins >= 60) {
                new_hours = new_hours + 1;
                new_mins = new_mins - 60;
            }
            new_date.setHours(new_hours, new_mins);
            $scope.times.push(new_date);
        }

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


        $('#calendar').fullCalendar({
            schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
            header: false,
            defaultDate: $scope.base_date,
            allDaySlot: false,
            defaultView: 'agendaDay',
            minTime: "18:00:00",
            maxTime: "23:00:00",
            slotDuration: "00:15:00",
            editable: false,
            eventLimit: true,
            events: calendar_events,
            resources: resources,
            views: {
                agendaResource: {
                    type: 'agenda',
                    duration: {days: 1},
                    groupByResource: true
                }
            }
        });

        $scope.draw = true;
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