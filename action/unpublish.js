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
        '    light unpublish',
        '    light unpublish <project>[@<version>]',
    ].join('\n');


exports.register =  function(commander){
    commander
    .action(function(){
        var args = Array.prototype.slice.call(arguments);
        if(args && args.length > 1){
            //light unpublish pkg
            var componentInfo = args[0],
                component = {
                    name : componentInfo,
                    version : "all"
                };
            if(componentInfo.indexOf("@") > 0){
                var infos = componentInfo.split("@");
                component.name = infos[0];
                component.version = infos[1];
                if(component.version == 'latest'){
                    client.util.log("error", "Unpublish error : Cannot unpublish latest directly, please see[  light unpublish --help ]", "red", true);
                }
            }
        }else{
            //unpublish 当前文件夹
             var file = process.cwd() + '/' + CONFIG_FILE;
             if(light.util.isFile(file)){
                 var json = light.util.readJSON(file);
                 var component = {
                     name : json.name,
                     version : json.version || 'all'
                 };
             }else{
                 client.util.log("error", "Unpublish error : Must have a package.json file!", "red", true);
             }
        }

        if(client.conf.getConf("username")){
            client.unpublish(component, {}, cb);
        }else{
            //没有用户名，调用adduser
            client.util.log("log", "You have to adduser first.\n", "yellow");

            commander.prompt("Input Username: ", function(name){
                commander.password("Input Password: ", '*', function(password){
                    commander.prompt("Input Email: ", function(email){
                        client.adduser(name, password, email, function(error, message){
                            if(error){
                                client.util.log("error", "Adduser error : " + error, "red", true);
                            }else{
                                client.util.log("log", "Adduser success : " + message, "green");
                                client.unpublish(component, {}, cb);
                            }
                        });
                    });
                });
            });
        }
    });
};
       
   
function cb(e, m){
    if(e){
        client.util.log("error", "Unpublish error : " + e, "red", true);
    }else{
        client.util.log("log", "Unpublish success : " + m, "green", true);
    }
}