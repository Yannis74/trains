
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
                rm.setAllpossibleRoutes();
                console.log(arRoutes);
                rm.transposeLists(arRoutes);
            });
            //'listen' for when a rover has finished performing it's commands
            $.subscribe("roverFinished", rm.startRovers);
        },
        reset: function(){
            var i = 0;
            rm.deployments = [];
            for(i; rm.rovers[i]; i++){
                rm.rovers[i].rover.cleanup();
            }

            rm.rovers = [];
            rm.roverIndex = -1;
            rm.marsGrid = null;
        },
        setAllpossibleRoutes: function(){
            rm.findAllRoutes(rm.getTowns(graph));
        },
        findAllRoutes: function(currentList){
            var nextList = [],
                len = currentList.length,
                i = 0;

            for(i; i < len; i++){
                if(currentList[i]){
                    rm.setNewRoutes(i, currentList[i], currentList, nextList);
                }
            }

            arRoutes.push(currentList);

            if(arRoutes.length < 2){
                rm.findAllRoutes(nextList);
            }

        },
        setNewRoutes: function(currentIndex, from, currentList, nextList){
            var node = graph[from],
                len = node.length,
                i = 0;
                for(i;i<len;i++){
                    rm.setNewRoute(from, node[i].to, currentList, nextList, currentIndex);
                }
        },
        setNewRoute: function(from, to, currentList, nextList, currentIndex){
            var newIndex = currentList.push(from);
                newIndex = newIndex - 1;
                nextList[newIndex] = to;
                rm.updatePreviousLists(currentIndex, newIndex);
        },
        updatePreviousLists: function(currentIndex, newIndex){
            $.each(arRoutes, function(i, arList){
                var val = arList[currentIndex];
                arList[newIndex] = val;
            });
        },
        transposeLists: function(){
            var allRoutes = [];

            $.each(arRoutes, function(i, arList){
                for(var y = 0; y < arList.length; y++){
                    if(typeof allRoutes[y] == "undefined"){
                        allRoutes[y] = "";
                    }
                    allRoutes[y] = allRoutes[y] + arList[y];
                }
            });

            console.log(allRoutes);

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
