import Module from './Module.js';
import Icecast from './Icecast.js';
import Cameras from './Cameras.js';
import Api from './Api/index.js';


export default class extends Module {
    constructor(args) {
        super(args);
        this.label = 'MAIN';
        this.items = []; // the cameras

        new Icecast()
            .then(icecast => {
                this.icecast = icecast;
                return new Cameras();
            })
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