'use strict';

var light = module.exports;

light.util = require('./lib/util.js');

light.log = require('./lib/log.js');

light.config = require('./lib/config.js');

light.cli = {};

light.cli.info = light.util.readJSON(__dirname + '/package.json');

light.cli.name = 'light';

light.cli.color = require('colors');

light.cli.commander = null;

light.cli.help = function(){
     var content = [
            '',
            '  Usage: ' + light.cli.name + ' <command>',
            '',
            '  Commands:',
            '',
            '       install      install resource from light',
            '       search       search resource of light',
            '       adduser      add user of light',
            '       publish      publish resource to light',
            '       unpublish    remove resource to light',
            '       owner        change ownership of resource',
            '       config       set or get config of light'
        ];
    content = content.concat([
            '',
            '  Options:',
            '',
            '       -h, --help     output usage information',
            '       -v, --version  output the version number',
            ''
    ]);
    console.log(content.join('\n'));
};

light.cli.version = function(){
    var content = [
        '',
        '  v' + light.cli.info.version,
        ''
    ].join('\n');
    console.log(content);
};

light.require = function(path, cliName){
    try {
        return require(path);
    } catch(e) {
        light.cli.help();
        e.message = 'light do not support command [' + cliName + ']';
        light.log.error(e);
    }
};

//run cli tools
light.cli.run = function(argv){
    var first = argv[2];
    if(argv.length < 3 || first === '-h' ||  first === '--help'){
        light.cli.help();
    } else if(first === '-v' || first === '--version'){
        light.cli.version();
    }else if(first[0] === '-'){
        light.cli.help();
    } else {
        //register command
        var commander = light.cli.commander = require('commander'),
            path = './action/' + argv[2] + '.js';

        var cmd = light.require(path, argv[2]);
            cmd.register(
                commander
                    .command(cmd.name || first)
                    .usage(cmd.usage)
                    .description(cmd.desc)
            );
            commander.parse(argv); 
    }
};


