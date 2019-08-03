import Module from './Module.js';
import Gst from './Gst.js';
import CameraControls from './CameraControls.js';

import {spawn} from 'child_process';

export default class extends Module {
    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.label = 'CAMERA';

            this.defaults = CONFIG.camera;
            this.mergeOptions(args);
            this.createFolder(P(this.options.recordings_folder));

            LOG(this.label, 'INIT', this.options.name);

            this.controls = new CameraControls(this.options);

            this.gst = new Gst(this.options);
            this.process = {
                ffmpeg : false
            };

            this.gst.on('ready', () => {
                LOG(this.label, this.options.name, '>>> READY');
                setTimeout(() => {
                    resolve(this);
                }, this.options.ready_delay);
            });

            this.gst.on('data', chunk => {
                LOG(this.label, this.options.name, 'GOT CHUNK:', chunk.trim());
            });

            this.gst.on('error', () => {
                this.shutdown();
            });

            this
                .listCapabilities()
                .then(caps => {
                    LOG('');
                    LOG('');
                    LOG(this.label, this.options.name, 'CAPABILITIES FOR:', this.options.device, '\n\r', caps);
                    LOG('');
                    LOG('');
                    setTimeout(() => {
                        this.run();
                    }, this.options.caps_delay);
                });
        });
    };

    mergeOptions(args) {
        super.mergeOptions(args);
        this.options.device_name = this.options.device.split('/')[this.options.device.split('/').length - 1];
    }

    listCapabilities() {
        return new Promise((resolve, reject) => {
            let response = '';
            const options = [
                '-f', 'v4l2', '-list_formats', 'all', '-i', this.options.device
            ];
            this.process.ffmpeg = spawn(this.options.ffmpeg_bin, options);
            this.process.ffmpeg.stderr.setEncoding('utf8');
            this.process.ffmpeg.stderr.on('data', (chunk) => {
                response += chunk;
            });
            this.process.ffmpeg.stderr.on('end', () => {
                resolve(response.split('\n').filter(r => r.includes('video4linux2,v4l2')).join('\n'));
            });
        });
    }

    run(){
        this.gst.run();
    }

    record() {
        this.gst.record();
    }

    stop() {
        this.gst.stop();
    }

    shutdown() {
        this.gst.shutdown();
        // @TODO - and what happens with the cam object here?
    };
};