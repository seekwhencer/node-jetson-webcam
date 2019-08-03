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

            this.process = {
                get: false,
                set: false
            };

            this.getControlsData();
            this.setControl('white_balance_temperature_auto', this.options.white_balance_temperature_auto);
            this.setControl('white_balance_temperature', this.options.white_balance_temperature);
            this.setControl('exposure_auto', this.options.exposure_auto); // auto brightness, 0 means auto, 1 means manual
            this.setControl('exposure_auto_priority', this.options.exposure_auto_priority);
            this.setControl('power_line_frequency', this.options.power_line_frequency);
            this.setControl('focus_auto', this.options.focus_auto);
            this.setControl('focus_absolute', this.options.focus_absolute);

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
    }

    setControl(key, value) {
        const params = ['-d', this.options.device, '--set-ctrl', `${key}=${value}`];
        LOG(this.label, 'SET PROPERTY:', params.join(' '));

        this.process.set = spawn(this.options.bin, params);
        this.process.set.stderr.on('data', (chunk) => {
            LOG(this.label, 'TTY', chunk.toString());
        });

        this.process.set.stderr.on('end', () => {
            this.getControlsData();
        });
    }

};