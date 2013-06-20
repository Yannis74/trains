/**
rover module
This module defines the Rover class and it's private vars/functions
Rover class constructor takes a configuration object.
NOTE: A unit test has been created for this read the README.md for
	  instructions on running.
configuration object properties:
		location: {"x":{number},"y":{number}},
		position: ["N"|"E"|"S"|"W"],
		[log: {function}] //a function that provides logging. The default
						  //logging, when none provided by the user, is
						  //more suited to unit testing (see tests folder);
**/
define(["jquery"], function($){
	//private vars
	var roverDefaults = {
		location: {"x":0,"y":0},
		position: "N"
	};

	//private functions
	var calculateNewLocation = function(location, position){
		switch(position) {
			case "N":
				location.y += 1;
				break;
			case "E":
				location.x += 1;
				break;
			case "S":
				location.y -= 1;
				break;
			case "W":
				location.x -= 1;
				break;
		}
		return location;
	};

	var calculateNewPosition = function(command, currentPosition){
		var position,
			strPositions = "NESW",
			index = strPositions.indexOf(currentPosition);

		if(command === "L"){
			position = strPositions.substr(index - 1, 1);
		}else if(command === "R"){
			index = index === 3? -1 : index;
			position = strPositions.substr(index + 1, 1);
		}

		return position;
	};

	var isValidLocationObject = function(location){
			if(typeof location !== "undefined" &&
				typeof location.x === "number" &&
				typeof location.y === "number" ){

				return true;
			}else{
				return false;
			}
	};

	//Rover constructor
	function Rover(config){
		var location;
		//if no position or location is given
		//then use the default position/location
		this.config = $.extend({}, roverDefaults, config);

		if( !isValidLocationObject(this.config.location) ){
			throw new Error("Rover constructor: location object is not valid");
		}

		//Use logging method if supplied
		if( this.config.hasOwnProperty("log") &&
			typeof this.config.log === "function"){
			this.setLog = this.config.log;
		}

		location = this.getLocation();
		//this property identifies the rover for use in logs.
		this.roverTag = location.x + ' ' +
			location.y + ' ' +
			this.getPosition();

		this.deployRover();

	}

	Rover.prototype = {
		deployRover: function(){

			this.askIfMoveIsPossible(this.getLocation(), function(move){
				var location;

				if(move === false){
					this.setLog("Rover '" + this.roverTag + "' could not complete " +
					"it's mission as it was deployed outside the designated area!");
				}else{
					location = this.getLocation();
					this.setLog("Rover '" + this.roverTag + "' has been deployed " +
					"at Mars location x:" + location.x + ' y:' + location.y +
					" facing: " + this.getPosition());
				}
			});

		},
		move: function(strCommands){
			var command,
				i = 0,
				location,
				position,
				len = strCommands.length,
				re = new RegExp("^([M|L|R|\s*|\n*]+)$");

			/*
			if(!strCommands.match(re)){

				this.setLog("Commands for rover '" + this.roverTag + "' are not valid. Mission terminated!");
				$.publish("roverFinished");
				return false;
			}
			*/

			//loop thru move commands
			while(strCommands.length > 0){

				command = strCommands.substr(0,1);
				location = this.getLocation();
				position = this.getPosition();

				this.setLog("Rover '" + this.roverTag + "' is executing command: " +
					command + " and is located at: x" + location.x +
					" y:" + location.y + " facing: " + position);

				if(command === "L" || command === "R"){

					this.setPosition(calculateNewPosition(command, this.getPosition()));
				}else if(command === "M"){

					//Store remaining move commands
					//and exit method. 'move' method will
					//be restarted by 'moveForward' method.
					this.remainingCommands = strCommands;

					//askIfMoveIsPossible raises asynchronous
					//event and results in moveForward being
					//triggered after response is made.
					this.askIfMoveIsPossible(
						calculateNewLocation(
							location,
							position
						),
						this.moveForward
					);

					return;
				}

				strCommands = strCommands.substr(1);

				i++;
			}

			location = this.getLocation();
			position = this.getPosition();

			this.setLog("Rover '" + this.roverTag + "' final location is: x" +
				location.x + " y:" + location.y + " facing: " + position);

			$.publish("roverFinished");
			this.cleanup();

		},
		/**
		* askIfMoveIsPossible
		* method that raises 'canRoverMoveHere' event which can be 'listened'
		* to by grid (or any other module that might be interested). A response
		* is expected in the form of 'gridResponse'. A callback is triggered
		* on 'gridResponse' and is passed the answer along with the location
		* that was queried.
		* if noGrid set to true no event is published and callback is executed
		* @param {object} nexLocation: location object
		* @param {function} callback
		**/
		askIfMoveIsPossible: function(nextLocation, callback){
			var self = this;

			if(!self.config.noGrid){
				//Using Pub/Sub system for Loosely Coupled logic.
				$.unsubscribe("gridResponse");

				//listen to important messages
				$.subscribe("gridResponse", function(event, move, location){
					callback.call(self, move, location);
				});

				$.publish("canRoverMoveHere", [nextLocation] );

			}else{
				callback.call(self, true, nextLocation);
			}
		},
		moveForward: function(move, newLocation){
			if(move){
				this.setLocation(newLocation);
				this.remainingCommands = this.remainingCommands.substr(1);
				//continue 'move' method with remaining commands
				this.move(this.remainingCommands);
			}else{
				this.setLog("Rover '" + this.roverTag + "' could not complete " +
					"it's mission as it moved outside the designated area");

				$.publish("roverFinished");
			}
		},

		getPosition: function(){
			return this.config.position;
		},

		setPosition: function(position){
			var strPositions = "NESW";
			if(strPositions.indexOf(position) !== -1){
				this.config.position = position;
			}else{
				throw new Error("setPosition: argument must" +
					" be a string character of 'N','E','S' or 'W'"
				);
			}
		},

		getLocation: function(){
			return this.config.location;
		},

		setLocation: function(location){

			if(isValidLocationObject(location)){
				this.config.location = location;
			}else{
				throw new Error("setLocation: argument must" +
					" be an object with x and y properties"
				);
			}
		},
		setLog: function(strMessage){
			this.log = strMessage;
		},
		getLastLog: function(){
			return this.log;
		},
		cleanup: function(){
			$.unsubscribe("gridResponse");
		}
	}

	return Rover;

})
