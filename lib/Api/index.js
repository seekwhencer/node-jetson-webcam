import http from 'http';
import formidable from 'express-formidable';

import Module from '../Module.js';
import Websocket from './Websocket.js';

import * as Routes from './routes/index.js';
import RouteSet from './RouteSet.js';

export default class Api extends Module {

    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
                this.name = 'api';
                this.label = 'API';
                this.options = CONFIG.api;

                this.http = null;
                LOG(this.label, 'INIT', this.options);

                this.on('ready', () => {
                    LOG(this.label, '>>> READY ON PORT', this.options.port);
                    LOG('');
                    resolve(this);
                });

                // @TODO - this is for development.
                APIAPP.use((req, res, next) => {
                    res.header("Access-Control-Allow-Origin", "*");
                    res.header("Access-Control-Allow-Credentials", "true");
                    res.header("Access-Control-Allow-Methods", "GET,POST");
                    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
                    next();
                });

                APIAPP.use(formidable());

                this.websocket = new Websocket(CONFIG.websocket);

                // add the api routes
                APIAPP.endpoints = {};
                APIAPP.routeset = {};
                this.routes = new RouteSet();
                this.routes.addRoutes(Routes);

                LOG(this.label, 'ROUTES ADDED:');
                Object.keys(APIAPP.endpoints).forEach(method => {
                    LOG('');
                    LOG(this.label, '> METHOD:', method);
                    APIAPP.endpoints[method].forEach(r => {
                        LOG(this.label, 'ROUTE:', r);
                    });
                });
                LOG('');

                Object.keys(APIAPP.routeset).forEach(r => {
                    LOG(this.label, '> :', r, APIAPP.routeset[r].length);
                });
                LOG('');

                // fontend
                // APIAPP.use('/', EXPRESS.static(`${APP_DIR}/../frontend/dist`));

                this.http = http.createServer(APIAPP);
                this.http.listen(this.options.port, () => {
                    this.emit('ready');
                });
            }
        );
    };

    shutdown() {
        this.http.close(() => {
            LOG(this.label, 'CLOSED');
        });
    };

};