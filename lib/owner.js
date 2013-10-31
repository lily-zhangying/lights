
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

exports.registry = function owner(commander){
    var op_type = args[0],
        pkg = {
            name : null,
            version : "latest"
        },
        options = {
            op_type : op_type
        },
        pkgJson = process.cwd() + "/" + CONFIG_FILE;
    switch(op_type){
        case "rm":
        case "add":
            if(args.length == 2){
                options.username = args[1];
                if(fis.util.isFile(pkgJson)){
                    var config = fis.util.readJSON(pkgJson);
                    pkg.name = config.name;
                }else{
                    client.util.log("error", "Owner " + op_type + " error : missing param", "red", true);
                }
            }else if(args.length >= 3){
                options.username = args[1];
                pkg.name = args[2];
            }else{
                client.util.log("error", "Owner " + op_type + " error : missing param", "red", true);
            }
            break;
        case "ls":
            if(args.length  == 2){
                if(fis.util.isFile(pkgJson)){
                    var config = fis.util.readJSON(pkgJson);
                    pkg.name = config.name;
                }else{
                    client.util.log("error", "Owner " + op_type + " error : missing param", "red", true);
                }
            }else if(args.length >= 3){
                pkg.name = args[1];
            }else{
                client.util.log("error", "Owner " + op_type + " error : missing param", "red", true);
            }
            break;
    }
    client.owner(op_type, pkg, options, function(error, message){
        if(error){
            client.util.log("error", "Owner " + op_type + " error : " + error, "red");
        }else{
            client.util.log("error", "Owner " + op_type + " success : " + message, "green");
        }
    });
}
