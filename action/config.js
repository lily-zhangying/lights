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

exports.register = function(commander){
    commander.action(function(){
//config set
        //config get
    });
};
