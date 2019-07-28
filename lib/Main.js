import Module from './Module.js';
import Camera from './Camera.js';

export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'CAMERA';
        this.items = []; // the cameras

        this.initCameras();
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
};