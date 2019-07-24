import Module from './Module.js';
import {spawn} from 'child_process';

export default class extends Module {
    constructor(args){
        super(args);
        this.label = 'CAMERA';

        this.defaults = CONFIG.camera;
        this.mergeOptions(args);

        LOG(this.label, 'INIT', this.options.name);

        this.on('data',chunk=>{
            LOG(this.label, this.options.name, 'GOT CHUNK:', chunk.trim());
        });

        this.run();
    };

    /**
     * working on it...
     */
    run() {
        const options = [
            //'-v', 'v4l2src', 'device=/dev/video0',
            '-v', 'v4l2src', `device=${this.options.device}`,
            //'!', `video/x-raw,width=${this.options.width},height=${this.options.height},framerate=${this.options.framerate}/1,format=${this.options.inputformat}`,
            //'!', `image/jpeg,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1,format=${this.options.inputformat}`,
            '!', `video/x-h264,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1,format=${this.options.inputformat}`,
            //'!', 'jpegdec',

            '!', 'h264parse',
            '!', 'nvv4l2decoder',
            //'!', 'nvvidconv',
            '!', `video/x-raw(memory:NVMM),format=NV12`,
            '!', 'nvv4l2h264enc',
            '!', 'video/x-h264,stream-format=byte-stream',
            '!', 'h264parse',
            //'!', 'omxh264enc',
            '!', 'qtmux',
            '!', 'filesink', 'location=./test.mp4',
            '-e'
        ];
        LOG(this.label, this.options.name, 'STARTING', this.options.bin, 'WITH OPTIONS', options.join(' '));

        const matches = {
            trigger: new RegExp(/playlist:\squeue\ssong\s/),
        };

        // gst-launch-1.0 -v v4l2src device=/dev/video2 ! 'video/x-raw,width=640, height=480, framerate=30/1, format=YUY2' ! nvvidconv ! 'video/x-raw(memory:NVMM),format=NV12' ! omxh264enc ! qtmux ! filesink location=test.mp4 -e
        this.process = spawn(this.options.bin, options);

        this.process.stdout.setEncoding('utf8');
        this.process.stdout.on('data', (chunk) => {
            LOG(this.label, 'STDOUT:', chunk.trim());
        });

        this.process.stderr.setEncoding('utf8');
        this.process.stderr.on('data', (chunk) => {
            LOG(this.label, 'STDERR:', chunk.trim());
        });

        /*this.process.stderr.on('data', (chunk) => {
            this.emit('data', chunk);
            Object.keys(matches).forEach((key) => {
                if (matches[key].length === undefined) {
                    if (chunk.match(matches[key])) {
                        this.emit(key, chunk);
                    }
                } else {
                    matches[key].forEach((event) => {
                        if (chunk.match(event)) {
                            this.emit(key, chunk);
                        }
                    });
                }
            });
        });*/

        this.process.stderr.on('end', () => {
            this.emit('exited');
        });
    };

    shutdown() {
        LOG(this.label, this.name, 'SHUTTING DOWN');
        const options = [this.options.conf_file, '--kill'];
        spawn(this.options.bin, options);
    };
};