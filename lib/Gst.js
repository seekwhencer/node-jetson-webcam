import Module from './Module.js';
import {spawn} from 'child_process';


export default class extends Module {
    constructor(args) {
        super(args);
        this.mergeOptions(args);
        this.label = 'GSTREAMER';

        /**
         * register here process names
         */
        this.process = {
            run: false,
            record: false,
        };

        /**
         * Output parameters for gst-launch-1.0
         *
         */
        this.output = {
            icecast: [
                //'!', 'h264parse',
                '!', 'webmmux',
                '!', 'shout2send', `ip=${this.options.icecast_host}`, `port=${APP.icecast.options.port}`, `password=${APP.icecast.options.source_password}`, `mount=/${this.options.icecast_mount}`
            ],

            tcp: [
                '!', 'h264parse',
                '!', 'mpegtsmux',
                '!', 'tcpserversink', `port=${this.options.port}`, 'host=0.0.0.0', 'buffers-min=20000'
            ]
        };

        /**
         * some working (or not) gst-launch parameter
         */
        this.preset = {

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
            ],

            /**
             * working
             */
            tcpmjpeg: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`,
                '!', `image/jpeg,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1`,
                '!', 'jpegparse',
                '!', 'jpegdec',
                '!', 'videoconvert',

                '!', 'clockoverlay', 'text="TC:"', 'halignment=center', 'valignment=bottom', 'shaded-background=true', 'font-desc="Sans 10"',

                '!', 'omxh264enc',
                '!', `video/x-h264,stream-format=byte-stream`,
            ],

            /**
             * working, used
             */
            tcpmjpegnv: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`,
                '!', `image/jpeg,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1`,
                '!', 'jpegdec',

                '!', 'clockoverlay', 'text="TC:"', 'halignment=center', 'valignment=bottom', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans 10"',
                '!', 'textoverlay', `text="${this.options.name} : ${this.options.port}"`, 'valignment=bottom', 'halignment=left', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans, 10"',
                '!', 'textoverlay', `text="${this.options.device}"`, 'valignment=bottom', 'halignment=right', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans, 10"',

                '!', 'nvvidconv',
                '!', `video/x-raw(memory:NVMM),format=NV12,width=${this.options.width},height=${this.options.height},framerate=${this.options.framerate}/1`,

                '!', 'nvv4l2h264enc', `bitrate=${this.options.bitrate}`, 'maxperf-enable=1', 'insert-sps-pps=1',
                '!', `video/x-h264,stream-format=byte-stream`,
            ],

            vp8nv: [
                '-v',
                '-e',
                'v4l2src', `device=${this.options.device}`,
                '!', `image/jpeg,width=${this.options.width},height=${this.options.height},type=video,framerate=${this.options.framerate}/1`,
                '!', 'jpegdec',

                '!', 'clockoverlay', 'text="TC:"', 'halignment=center', 'valignment=bottom', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans 10"',
                '!', 'textoverlay', `text="${this.options.name} : ${this.options.port}"`, 'valignment=bottom', 'halignment=left', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans, 10"',
                '!', 'textoverlay', `text="${this.options.device}"`, 'valignment=bottom', 'halignment=right', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans, 10"',

                '!', 'nvvidconv',
                '!', `video/x-raw(memory:NVMM),format=NV12,width=${this.options.width},height=${this.options.height},framerate=${this.options.framerate}/1`,

                '!', 'nvv4l2vp8enc', `bitrate=${this.options.bitrate}`, 'maxperf-enable=1'
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
    };

    run() {
        const options = this.preset[this.options.mode].concat(this.output[this.options.output]);
        LOG(this.label, this.options.name, 'STARTING', this.options.bin, 'WITH OPTIONS', options.join(' '));

        this.process.run = spawn(this.options.bin, options);

        this.process.run.stdout.setEncoding('utf8');
        this.process.run.stdout.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'STDOUT:', chunk.trim());
            this.processEvents(chunk);
        });

        this.process.run.stderr.setEncoding('utf8');
        this.process.run.stderr.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'STDERR:', chunk.trim());
            this.processEvents(chunk);
        });

        this.process.run.stderr.on('end', () => {
            this.emit('exited');
        });
    }

    processEvents(chunk) {
        const events = {
            ready: [
                '/GstPipeline:pipeline0/GstTCPServerSink:tcpserversink0.GstPad:sink:', // tcp streaming
                '/GstPipeline:pipeline0/GstShout2send:shout2send0.GstPad:sink:' // icecast streaming
            ],
            error: 'Failed to allocate required memory.'
        };
        Object.keys(events).forEach(m => {
            if (events[m] === '')
                return;

            if (typeof events[m] === 'object') {
                events[m].forEach(mm => {
                    if (chunk.includes(mm)) {
                        this.emit(m);
                    }
                });
            } else {
                if (chunk.includes(events[m])) {
                    this.emit(m);
                }
            }
        });
    }

    record() {
        if (this.process.record)
            return false;

        const filePath = `${this.options.recordings_folder}/${this.options.filebase}_${this.options.device_name}_${parseInt(Date.now() / 1000)}.ts`;
        const options = [
            '-i',
            `tcp://${this.options.host}:${this.options.port}`, '-vcodec', 'copy',
            filePath,
        ];
        LOG(this.label, this.options.name, 'RECORDING...', this.options.bin, 'WITH OPTIONS', options.join(' '));

        this.process.record = spawn(this.options.ffmpeg_bin, options);

        this.process.record.stdout.setEncoding('utf8');
        this.process.record.stdout.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'RECORDING STDOUT:', chunk.trim());
            this.processEvents(chunk);
        });

        this.process.record.stderr.setEncoding('utf8');
        this.process.record.stderr.on('data', (chunk) => {
            LOG(this.label, this.options.name, 'RECORDING STDERR:', chunk.trim());
            this.processEvents(chunk);
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

    shutdown() {
        LOG(this.label, this.options.name, 'SHUTTING DOWN');
        this.process.run.kill();
    };

};