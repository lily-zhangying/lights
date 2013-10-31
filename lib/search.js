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

exports.registry = function search(args){
    var query = args[0];
    client.search(query, function(err, message){
        if(err){
            console.log(err);
        }else{
            verbose(message);
        }
    });
}

function description(str) {
    if (!str) return '';
    var space;
    var width = cols - 20;
    for (var i = 0; i < str.length; ++i) {
        if (i && i % width == 0) {
            space = str.indexOf(' ', i);
            str = str.slice(0, space) + '\n ' + str.slice(space);
        }
    }
    return str;
}


function verbose(pkgs) {
    pkgs = JSON.parse(pkgs);
    pkgs = Array.prototype.slice.call(pkgs);
    pkgs.forEach(function(pkg){
        console.log('  \033[36m%s\033[m', pkg.name);
        if(pkg.repository){
            console.log('  url: \033[90m%s\033[m', pkg.repository.url || 'none');
        }
        console.log('  desc: \033[90m%s\033[m', description(pkg.description));
        if (commander.verbose) console.log('  version: \033[90m%s\033[m', pkg.version);
        if (commander.verbose) console.log('  license: \033[90m%s\033[m', pkg.license || 'none');
        console.log();
    });
    console.log();
}
