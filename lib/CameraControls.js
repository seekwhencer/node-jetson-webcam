import Module from './Module.js';
import {spawn} from 'child_process';

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
                settings: false
            };

            this.getControlsData();
            this.setControl('white_balance_temperature_auto', 0);
            this.setControl('white_balance_temperature', 2000);
            this.setControl('exposure_auto',1); // auto brightness
            this.setControl('exposure_auto_priority',0);
            this.setControl('power_line_frequency',1);

        });
    };

    mergeOptions(args) {
        super.mergeOptions(args);
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
        LOG(this.label, 'SET PROPERTY:', params);

        this.process.set = spawn(this.options.bin, params);
        this.process.set.stderr.on('data', (chunk) => {
            LOG(this.label, 'TTY', chunk.toString());
        });

        this.process.set.stderr.on('end', () => {
            this.getControlsData();
        });
    }

};