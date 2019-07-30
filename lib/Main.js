import Module from './Module.js';
import Camera from './Camera.js';
import Api from './Api/index.js';

export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'MAIN';
        this.items = []; // the cameras


        this
            .initCameras()
            .then(() => {
                return this.initApi();
            })
            .then(() => {
                LOG('');
                LOG('');
                LOG(this.label, '>>> ALL COMPLETE!');
            });
    };

    initCameras() {
        this.cameraKeys = Object.keys(CONFIG).filter(c => c.includes('camera_'));
        return this.initCamera();
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

    initApi() {
        return this.api = new Api();
    }
};