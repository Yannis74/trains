
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
    var log;
	var nasa = {
		$elInput: $(".nasaInput"),
		$elDeploy: $(".deploy"),
		deployments: [],
		rovers: [],
		roverIndex: -1,
		init: function(grid, Rover, logger){

			nasa.$elDeploy.click(function(){

                //clear the logs from view
                logger.clear();
                //assigning logging function to log for convenience
                log = logger.log;
                //reset data constructs
                nasa.reset();
                //get user input and populate data constructs
				nasa.handleInput();

                nasa.grid = grid;
                nasa.grid.cleanup();
                //initialise grid with dimensions
                nasa.grid.init(nasa.marsGrid, logger.log);
                //Create rovers and initialise with starting location/position
                nasa.registerAllRovers(Rover, logger);
                //Each rovers executes given commands one at a time
                nasa.startRovers();

			});
            //'listen' for when a rover has finished performing it's commands
			$.subscribe("roverFinished", nasa.startRovers);
		},
        reset: function(){
            var i = 0;
            nasa.deployments = [];
            for(i; nasa.rovers[i]; i++){
                nasa.rovers[i].rover.cleanup();
            }

            nasa.rovers = [];
            nasa.roverIndex = -1;
            nasa.marsGrid = null;
        },
        registerAllRovers: function(Rover, logger){
            //nasa.deployments stores deployment location 
            //and position for each rover.
            $.each(nasa.deployments, function(){
                nasa.registerRover(new Rover({
                        location: this.location,
                        position: this.position,
                        log: logger.log    
                    }), this.commands);
            });
        },
		registerRover: function(rover, commands){
			nasa.rovers.push({"rover": rover, "commands": commands});
		},
		startRovers: function(){
            var commands;
            if( (nasa.rovers.length-1) === nasa.roverIndex){
                log("Nasa controller: All rovers have completed their missions!");
                return;
            }
            nasa.roverIndex++;
			commands = nasa.rovers[nasa.roverIndex].commands;

			nasa.rovers[nasa.roverIndex].rover.move(commands);
		},
		handleInput: function(){
            //gets all inputs from user
            //formats and stores for later use.
			var i = 1;
	        var nasaInput = nasa.cleanInput(nasa.$elInput.val());

	        nasaInput[0] = nasaInput[0].split(" ");

			nasa.marsGrid = {"x": parseInt(nasaInput[0][0], 10), 
							 "y": parseInt(nasaInput[0][1], 10)};
			
			for(i;nasaInput[i];i = i + 2){
				nasaInput[i] = nasaInput[i].split(" ");

				nasa.deployments.push({
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

	return nasa;

})