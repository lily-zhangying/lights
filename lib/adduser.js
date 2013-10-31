var RepoClient = require("fis-repo-client"),
    domain = "fe.baidu.com",
    port = "8889",
    client = new RepoClient(domain, port);

exports.registry = function adduser(commander){
    commander
        .action(function(){
            commander.prompt("Input Username: ", function(name){
                commander.password("Input Password: ", '*', function(password){
                    commander.prompt("Input Email: ", function(email){
                        client.adduser(name, password, email, function(error, message){
                            if(error){
                                client.util.log("error", "Adduser error : " + error, "red");
                            }else{
                                client.util.log("log", "Adduser success : " + message, "blue");
                            }
                            process.exit(1);
                        });
                    });
                });
            });
        });
};