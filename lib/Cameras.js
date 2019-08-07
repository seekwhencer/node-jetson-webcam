import Module from './Module.js';
import Camera from './Camera.js';

export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'CAMERAS';

        LOG(this.label, '>>> INIT');

        return new Promise((resolve, reject) => {
            this.cameraKeys = Object.keys(CONFIG).filter(c => c.includes('camera_'));

            this
                .initCamera() // with the first one
                .then(() => {
                    LOG(this.label, '>>> READY');
                    LOG('');
                    resolve(this);
                });
        });
    }

    initCamera(index) {
        if (!index)
            index = 0;

        if (this.cameraKeys.length === index) {
            return Promise.resolve();
        }

        const cameraKey = this.cameraKeys[index];
        return new Camera(CONFIG[cameraKey])
            .then(camera => {
                this.items.push(camera);
                return this.initCamera(index + 1);
            });

    }

    /**
     * all cameras together
     */
    record() {
        this.items.forEach(i => {
            i.record();
        });
    }
    stop() {
        this.items.forEach(i => {
            i.stop();
        });
    }
};