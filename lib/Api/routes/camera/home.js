import RouteSet from '../../RouteSet.js'

export default class extends RouteSet {
    constructor() {
        super();
        /**
         * get one camera
         */
        this.router.get('/:camera_id', (req, res) => {
            const camera_id = req.params.camera_id;
            const camera = APP.cameras.get(camera_id);
            if (!camera)
                return this.error('Camera not found', res);

            res.json(camera.options);
        });
        return this.router;
    }
};