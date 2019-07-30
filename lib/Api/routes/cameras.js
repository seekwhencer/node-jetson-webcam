import RouteSet from '../RouteSet.js';
import * as Routes from './cameras/index.js';

export default class extends RouteSet {
    constructor(args) {
        super(args);

        this.label = 'API ROUTE PATH FOR CAMERAS';
        this.endpoint = 'cameras';
        this.addRoutes(Routes);

        return this.router;
    }
};
