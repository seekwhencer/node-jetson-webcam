import Module from './Module.js';
import {spawn} from 'child_process';

export default class extends Module {
    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.label = 'CAMERA';

            this.defaults = CONFIG.camera;
            this.mergeOptions(args);

            LOG(this.label, 'INIT', this.options.name);

            this.on('data', chunk => {
                LOG(this.label, this.options.name, 'GOT CHUNK:', chunk.trim());
            });

            this.on('ready', () => {
                LOG(this.label, this.options.name, '>>> READY');
                setTimeout(() => {
                    resolve(this);
                }, this.options.ready_delay);
            });

            this.on('error', () => {
                this.shutdown();
            });

            this
                .listCapabilities(this.options.device)
                .then(caps => {
                    LOG(this.label, this.options.name, 'CAPABILITIES FOR:', this.options.device, '\n\r', caps);
                    setTimeout(() => {
                        this.run();
                    }, this.options.caps_delay);
                });
        });
    };

    mergeOptions(args){
        super.mergeOptions(args);
        this.options.device_name = this.options.device.split('/')[this.options.device.split('/').length-1];
    }

    /**
     * working on it...
     */
    run() {

        const gstreamerOptions = {

            // working with every webcam
            // webcam must support 640 x 480 with 30 fps in YUY2 format
            tcp: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`, 'io-mode=4',
                '!', `video/x-raw, format=YUY2, width=${this.options.width},height=${this.options.height}, type=video, framerate=${this.options.framerate}/1`,

                '!', 'nvvidconv',
                '!', `video/x-raw(memory:NVMM), format=NV12`,

                '!', 'omxh264enc',
                '!', `video/x-h264,stream-format=byte-stream`,

                '!', 'h264parse',
                '!', 'mpegtsmux',

                '!', 'tcpserversink', `port=${this.options.port}`, 'host=0.0.0.0', 'buffers-min=10000', // 'recover-policy=keyframe', 'sync-method=latest-keyframe', 'sync=false',
            ],

            tcpmjpeg: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`,
                '!', `image/jpeg,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1`,
                '!', 'jpegparse',
                '!', 'jpegdec',
                '!', 'videoconvert',

                '!', 'omxh264enc',
                '!', `video/x-h264,stream-format=byte-stream`,

                '!', 'h264parse',
                '!', 'mpegtsmux',

                '!', 'tcpserversink', `port=${this.options.port}`, 'host=0.0.0.0', 'buffers-min=10000',
            ],
/*
            stream: [
                '-v',
                '-e',

                'v4l2src', `device=${this.options.device}`,
                '!', `video/x-h264,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1,format=${this.options.inputformat}`,

                '!', 'h264parse',

                '!', 'nvv4l2decoder',
                '!', `video/x-raw(memory:NVMM),format=NV12,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1`,

                '!', 'queue',
                '!', 'nvv4l2h264enc', 'preset-level=4',
                '!', `video/x-h264,stream-format=byte-stream`,

                '!', 'queue',
                '!', 'h264parse',

                '!', 'queue',
                '!', 'rtph264pay', 'mtu=1400',
                '!', 'udpsink', 'host=0.0.0.0', 'port=5100', 'sync=false', 'async=false',


                //'!', 'queue',
                //'!', 'omxh264enc',
                //'!', 'h264parse',
                //'!', 'tcpserversink', 'port=5100', 'host=0.0.0.0', 'recover-policy=keyframe', 'sync-method=latest-keyframe', 'sync=false',

                //'!', 'qtmux',
                //'!', 'tcpserversink', 'port=5100', 'host=0.0.0.0', 'buffers-min=2000',  'recover-policy=keyframe', 'sync-method=latest-keyframe', 'sync=false',
            ],
            file: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`,
                '!', `video/x-h264,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1,format=${this.options.inputformat}`,

                '!', 'h264parse',

                '!', 'nvv4l2decoder',
                '!', `video/x-raw(memory:NVMM),format=NV12`,

                '!', 'nvv4l2h264enc', 'preset-level=4',
                '!', `video/x-h264,stream-format=byte-stream`,

                //'!', 'h264parse',
                '!', 'qtmux',
                '!', 'filesink', 'location=./test.mp4',
            ],

            file2: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`,
                '!', `video/x-raw, format=YUY2, width=640, height=480, type=video, framerate=30/1`,

                '!', 'nvvidconv',
                '!', `video/x-raw(memory:NVMM), format=NV12`,

                '!', 'omxh264enc',
                '!', 'qtmux',
                '!', 'filesink', 'location=test.mp4'
            ],

            tcp1: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`,
                '!', `video/x-raw, format=NV12,  width=640, height=480, framerate=30/1`,

                '!', 'jpegparse',
                '!', 'nvjpegdec',

                '!', 'nvvidconv',
                '!', `video/x-raw(memory:NVMM), format=NV12`,

                '!', 'omxh264enc',
                '!', `video/x-h264,stream-format=byte-stream`,

                '!', 'h264parse',
                '!', 'mpegtsmux',

                '!', 'tcpserversink', `port=${this.options.port}`, 'host=0.0.0.0', 'buffers-min=10000', // 'recover-policy=keyframe', 'sync-method=latest-keyframe', 'sync=false',
            ],

            tcp2: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`,
                '!', `video/x-h264, format=YUY2, width=640, height=480, type=video, framerate=30/1`,

                '!', 'h264parse',

                '!', 'nvv4l2decoder',
                '!', `video/x-raw(memory:NVMM),format=NV12`,

                '!', 'nvv4l2h264enc', 'preset-level=4', 'iframeinterval=100', 'maxperf-enable=1', 'MeasureEncoderLatency=1',
                '!', `video/x-h264,stream-format=byte-stream`,

                '!', 'h264parse',
                '!', 'mpegtsmux',
                '!', 'tcpserversink', `port=${this.options.port}`, 'host=0.0.0.0', 'buffers-min=2000', 'recover-policy=keyframe', 'sync-method=latest-keyframe', 'sync=false',

            ]

 */
        };

        const options = gstreamerOptions[this.options.mode];
        LOG(this.label, this.options.name, 'STARTING', this.options.bin, 'WITH OPTIONS', options.join(' '));

        // gst-launch-1.0 -v v4l2src device=/dev/video2 ! 'video/x-raw,width=640, height=480, framerate=30/1, format=YUY2' ! nvvidconv ! 'video/x-raw(memory:NVMM),format=NV12' ! omxh264enc ! qtmux ! filesink location=test.mp4 -e
        this.process = spawn(this.options.bin, options);

        this.process.stdout.setEncoding('utf8');
        this.process.stdout.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'STDOUT:', chunk.trim());
            this.processEvents(chunk);
        });

        this.process.stderr.setEncoding('utf8');
        this.process.stderr.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'STDERR:', chunk.trim());
            this.processEvents(chunk);
        });

        this.process.stderr.on('end', () => {
            this.emit('exited');
        });
    };

    processEvents(chunk) {
        const events = {
            ready: '/GstPipeline:pipeline0/GstTCPServerSink:tcpserversink0.GstPad:sink:',
            error: 'Failed to allocate required memory.'
        };
        Object.keys(events).forEach(m => {
            if (events[m] === '')
                return;

            if (chunk.includes(events[m])) {
                this.emit(m);
            }
        });
    }

    listCapabilities(device) {
        return new Promise((resolve, reject) => {
            let response = '';
            const options = [
                '-f', 'v4l2', '-list_formats', 'all', '-i', device
            ];
            const ffmpegProcess = spawn(this.options.ffmpeg_bin, options);
            ffmpegProcess.stderr.setEncoding('utf8');
            ffmpegProcess.stderr.on('data', (chunk) => {
                response += chunk;
            });
            ffmpegProcess.stderr.on('end', () => {
                resolve(response.split('\n').filter(r => r.includes('video4linux2,v4l2')).join('\n'));
            });
        });
    }

    record(){
        const options = [
            'tcpclientsrc', `port=${this.options.port}`, `host=${this.options.host}`,
            '!', 'h264parse',

            '!', 'nvv4l2decoder',
            '!', `video/x-raw(memory:NVMM),format=NV12`,

            '!', 'nvv4l2h264enc', 'preset-level=4',
            '!', `video/x-h264,stream-format=byte-stream`,

            '!', 'mpegtsmux',
            '!', 'filesink', `location=./${this.options.filebase}_${this.options.device_name}_${parseInt(Date.now()/1000)}.ts`,
        ];
        LOG(this.label, this.options.name, 'RECORDING...', this.options.bin, 'WITH OPTIONS', options.join(' '));

        this.processRecord = spawn(this.options.bin, options);

        this.processRecord.stdout.setEncoding('utf8');
        this.processRecord.stdout.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'STDOUT:', chunk.trim());
            this.processEvents(chunk);
        });

        this.processRecord.stderr.setEncoding('utf8');
        this.processRecord.stderr.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'STDERR:', chunk.trim());
            this.processEvents(chunk);
        });

        this.processRecord.stderr.on('end', () => {

        });
    }

    stop(){
        LOG(this.label, this.options.name, 'RECORDING STOPPED');
        this.processRecord.kill();
    }

    shutdown() {
        LOG(this.label, this.options.name, 'SHUTTING DOWN');
        this.process.kill();
    };
};