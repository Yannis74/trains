define(["jquery"], function($){
	var log = null;

	var marsGrid = {
		gridDimensions: {"x":5,"y":5},
		logList: [],
		init: function(grid, logger){

			//Use own logging method if not supplied
			//passed to private var for convenience
			log = logger || marsGrid.setLogList;

			if(marsGrid.isValidGrid(grid)){
				marsGrid.gridDimensions = grid;	
				log("Mars grid created! Dimensions set to x:" + grid.x +
					" y:" + grid.y);
			}else{
				log("Supplied grid is not valid, default grid will" + 
					" be used");
			}

			$.subscribe("canRoverMoveHere", marsGrid.isInsideGrid);
		},

		isInsideGrid: function(event, location){
			if(marsGrid.isValidGrid(location)){
				if(location.x <= marsGrid.gridDimensions.x &&
					location.x >= 0 &&
					location.y <= marsGrid.gridDimensions.y &&
					location.y >= 0){

					$.publish("gridResponse", [true, location]);

					return true;
				}else{

					$.publish("gridResponse", [false, location]);

					return false;
				}
			}else{
				throw new Error("isInsideGrid: argument must" +
					" be an object with x and y properties"
				);
			}
		},

		isValidGrid:function(grid){
			if(typeof grid !== "undefined" &&
				typeof grid.x === "number" &&
				 typeof grid.y === "number" ){

				return true;
			}else{

				return false;
			}

		},

		setLogList: function(strMessage){
			marsGrid.logList[marsGrid.logList.length] = strMessage;
		},

		getLastLog: function(){
			return marsGrid.logList[marsGrid.logList.length - 1];
		},
		cleanup: function(){
			$.unsubscribe("canRoverMoveHere", marsGrid.isInsideGrid);
		}
	}

	return marsGrid;

})
