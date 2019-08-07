import Module from './Module.js';
import Gst from './Gst.js';
import CameraControls from './CameraControls.js';
import fs from 'fs-extra';
import Os from 'os';

import {spawn} from 'child_process';

export default class extends Module {
    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.label = 'CAMERA';
            this.defaults = CONFIG.camera;

            this.mergeOptions(args);

            this.createFolder(P(this.options.recordings_folder));
            this.createFolder(P(this.options.snapshot_folder));
            this.createFolder(P(`${this.options.snapshot_folder}/${this.options.device_name}`));

            LOG(this.label, 'INIT', this.options.name);

            this.snapshotInterval = false;
            this.controls = new CameraControls(this.options);

            this.gst = new Gst(this.options);
            this.process = {
                caps: false,
                record: false
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

            this.on('snapshot', () => {
                LOG(this.label, this.options.name, 'SNAPSHOT TAKEN:', this.snapshotFile);
                if (this.options.snapshot_timestamp === '1')
                    this.copySnapshot();

                LOG('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            });

            this
                .listCapabilities()
                .then(caps => {
                    LOG('');
                    LOG('');
                    LOG(this.label, this.options.name, 'CAPABILITIES FOR:', this.options.device, caps);
                    LOG('');
                    LOG('');
                    setTimeout(() => {
                        this.run();
                        this.initSnapshotInterval();
                    }, this.options.caps_delay);
                });
        });
    };

    mergeOptions(args) {
        super.mergeOptions(args);
        this.options.device_name = this.options.device.split('/')[this.options.device.split('/').length - 1];
        this.setStreamUrl();
    }

    listCapabilities() {
        return new Promise((resolve, reject) => {
            let response = '';
            const options = [
                '-f', 'v4l2', '-list_formats', 'all', '-i', this.options.device
            ];
            this.process.caps = spawn(this.options.ffmpeg_bin, options);
            this.process.caps.stderr.setEncoding('utf8');
            this.process.caps.stderr.on('data', (chunk) => {
                response += chunk;
            });
            this.process.caps.stderr.on('end', () => {
                resolve(response.split('\n').filter(r => r.includes('video4linux2,v4l2')).join('\n'));
            });
        });
    }

    run() {
        this.gst.run();
    }

    shutdown() {
        this.gst.shutdown();
        // @TODO - and what happens with the cam object here?
    };

    setStreamUrl() {
        let ni = Os.networkInterfaces();
        const host_external = Object
            .keys(ni)
            .map(interf => ni[interf]
                .map(o => !o.internal && o.family === 'IPv4' && o.address))
            .reduce((a, b) => a
                .concat(b))
            .filter(o => o)[0];

        this.options.streamUrl = '';
        if (this.options.output === 'icecast') {
            this.options.streamUrl += `http://${this.options.host_external || host_external}:${APP.icecast.options.port}/${this.options.icecast_mount}`;
        }
        if (this.options.output === 'tcp') {
            this.options.streamUrl += `tcp://${this.options.host_external || host_external}:${this.options.port}`;
        }
    }

    record() {
        if (this.process.record)
            return false;

        const filePath = `${this.options.recordings_folder}/${this.options.filebase}_${this.options.device_name}_${parseInt(Date.now() / 1000)}.webm`;
        const options = [
            '-i',
            this.options.streamUrl.trim(),
            '-vcodec', 'copy',
            filePath
        ];
        LOG(this.label, this.options.name, 'RECORDING...', this.options.ffmpeg_bin, 'WITH OPTIONS', JSON.stringify(options));

        this.process.record = spawn(this.options.ffmpeg_bin, options);

        this.process.record.stdout.setEncoding('utf8');
        this.process.record.stdout.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'RECORDING STDOUT:', chunk.trim());
        });

        this.process.record.stderr.setEncoding('utf8');
        this.process.record.stderr.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'RECORDING STDERR:', chunk.trim());
        });

        this.process.record.stderr.on('end', () => {
            this.process.record = false;
        });
    }

    stop() {
        LOG(this.label, this.options.name, 'RECORDING STOPPED');
        if (this.process.record.kill)
            this.process.record.kill();

        this.process.record = false;
    }

    snapshot(with_timestamp) {
        this.process.snapshot = false;
        this.snapshotFile = P(`${this.options.snapshot_folder}/${this.options.snapshot_filebase}_${this.options.device_name}.jpg`);

        const options = [
            '-i',
            this.options.streamUrl,
            '-vframes', 1,
            this.snapshotFile,
            '-y'
        ];
        LOG(this.label, this.options.name, 'TAKING SNAPSHOT...', this.options.ffmpeg_bin, 'WITH OPTIONS', options.join(' '));
        this.process.snapshot = spawn(this.options.ffmpeg_bin, options);

        this.process.snapshot.stdout.setEncoding('utf8');
        this.process.snapshot.stdout.on('data', (chunk) => {
            //LOG(this.label, this.options.name, 'SNAPSHOT STDOUT:', chunk.trim());
        });

        this.process.snapshot.stderr.setEncoding('utf8');
        this.process.snapshot.stderr.on('data', (chunk) => {
            if (chunk.toString().trim().includes('Output #0, ')) {
                this.emit('snapshot');
                if (with_timestamp === true) {
                    this.copySnapshot();
                }
            }
        });

        this.process.snapshot.stderr.on('end', () => {
            this.process.snapshot = false;
        });
    }

    initSnapshotInterval() {
        const snapshotInterval = parseInt(this.options.snapshot_interval);
        if (snapshotInterval > 0) {
            this.snapshotInterval = setInterval(() => {
                this.snapshot();
            }, (snapshotInterval * 1000));
        }
    }

    copySnapshot() {
        const timecoded = P(`${this.options.snapshot_folder}/${this.options.device_name}/${this.options.snapshot_filebase}_${this.options.device_name}_${parseInt(Date.now() / 1000)}.jpg`);
        fs.copySync(this.snapshotFile, timecoded);
    }
};