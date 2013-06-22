
/**
nasa module
this module defines the nasa object. It manages the rovers/grid and
handles input from the textarea. It starts the rovers one at a time by listening to the
'roverFinished' event.
init param:
        @param grid grid module
        @param Rover the class that creates rovers
        @param logger module that logs messages on screen

**/

define(["jquery"], function($){

    //AB5, BC4, CD8, DC8, DE6, AD5, CE2, EB3, AE7
    //create this graph from user input
    var graph = {
        'A': [{'to': 'B', 'distance': 5}, {'to': 'D', 'distance': 5},{'to': 'E', 'distance': 7}],
        'B': [{'to': 'C', 'distance': 4}],
        'C': [{'to': 'D', 'distance': 8}, {'to': 'E', 'distance': 2}],
        'D': [{'to': 'C', 'distance': 8}, {'to': 'E', 'distance': 6}],
        'E': [{'to': 'B', 'distance': 3}]
    };

    var log;
    var arRoutes = [];
    var rm = {
        $elInput: $(".trainInput"),
        $elResults: $(".results"),
        stops: 1,
        journeys: [],
        init: function(logger){

            rm.$elResults.click(function(){

                //clear the logs from view
                //logger.clear();
                //assigning logging function to log for convenience
                //log = logger.log;
                //reset data constructs
                //rm.reset();
                //get user input and populate data constructs
                //rm.handleInput();

                //then create the routeLookup object
                
                var artest = rm.setAllpossibleRoutes();
                
            });
        },
            //'listen' for when a rover has finished performing it's commands
        reset: function(){
        },
        setAllpossibleRoutes: function(){
            
            return rm.findAllRoutes(rm.getTowns(graph));
        },
        findAllRoutes: function(currentList){
            
            var nextList = [],
                journey,
                len = currentList.length,
                i = 0;

            for(i; i < len; i++){
                if(currentList[i]){
                    journey = currentList[i];

                    rm.setNewRoutes(journey, nextList, currentList);
                }
            }

            rm.journeys.push(currentList);

            if(rm.journeys.length > 4){
                
                return;
            }else{
                rm.findAllRoutes(nextList);
            }

        },
        setNewRoutes: function(journey, nextList, currentList){
            var from = journey.charAt(journey.length-1)
                node = graph[from],
                len = node.length,
                i = 0;
                for(i;i<len;i++){
                    rm.setNewRoute(journey, node[i].to, nextList);
                }
        },
        setNewRoute: function(journey, to, nextList){
            //if the journey has looped then dont log to
            var start = journey.charAt(0);
            var end = journey.charAt(journey.length-1);
            var newJourney = journey + "" + to;
            var journeyEntered = $.inArray(newJourney, nextList) !== -1;
            /*
 
            var start = journey.charAt(0);
            //if start is in journey twice
            if(journey.lastIndexOf(start) !== 0)
             */
            if( (start === to && journeyEntered) ||
              journeyEntered )
            {
                return;
            }else{
                nextList.push(newJourney);
            }
        },
        getTowns: function(graph){
            var arTowns = [];
            for (var town in graph){
                arTowns.push(town);
            }
            return arTowns;
        },
        handleInput: function(){
            //gets all inputs from user
            //formats and stores for later use.
            var i = 1;
            var nasaInput = rm.cleanInput(rm.$elInput.val());

            nasaInput[0] = nasaInput[0].split(" ");

            rm.marsGrid = {"x": parseInt(nasaInput[0][0], 10),
                             "y": parseInt(nasaInput[0][1], 10)};

            for(i;nasaInput[i];i = i + 2){
                nasaInput[i] = nasaInput[i].split(" ");

                rm.deployments.push({
                    "location": { "x": parseInt(nasaInput[i][0], 10),
                                  "y": parseInt(nasaInput[i][1], 10) },
                    "position": nasaInput[i][2],
                    "commands": nasaInput[i+1]
                });
            }

        },
        cleanInput: function(input){
            var i = 0;
            input = input.replace(/\n/g, ",").
                    replace(/,,/g, ",").
                    replace(/\s+/g, ' ').
                    split(',');

            for(i;input[i];i++){
                input[i] = $.trim(input[i]);
            }

            return input;
        }
    };

    return rm;

});
