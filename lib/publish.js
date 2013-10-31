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

exports.registry = function publish(commander){
    var dir = process.cwd(),
        options = {
            force : commander.force
        };
    client.publish(dir, options, function(error, message){
        if(error){
            client.util.log("error", "Publish error : " + error, "red");
        }else{
            client.util.log("log", "Publish success : " + message, "blue");
        }
    });
}
