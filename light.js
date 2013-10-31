'use strict';

var light = module.exports;

light.util = require('./lib/util.js');

light.log = require('./lib/log.js');

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
            ''
        ];

        // prefix = 'fis-command-',
        // prefixLen = prefix.length;
    
    // //built-in commands
    // var deps = {
    //     'fis-command-release' : true,
    //     'fis-command-install' : true,
    //     'fis-command-server' : true
    // };
    // //from package.json dependencies
    // fis.util.merge(deps, fis.cli.info.dependencies);
    // //traverse
    // fis.util.map(deps, function(name){
    //     if(name.indexOf(prefix) === 0){
    //         name = name.substring(prefixLen);
    //         var cmd = fis.require('command', name);
    //         name = fis.util.pad(cmd.name || name, 12);
    //         content.push('    ' + name + (cmd.desc || ''));
    //     }
    // // });
    // content = content.concat([
    //     '',
    //     '  Options:',
    //     '',
    //     '    -h, --help     output usage information',
    //     '    -v, --version  output the version number'
    //     ''
    // ]);
    console.log(content.join('\n'));
};

light.cli.version = function(){
    var content = [
        '',
        '  v' + light.cli.info.version,
        '',
        ' __' + '/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\'.bold.red + '__' + '/\\\\\\\\\\\\\\\\\\\\\\'.bold.yellow + '_____' + '/\\\\\\\\\\\\\\\\\\\\\\'.bold.green + '___',
        '  _' + '\\/\\\\\\///////////'.bold.red + '__' + '\\/////\\\\\\///'.bold.yellow + '____' + '/\\\\\\/////////\\\\\\'.bold.green + '_' + '       ',
        '   _' + '\\/\\\\\\'.bold.red + '_________________' + '\\/\\\\\\'.bold.yellow + '______' + '\\//\\\\\\'.bold.green + '______' + '\\///'.bold.green + '__',
        '    _' + '\\/\\\\\\\\\\\\\\\\\\\\\\'.bold.red + '_________' + '\\/\\\\\\'.bold.yellow + '_______' + '\\////\\\\\\'.bold.green + '_________' + '     ',
        '     _' + '\\/\\\\\\///////'.bold.red + '__________' + '\\/\\\\\\'.bold.yellow + '__________' + '\\////\\\\\\'.bold.green + '______' + '    ',
        '      _' + '\\/\\\\\\'.bold.red + '_________________' + '\\/\\\\\\'.bold.yellow + '_____________' + '\\////\\\\\\'.bold.green + '___' + '   ',
        '       _' + '\\/\\\\\\'.bold.red + '_________________' + '\\/\\\\\\'.bold.yellow + '______' + '/\\\\\\'.bold.green + '______' + '\\//\\\\\\'.bold.green + '__',
        '        _' + '\\/\\\\\\'.bold.red + '______________' + '/\\\\\\\\\\\\\\\\\\\\\\'.bold.yellow + '_' + '\\///\\\\\\\\\\\\\\\\\\\\\\/'.bold.green + '___',
        '         _' + '\\///'.bold.red + '______________' + '\\///////////'.bold.yellow + '____' + '\\///////////'.bold.green + '_____',
        ''
    ].join('\n');
    console.log(content);
};


// light.domain = "fe.baidu.com",
// light.port = "8889";

light.domain = "localhost",
light.port = "3459";

light.cli.client = function(repos){
    var RepoClient = require("fis-repo-client"),
        domain = domain ||  "fe.baidu.com",
        port = port || "8889";
};

var RepoClient = require("fis-repo-client");
light.client = new RepoClient(light.domain, light.port);

function hasArgv(argv, search){
    var pos = argv.indexOf(search);
    var ret = false;
    while(pos > -1){
        argv.splice(pos, 1);
        pos = argv.indexOf(search);
        ret = true;
    }
    return ret;
}

//run cli tools
light.cli.run = function(argv){
    var first = argv[2];
    if(argv.length < 3 || first === '-h' ||  first === '--help'){
        light.cli.help();
    } else if(first === '-v' || first === '--version'){
        light.cli.version();
    }else if(first === '--repos'){
        light.cli.client(argv[3]);
    }else if(first[0] === '-'){
        light.cli.help();
    } else {
        //register command
        var commander = light.cli.commander = require('commander');
        var cmd = require('./action/' + argv[2] + '.js');
        cmd.register(
            commander
                .command(cmd.name || first)
                .usage(cmd.usage)
                .description(cmd.desc)
        );
        commander.parse(argv);
    }
};


