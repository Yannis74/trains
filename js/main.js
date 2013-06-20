
requirejs.config({
    "baseUrl": "js",
    "paths": {
      "jquery": "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min"
    },
    "shim": {
        "libs/pubsub": ["jquery"]
    }
});
//"app/route"
define(["jquery", "app/routeMaster", "app/logger", "libs/pubsub" ], function($, routeMaster, logger) {
    $(function() {

        routeMaster.init();
    });
});

