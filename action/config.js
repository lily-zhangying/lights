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
    'username',
    '_auth',
    'email',
    'repos'
];

exports.register = function(commander){
    commander.action(function(){
        var args = Array.prototype.slice.call(arguments);
        var action = args[0];
        switch (action){
            case 'set':
                var key = args[1],
                    value = args[2];

                break;
            case 'get':
                var key = args[1] || 'all';
                break;
            case 'ls' :
                var key = args[1] || 'all';
                break;
            default :
                client.util.log("log", exports.usage, "black");
        };
    });
};
