define(["jquery"], function($){

	var logger = {
		$el: $(".logger"),
		log: function(strText){
			logger.$el.append(strText + "<br/>");
		},
		clear: function(){
			logger.$el.empty();	
		},
	};

	return logger;

})