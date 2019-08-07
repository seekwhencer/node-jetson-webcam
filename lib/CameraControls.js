import Module from './Module.js';
import {spawn} from 'child_process';
import * as R from './Ramda.js';

export default class extends Module {
    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.label = 'CAMERA CONTROLS';

            this.defaults = CONFIG.cameracontrols;
            this.mergeOptions(args);

            LOG(this.label, 'INIT');

            // the cam control data
            this.controls = null;

            this.process = {
                get: false,
                set: false
            };

            this.preset = {
                defaults: {
                    brightness: this.options.brightness,
                    contrast: this.options.contrast,
                    saturation: this.options.saturation,
                    sharpness: this.options.sharpness,
                    power_line_frequency: this.options.power_line_frequency,
                    white_balance_temperature_auto: this.options.white_balance_temperature_auto,
                    exposure_auto: this.options.exposure_auto,
                    focus_auto: this.options.focus_auto,
                    focus_absolute: this.options.focus_absolute,
                    hue: this.options.hue,
                    gamma: this.options.gamma,
                },
                day: {
                    exposure_auto: 3,
                    brightness: 100
                },
                night: {
                    white_balance_temperature_auto: 1,
                    exposure_auto: 3,
                    focus_auto: 0,
                    focus_absolute: 0,
                    brightness: 150
                }
            };

            this.getControlsData()
                .then(() => {
                    this.setPreset('defaults');
                    //this.setPreset('day');
                });

        });
    };

    mergeOptions(args) {
        this.options = {
            ...this.defaults,
            ...args,
            bin: this.defaults.bin
        };
    }

    getControlsData() {
        return new Promise((resolve, reject) => {
            let data = '';
            const params = ['-d', this.options.device, '--list-ctrls'];
            this.process.get = spawn(this.options.bin, params);

            this.process.get.stdout.setEncoding('utf8');
            this.process.get.stdout.on('data', (chunk) => {
                data += chunk.trim();
            });

            this.process.get.stderr.setEncoding('utf8');
            this.process.get.stderr.on('data', (chunk) => {
                data += chunk.trim();
            });

            this.process.get.stderr.on('end', () => {
                this.parseControlsData(data);
                resolve(this.controls); // magic
            });
        });
    }

    parseControlsData(data) {
        let controls = {};
        data.split("\n").map(r => {
            let props = {};
            const key = r.trim().split(' ')[0];
            r.trim().split(' : ')[1].split(' ').forEach(i => {
                const left = i.split('=')[0];
                const right = i.split('=')[1];
                props[left] = right;
            });
            controls[key] = props;
        });
        this.controls = controls;
    }

    setControls(query) {
        const params = ['-d', this.options.device, '--set-ctrl', query];
        LOG(this.label, 'SET QUERY:', params.join(' '));

        this.process.set = spawn(this.options.bin, params);
        this.process.set.stderr.on('data', (chunk) => {
            LOG(this.label, 'TTY', chunk.toString().trim());
        });

        this.process.set.stderr.on('end', () => {
            this.getControlsData();
        });
    }

    setPreset(preset) {
        LOG(this.label, 'SET PRESET', preset);
        const availableControls = Object.keys(this.controls);
        const selectedPreset = this.preset[preset];
        let queryArray = [];
        availableControls.forEach(p => {
            if (selectedPreset[p]) {
                queryArray.push(`${p}=${selectedPreset[p]}`);
            }
        });
        const query = queryArray.join(',');
        this.setControls(query);
    }

};