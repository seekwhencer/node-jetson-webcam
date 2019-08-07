import RouteSet from '../../RouteSet.js'

export default class extends RouteSet {
    constructor() {
        super();
        /**
         * get snapshot from all cameras
         */
        this.router.get('/snapshot', (req, res) => {
            APP.cameras.snapshot(true);
            this.success(req, res, `Taking Snapshot from all Cameras.`);
        });

        return this.router;
    }
};