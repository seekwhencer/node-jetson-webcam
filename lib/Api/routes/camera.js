import RouteSet from '../RouteSet.js';
import * as Routes from './camera/index.js';

export default class extends RouteSet {
    constructor(args) {
        super(args);

        this.label = 'API ROUTE PATH FOR ONE CAMERA';
        this.endpoint = 'camera';
        this.addRoutes(Routes);

        return this.router;
    }
};
