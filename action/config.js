var light = require('../light.js');
var client = light.client;

exports.name = 'config';
exports.desc = 'edit config of light';
exports.usage = [
    '',
    '',
    '   light config set <key> <value>',
    '   light config get [<key>]',
    '   light config ls',
    ''
].join('\n');

exports.configKeys = [
    'repos'
];

function getAllConf(){
    var conf = client.conf.getAll();
    var r = [];
    for(var i in conf){
        if(i != '_auth'){
            r.push(i + ': ' + conf[i]);
        }
    }
    return r.join('\n');
};

exports.register = function(commander){
    commander.action(function(){
        var args = Array.prototype.slice.call(arguments);
        var action = args[0];
        switch (action){
            case 'set':
                var key = args[1],
                    value = args[2];
                if(key && value){
                    if(!client.util.in_array(key, exports.configKeys)){
                        client.util.log('error', 'Sorry, Set invalid config. the valid config include: ' + exports.configKeys.join(', '), 'red');
                    }else{
                        //检测repos结构

                        var obj = {};
                        obj[key] = value;
                        client.conf.setConf(obj);
                        client.util.log('log', 'Set config [' + key + ": " + value + '] success!', 'green');
                    }
                }else{
                    client.util.log("error", exports.usage, "");
                }
                break;
            case 'get':
                var key = args[1];
                if(key){
                    client.util.log('log', key + ': ' + (client.conf.get(key) || 'null'), 'yellow');
                }else{
                    client.util.log('log', getAllConf() || 'null', 'yellow');
                }
                break;
            case 'ls' :
                client.util.log('log', getAllConf() || 'null', 'yellow');
                break;
            default :
                client.util.log("log", exports.usage, '');
        };
    });
};
