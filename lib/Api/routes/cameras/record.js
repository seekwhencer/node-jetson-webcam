import RouteSet from '../../RouteSet.js'

export default class extends RouteSet {
    constructor() {
        super();
        /**
         * get one camera
         */
        this.router.get('/record', (req, res) => {
            APP.cameras.record();
            this.success(req, res, 'starting recording all cameras together');
        });


        this.router.get('/stop', (req, res) => {
            APP.cameras.stop();
            this.success(req, res, 'stop recording all cameras');
        });

        return this.router;
    }
};