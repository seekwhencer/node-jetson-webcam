import Module from './Module.js';
import Cameras from './Cameras.js';
import Api from './Api/index.js';

export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'MAIN';
        this.items = []; // the cameras

        new Cameras()
            .then(cameras => {
                this.cameras = cameras;
                return new Api();
            })
            .then(api => {
                this.api = api;
            })
            .then(() => {
                LOG('');
                LOG('');
                LOG(this.label, '>>> ALL COMPLETE!');
            });
    };
};