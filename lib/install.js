var RepoClient = require("fis-repo-client"),
    domain = "fe.baidu.com",
    port = "8889",
    client = new RepoClient(domain, port),
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    LD = "{{",
    RD = "}}",
    CONFIG_FILE = "package.json";

    exports.name = 'install';
    exports.usage = '<names> [path] [options]';
    exports.desc = 'install components and demos';
    exports.registry = function install(commander){
        commander
            .action(function(){
                var args = Array.prototype.slice.call(arguments);
                var dir = process.cwd(),
                    options = {
                        deps : commander.deps
                    };
                if(args.length >= 1 && typeof args[0] == "string"){
                    var componentInfo = args[0],
                        component = {
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
                    installByComponentName(param, function(error){
                        if(error){
                            client.util.log("error", "Install error : " + error, "red");
                        }else{
                            client.util.log("log", "Install success : ", "blue");
                            var componentDir = dir + "/" + component.name;
                            scaffold(componentDir, function(){
                                process.exit(1);
                            });
                        }
                    });
                }else{
                    var installDir = path.dirname(dir),
                        configFile = dir + "/" + CONFIG_FILE;
                    installByComponentConfig(installDir, configFile, options, function(error, message){
                        if(error){
                            client.util.log("error", "Install error : " + error, "red");
                        }else{
                            client.util.log("log", "Install success : ", "blue");
                            if(fis.util.isFile(configFile)){
                                var config = fis.util.readJSON(configFile),
                                    dependencies = config.dependencies,
                                    componentDirs = [];
                                for(var depend in dependencies){
                                    if(dependencies.hasOwnProperty(depend)){
                                        componentDirs.push(installDir + "/" + depend);
                                    }
                                }
                                async.eachSeries(componentDirs, scaffold, function(){
                                    process.exit(1);
                                });
                            }
                        }
                    });
                }
            });
};

    function isEmptyObject(obj){
        for(var name in obj){
            return false;
        }
        return true;
    };

    function scaffold(dir, callback){

        var configFile = dir + "/" + CONFIG_FILE;

        if(fis.util.isFile(configFile)){
            var config = fis.util.readJSON(configFile),
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
                    files = fis.util.find(dir);

                async.mapSeries(scaffolds, prompt, function(error, values){
                    for(var i=0; i<files.length; i++){

                        //替换文件内容
                        if(fis.util.isTextFile(files[i])){
                            var content = fis.util.read(files[i]);
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
                                fis.util.write(files[i], new_content);
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
                            fis.util.copy(files[i], new_file);
                            fis.util.del(files[i]);
                        }
                    }
                    var subDir = getSubDir(dir);
                    for(var i=0; i<subDir.length; i++){
                        if(keyReg.test(subDir[i])){
                            fis.util.del(subDir[i]);
                        }
                    }
                    client.util.log("log", "Finish component [" + config.name + "] scaffold config.", "green");
                    callback(null, "Success");
                });
            }else{
                callback(null);
            }
        }
    }

    function prompt(option, callback){
        commander.prompt(option.notice + ": ", function(value){
            callback(null, value);
        });
    }

    function preg_quote (str, delimiter) {
        return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
    }


    function getSubDir(dir){
        if(fis.util.isDir(dir)){
            var dirs = [];
            fs.readdirSync(dir).forEach(function(p){
                if(p[0] != "."){
                    var tmp_file = dir + '/' + p;
                    if(fis.util.isDir(tmp_file)){
                        dirs = dirs.concat(getSubDir(tmp_file));
                    }
                }
            });
            dirs.push(dir);
            return dirs;
        }
        return null;
    }

    function installByComponentName(param, callback){
        var dir = param.dir,
            component = param.component,
            options = param.options;
        client.install(dir, component, options, function(error, message){
            if(error){
                callback(error);
            }else{
                if(options.deps){
                    var componentJson = path.normalize(dir + "/" + component.name + "/" + CONFIG_FILE);
                    if(fis.util.isFile(componentJson)){
                        installByComponentConfig(dir, componentJson, options, callback);
                    }
                }else{
                    callback(null);
                }
            }
        });
    }

    function installByComponentConfig(dir, configFile, options, callback){
        if(fis.util.isFile(configFile)){
            var config = fis.util.readJSON(configFile),
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
                async.each(params, installByComponentName, callback);
            }else{
                callback(null, "Component [" + config.name + "] have no depend");
            }
        }else{
            callback(CONFIG_FILE + " not exist!");
        }
    }
