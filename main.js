var assert = require('assert');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var os = require('os');

var Logger = require('bunyan');
var nopt = require('nopt');



var ldapMysql = require('./lib/ldapjs-mysql');


var LOG = new Logger({
    name: 'ldapjs-mysql',
    stream: process.stdout,
    serializers: {
        err: Logger.stdSerializers.err
    }
});

var OPTS = {
    'debug': Number,
    'file': String,
    'port': Number,
    'help': Boolean,
};

var SHORT_OPTS = {
    'd': ['--debug'],
    'f': ['--file'],
    'p': ['--port'],
    'h': ['--help']
};


function usage(code, message) {
    var _opts = '', msg;
    Object.keys(SHORT_OPTS).forEach(function (k) {
        var longOpt = SHORT_OPTS[k][0].replace('--', ''),
            type = OPTS[longOpt].name || 'string';

        if (type && type === 'boolean') {
            type = '';
        }
        type = type.toLowerCase();

        _opts += ' [--' + longOpt + ' ' + type + ']';
    });

    msg = (message ? message + '\n' : '') +
        'usage: ' + path.basename(process.argv[1]) + _opts;

    console.error(msg);
    process.exit(code);
}

function processConfig() {
    var _config,
        parsed = nopt(OPTS, SHORT_OPTS, process.argv, 2),
        file = parsed.file || __dirname + '/etc/ldapjs-mysql.config.json';

    if (parsed.help) {
        usage(0);
    }

    LOG.info({file: file}, 'Processing configuration file');

    _config = ldapjsMysql.processConfigFile(file);

    if (parsed.port) {
        _config.port = parsed.port;
    }

    if (parsed.debug) {
        LOG.level(parsed.debug > 1 ? 'trace' : 'debug');
    }

    if (_config.logLevel) {
        LOG.level(_config.logLevel);
    }

    _config.single = (parsed.single) ? true : false;

    LOG.debug('config processed: %j', _config);
    _config.log = LOG;
    return _config;
}

// --- Mainline

var config = processConfig();

// CAPI-169: Clustering intentionally disabled due to race condition on
// ldif bootstrap.
var server = ldapMysql.createServer(config);
server.init(function () {
    return (true);
});
