import './Utils.js';
import path from 'path';
import * as Express from 'express';
import Log from './Log.js';
import Package from '../package.json';
import Config from './Config.js';

global.DEBUG = process.env.NODE_DEBUG || true;
if (DEBUG === 'true') global.DEBUG = true;
if (DEBUG === 'false') global.DEBUG = false;

global.LOG = new Log().log;

/**
 * global process events
 */
process.on('uncaughtException', (error) => {
    LOG('ERROR:', error);
});
process.on('SIGINT', function () {

    // some graceful exit code
    setTimeout(function () {
        process.exit(0);
    }, 2000); // wait 2 seconds
});
process.stdin.resume();

global.APP_DIR = path.resolve(process.env.PWD);
global.PACKAGE = Package;
global.ENV = process.env.NODE_ENV || 'default';

global.CONFIG = new Config();
global.EXPRESS = Express.default;
global.APIAPP = EXPRESS();

LOG('');
LOG('//////////////////');
LOG('RUNNING:', PACKAGE.name);
LOG('VERSION:', PACKAGE.version);
LOG('ENVIRONMENT:', ENV);
LOG('/////////');
LOG('');
