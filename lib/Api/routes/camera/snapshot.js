import RouteSet from '../../RouteSet.js'

export default class extends RouteSet {
    constructor() {
        super();
        /**
         * get one camera
         */
        this.router.get('/:camera_id/snapshot', (req, res) => {
            const camera_id = req.params.camera_id;
            const camera = APP.cameras.get(camera_id);
            if (!camera)
                return this.error('Camera not found', res);

            camera.snapshot();
            this.success(req,res,`Taking Snapshot from ${camera.options.device} - ${camera.options.name}`);
        });

        return this.router;
    }
};