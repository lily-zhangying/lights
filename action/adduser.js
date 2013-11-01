var light = require("../light.js"),
    client = light.client;

exports.register = function(commander){
    commander.action(function(){
        commander.prompt("Input Username: ", function(name){
            commander.password("Input Password: ", '*', function(password){
                commander.prompt("Input Email: ", function(email){
                    client.adduser(name, password, email, function(error, message){
                        if(error){
                            client.util.log("error", "Adduser error : " + error, "red");
                        }else{
                            client.util.log("log", "Adduser success : " + message, "green");
                        }
                        process.exit(1);
                    });
                });
            });
        });
    });
};