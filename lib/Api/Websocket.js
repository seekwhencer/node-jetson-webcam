import expressWs from 'express-ws';
import Module from '../Module.js';

export default class Websocket extends Module {

    constructor(args) {
        super(args);
        this.router = EXPRESS.Router();
        this.epressWs = expressWs(APIAPP, null, {
            wsOptions: {}
        });

        this.router.ws('/', (ws, req) => {
            ws.on('message', msg => {
                ws.send(msg);
            });
        });

        APIAPP.use("/holodeck", this.router);


    }
};