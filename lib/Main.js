import Module from './Module.js';
import Camera from './Camera.js';

export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'CAMERA';
        this.items = []; // cameras

        this.initCameras();
    };

    initCameras(){
        this.cameraKeys = Object.keys(CONFIG).filter(c => c.includes('camera_'));
        this.cameraKeys.forEach(c => {
            const camera = new Camera(CONFIG[c]);
            this.items.push(camera);
        });
    }
};