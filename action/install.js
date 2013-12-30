var lights = require("../lights.js"),
    RepoClient = require("fis-repo-client"),
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    LD = "{{",
    RD = "}}",
    CONFIG_FILE = "package.json";

    exports.name = 'install';
    exports.usage = [
        '',
        '',
        '    lights install',
        '    lights install <pkg>',
        '    lights install <pkg>@<version>'
    ].join('\n');

    exports.desc = 'install components and demos';

    exports.register = function(commander){
        commander
            .option("--repos <url>", "repository")
            .action(function(){
                var client = new RepoClient(commander.repos || lights.config.get('repos'));
                var args = Array.prototype.slice.call(arguments);
                if(args.length >= 1 && typeof args[0] == "string"){
                    exports.installPkg(args[0], commander);
                }else{
                    installDeps(commander);
                }
            });
};

exports.installPkg = function(componentInfo, commander){
    var client = new RepoClient(commander.repos || lights.config.get('repos'));
    var dir = lights.util.realpath(process.cwd());
        options = {
            deps : true
        };
    var component = {
        name : componentInfo,
        version : "latest"
    };

    if(componentInfo.indexOf("@") > 0){
        var infos = componentInfo.split("@");
        component.name = infos[0];
        component.version = infos[1];
    }
    var param = {
        dir : dir,
        options : options,
        component : component
    };
    installByComponentName(param, client, function(error){
        if(error){
            client.util.log("error", "Install error : " + error, "red");
        }else{
            client.util.log("log", "Install success : Install [" + component.name + '@' + component.version +"] success", "green");
            var componentDir = dir + "/" + component.name;
            scaffold(componentDir, client, commander, function(){
                process.exit(1);
            });
        }
    });
};

function installDeps(commander){
    var client = new RepoClient(commander.repos || lights.config.get('repos'));
    var dir = lights.util.realpath(process.cwd());
    var installDir = path.dirname(dir),
        configFile = dir + "/" + CONFIG_FILE;
    installByComponentConfig(installDir, configFile, options, client, function(error, message){
        if(error){
            client.util.log("error", "Install error : " + error, "red");
        }else{
            client.util.log("log", "Install success : Install dependencies success", "green");
            if(lights.util.isFile(configFile)){
                var config = lights.util.readJSON(configFile),
                    dependencies = config.dependencies,
                    componentDirs = [];
                for(var depend in dependencies){
                    if(dependencies.hasOwnProperty(depend)){
                        componentDirs.push(installDir + "/" + depend);
                    }
                }
                async.eachSeries(componentDirs, _scaffold, function(){
                    process.exit(1);
                });

                function _scaffold(dir, cb){
                    scaffold(dir, client, commander, cb);
                };
            }
        }
    });
};

function scaffold(dir, client, commander, callback){
    var configFile = dir + "/" + CONFIG_FILE;

    if(lights.util.isFile(configFile)){
        var config = lights.util.readJSON(configFile),
            scaffold = config.scaffold;
        if(scaffold && !isEmptyObject(scaffold)){
            client.util.log("log", "Start component [" + config.name + "] scaffold config.", "green");
            var scaffolds = [],
                keyRegStr = "";
            for(var key in scaffold){
                if(scaffold.hasOwnProperty(key)){
                    keyRegStr += "(" + preg_quote(LD + key + RD) + ")" + "|";
                    scaffolds.push({
                        key : key,
                        notice : scaffold[key]
                    });
                }
            }
            keyRegStr = keyRegStr.substr(0, keyRegStr.length-1);

            var keyReg = new RegExp(keyRegStr, "gm"),
                files = lights.util.find(dir);

            async.mapSeries(scaffolds, prompt, function(error, values){
                for(var i=0; i<files.length; i++){

                    //替换文件内容
                    if(lights.util.isTextFile(files[i])){
                        var content = lights.util.read(files[i]).toString();
                        if(keyReg.test(content)){
                            var new_content = content.replace(keyReg, function(){
                                var args = Array.prototype.slice.call(arguments);
                                for(var j=1; j<args.length-2; j++){
                                    if(args[j]){
                                        return values[j-1];
                                    }
                                }
                                return args[0];
                            });
                            lights.util.write(files[i], new_content);
                        }
                    }

                    //修改文件名称
                    if(keyReg.test(files[i])){
                        var new_file = files[i].replace(keyReg, function(){
                            var args = Array.prototype.slice.call(arguments);
                            for(var j=1; j<args.length-2; j++){
                                if(args[j]){
                                    return values[j-1];
                                }
                            }
                            return args[0];
                        });
                        lights.util.copy(files[i], new_file);
                        lights.util.del(files[i]);
                    }
                }
                var subDir = getSubDir(dir);
                for(var i=0; i<subDir.length; i++){
                    if(keyReg.test(subDir[i])){
                        lights.util.del(subDir[i]);
                    }
                }
                client.util.log("log", "Finish component [" + config.name + "] scaffold config.", "green");
                callback(null, "Success");
            });

            function prompt(option, callback){
                commander.prompt(option.notice + ": ", function(value){
                    callback(null, value);
                });
            };

        }else{
            callback(null);
        }
    }
};



function preg_quote (str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
};

function getSubDir(dir){
    if(lights.util.isDir(dir)){
        var dirs = [];
        fs.readdirSync(dir).forEach(function(p){
            if(p[0] != "."){
                var tmp_file = dir + '/' + p;
                if(lights.util.isDir(tmp_file)){
                    dirs = dirs.concat(getSubDir(tmp_file));
                }
            }
        });
        dirs.push(dir);
        return dirs;
    }
    return null;
};

function installByComponentName(param, client, callback){
    var dir = param.dir,
        component = param.component,
        options = param.options;
    client.install(dir, component, options, function(error, message){
        if(error){
            callback(error);
        }else{
            if(options.deps){
                var componentJson = path.normalize(dir + "/" + component.name + "/" + CONFIG_FILE);
                if(lights.util.isFile(componentJson)){
                    installByComponentConfig(dir, componentJson, options, client, callback);
                }
            }else{
                callback(null);
            }
        }
    });
};

function installByComponentConfig(dir, configFile, options, client, callback){
    if(lights.util.isFile(configFile)){
        var config = lights.util.readJSON(configFile),
            dependencies = config.dependencies,
            params = [];
        if(dependencies && !isEmptyObject(dependencies)){
            for(var pkgname in dependencies){
                if(dependencies.hasOwnProperty(pkgname)){
                    params.push({
                        component : {
                            name : pkgname,
                            version : dependencies[pkgname]
                        },
                        dir : dir,
                        options : options
                    });
                }
            }
            async.each(params, _installByComponentName, callback);

            function _installByComponentName(param, cb){
                installByComponentName(param, client, cb);
            };
        }else{
            callback(null, "Component [" + config.name + "] have no depend");
        }
    }else{
        callback(CONFIG_FILE + " not exist!");
    }
};

function isEmptyObject(obj){
    for(var name in obj){
        return false;
    }
    return true;
};

  