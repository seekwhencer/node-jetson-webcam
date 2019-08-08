import RouteSet from '../../RouteSet.js'

export default class extends RouteSet {
    constructor() {
        super();
        /**
         * get one camera
         */
        this.router.get('/:camera_id/controls', (req, res) => {
            const camera_id = req.params.camera_id;
            const camera = APP.cameras.get(camera_id);
            if (!camera)
                return this.error('Camera not found', res);

            camera.controls
                .getControlsData()
                .then(data => {
                    this.success(req, res, `Controls Data from ${camera.options.device} - ${camera.options.name}`, data);
                });

        });

        /**
         *
         */
        this.router.post('/:camera_id/controls', (req, res) => {
            const camera_id = req.params.camera_id;
            const camera = APP.cameras.get(camera_id);
            if (!camera)
                return this.error('Camera not found', res);

            camera.controls.setData(req.fields);
            this.success(req, res, `Set Controls Data from ${camera.options.device} - ${camera.options.name}`, req.fields);
        });

        /**
         *
         */
        this.router.post('/:camera_id/controls/reset', (req, res) => {
            const camera_id = req.params.camera_id;
            const camera = APP.cameras.get(camera_id);
            if (!camera)
                return this.error('Camera not found', res);

            camera.controls
                .getControlsData()
                .then(data => {
                    camera.controls.setPreset('defaults');
                    this.success(req, res, `Set Controls Data from ${camera.options.device} - ${camera.options.name}`, data);
                });

        });

        return this.router;
    }
};