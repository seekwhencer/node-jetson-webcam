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
         *
         *
         */
        this.source = {
            raw: [
                '!', `video/x-raw, format=YUY2, width=${this.options.width_from || this.options.width},height=${this.options.height_from || this.options.height},type=video,framerate=${this.options.framerate_from || this.options.framerate}/1`
            ],
            h264: [
                '!', `video/x-h264,width=${this.options.width_from || this.options.width},height=${this.options.height_from || this.options.height},type=video,framerate=${this.options.framerate_from || this.options.framerate}/1,format=${this.options.inputformat}`
            ],
            mjpeg: [
                '!', `image/jpeg,width=${this.options.width_from || this.options.width},height=${this.options.height_from || this.options.height},type=video,framerate=${this.options.framerate_from || this.options.framerate}/1`,
                '!', 'jpegdec',
            ]
        };

        /**
         * some overlays
         */
        this.overlay = {
            clock: [
                '!', 'clockoverlay', 'text="TC:"', 'halignment=center', 'valignment=bottom', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans 10"'
            ],
            name: [
                '!', 'textoverlay', `text="${this.options.name}"`, 'valignment=bottom', 'halignment=left', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans, 10"'
            ],
            device: [
                '!', 'textoverlay', `text="${this.options.device}"`, 'valignment=bottom', 'halignment=right', 'shaded-background=true', 'shading-value=255', 'font-desc="Sans, 10"'
            ]
        };

        /**
         * transformation
         */
        this.transform = {
            framerate: [
                '!', 'videorate',
                '!', `video/x-raw,framerate=${this.options.framerate_to || this.options.framerate}/1`
            ],
            scale: [
                '!', 'videoscale',
                '!', `video/x-raw,width=${this.options.width_to || this.options.width},height=${this.options.height_to || this.options.height}`
            ]
        };

        /**
         * the encoder
         */
        this.encoder = {
            h264: [
                '!', 'nvvidconv',
                '!', `video/x-raw(memory:NVMM),format=NV12,width=${this.options.width_to || this.options.width},height=${this.options.height_to || this.options.height},framerate=${this.options.framerate_to || this.options.framerate}/1`,

                '!', 'nvv4l2h264enc', `bitrate=${this.options.bitrate}`, 'maxperf-enable=1', 'insert-sps-pps=1',
                '!', `video/x-h264,stream-format=byte-stream`,

                '!', 'h264parse'
            ],
            vp8: [
                '!', 'nvvidconv',
                '!', `video/x-raw(memory:NVMM),format=NV12,width=${this.options.width_to || this.options.width},height=${this.options.height_to || this.options.height},framerate=${this.options.framerate_to || this.options.framerate}/1`,

                '!', 'nvv4l2vp8enc',
                `bitrate=${this.options.bitrate * 0.8}`,
                'maxperf-enable=1',
                //'iframeinterval=100',
                'preset-level=4',
                `vbv-size=${parseInt(this.options.bitrate) * parseInt(this.options.framerate_to || this.options.framerate)}`,
                `peak-bitrate=${this.options.bitrate}`,
                'control-rate=0',
                'ratecontrol-enable=1',
                'MeasureEncoderLatency=1'
            ]
        };


        /**
         * Output parameters for gst-launch-1.0
         */
        this.output = {
            icecast: [
                '!', 'webmmux',
                'streamable=1',
                `min-cluster-duration=100000000`, // thats the f*c*n*g connection delay
                `max-cluster-duration=500000000`,
                '!', 'shout2send',
                `ip=${this.options.icecast_host}`,
                `port=${APP.icecast.options.port}`,
                `password=${APP.icecast.options.source_password}`,
                `mount=/${this.options.icecast_mount}`,
                'async=0'
            ],

            tcp: [
                '!', 'mpegtsmux',
                '!', 'tcpserversink', `port=${this.options.port}`, 'host=0.0.0.0', 'buffers-min=20000'
            ]
        };
    };

    run() {
        //const options = this.preset[this.options.mode].concat(this.output[this.options.output]);

        const params = this.buildParameter();
        LOG(this.label, this.options.name, 'STARTING', this.options.bin, 'WITH OPTIONS', params.join(' '));

        this.process.run = spawn(this.options.bin, params);

        this.process.run.stdout.setEncoding('utf8');
        this.process.run.stdout.on('data', (chunk) => {
            if (this.options.tty === '1') {
                LOG(this.label, this.options.name, 'STDOUT:', chunk.trim());
            }
            this.processEvents(chunk);
        });

        this.process.run.stderr.setEncoding('utf8');
        this.process.run.stderr.on('data', (chunk) => {
            if (this.options.tty === '1') {
                LOG(this.label, this.options.name, 'STDERR:', chunk.trim());
            }

            this.processEvents(chunk);
        });

        this.process.run.stderr.on('end', () => {
            this.emit('exited');
        });
    }

    buildParameter() {
        let params = [
            '-v',
            '-e',
            'v4l2src', `device=${this.options.device}`
        ];
        params = params.concat(this.source[this.options.source]);

        this.options.overlay.split(',').map(o => o.trim()).forEach(i => {
            if (this.overlay[i]) {
                params = params.concat(this.overlay[i]);
            }
        });

        if (
            (this.options.width_from !== this.options.width_to) ||
            (this.options.height_from !== this.options.height_to)
        ) {
            params = params.concat(this.transform.scale);
        }

        if (this.options.framerate_from !== this.options.framerate_to) {
            params = params.concat(this.transform.framerate);
        }

        params = params
            .concat(this.encoder[this.options.encoder])
            .concat(this.output[this.options.output]);

        return params;
    };

    processEvents(chunk) {
        const events = {
            ready: [
                '/GstPipeline:pipeline0/GstTCPServerSink:tcpserversink0.GstPad:sink:', // tcp streaming
                '.GstPad:sink: caps = video/webm, streamheader=(buffer)' // icecast streaming
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

    shutdown() {
        LOG(this.label, this.options.name, 'SHUTTING DOWN');
        this.process.run.kill();
    };

};