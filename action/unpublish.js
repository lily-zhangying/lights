var light = require("../light.js"),
    client = light.client,
    cols = process.stdout.columns || 80,
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    LD = "{{",
    RD = "}}",
    CONFIG_FILE = "package.json";

    exports.name = 'unpublish';
    exports.usage = [
        '',
        '',
        '    light unpublish <project>[@<version>]',
    ].join('\n');


exports.register =  function(commander){
    commander
     .action(function(){
         var args = Array.prototype.slice.call(arguments);
         if(args && args.length > 0){
            var componentInfo = args[0],
                component = {
                    name : componentInfo,
                    version : "all"
                };

            if(componentInfo.indexOf("@") > 0){

                var infos = componentInfo.split("@");
                component.name = infos[0];
                component.version = infos[1];
            }

            client.unpublish(component, {}, function(error, message){
                if(error){
                    client.util.log("error", "Unpublish error : " + error, "red");
                }else{
                    client.util.log("log", "Unpublish success : " + message, "green");
                }
            });
        }else{
            client.util.log("error", "Unpublish error : Must have a component name!", "red");
        }

     });
};
       
   
