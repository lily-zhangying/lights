var light = require("../light.js"),
    client = light.client,
    cols = process.stdout.columns || 80,
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    LD = "{{",
    RD = "}}",
    CONFIG_FILE = "package.json";

    exports.name = 'publish';
    exports.usage = [
        '',
        '',
        '   light publish',
        '',
        '   Notice: publish ./ directory which must has package.json file'
    ].join('\n');

exports.register = function(commander){
    commander
        .option('--force', 'Publish an exist version component', Boolean)
        .action(function(){
            var dir = process.cwd(),
            options = {
                force : commander.force
            };
            client.publish(dir, options, function(error, message){
                if(error){
                    client.util.log("error", "Publish error : " + error, "red");
                }else{
                    client.util.log("log", "Publish success : " + message, "green");
                }
            });
    });
    
}
