var RepoClient = require("fis-repo-client"),
    domain = "fe.baidu.com",
    port = "8889",
    client = new RepoClient(domain, port),
    cols = process.stdout.columns || 80,
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    LD = "{{",
    RD = "}}",
    CONFIG_FILE = "package.json";

exports.registry =  function unpublish(args){
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
                client.util.log("log", "Unpublish success : " + message, "blue");
            }
        });
    }else{
        client.util.log("error", "Unpublish error : Must have a component name!", "red");
    }
};
