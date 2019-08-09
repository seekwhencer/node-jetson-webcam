import fs from 'fs-extra';
import {spawn} from 'child_process';
import http from 'http';
import Module from './Module.js';
import ConfigScheme from '../config/icecast.js';

export default class extends Module {

    constructor(args) {
        super(args);

        return new Promise((resolve, reject) => {
            this.name = 'icecast';
            this.label = 'ICECAST';

            this.status = false;
            this.config = ConfigScheme;

            LOG(this.label, 'INIT');

            this.defaults = CONFIG.icecast;
            this.mergeOptions(args);

            this.createFolder(this.options.path);
            this.createFolder(this.options.log_dir);

            this.saveXML();
            this.run();

            this.on('ready', () => {
                LOG(this.label, '>>> READY');
                LOG('');
                resolve(this);
            });
        });
    }

    mergeOptions(args) {
        super.mergeOptions(args);
        this.options.path = this.path = P(this.options.path_config);

        // make paths absolute
        const paths = ['config','logdir','basedir','webroot','adminroot'];
        paths.forEach(i => {
            this.config.paths[i] = this.options[`path_${i}`];
        });
        this.config.paths.config = `${this.path}`;
        this.config.paths.logdir = `${this.path}/${this.options.path_logdir}`;

        this.options.log_dir = `${this.path}/${this.options.path_logdir}`;
        this.options.xml_file = `${this.path}/${this.options.name}.xml`;

        this.config.authentication['listen-socket'] = this.options.port;
        this.config.authentication['source-password']=this.options.source_password;
        this.config.authentication['relay-password']=this.options.relay_password;
        this.config.authentication['admin-user']=this.options.admin_user;
        this.config.authentication['admin-password']=this.options.admin_password;
        this.config.location = this.options.name;
    }

    saveXML() {
        let conf = '<icecast>\n';
        Object.keys(this.config).forEach(i => {
            if (typeof this.config[i] === 'string' || typeof this.config[i] === 'number') {
                conf += '    <' + i + '>' + this.config[i] + '</' + i + '>\n';
            }
            if (typeof this.config[i] === 'object') {
                conf += '    <' + i + '>\n';
                Object.keys(this.config[i]).forEach(ii => {
                    if (typeof this.config[i][ii] === 'string' || typeof this.config[i][ii] === 'number') {
                        conf += '        <' + ii + '>' + this.config[i][ii] + '</' + ii + '>\n';
                    }
                    if (typeof this.config[i][ii] === 'object') {
                        const attr = [];
                        if (this.config[i][ii].forEach) {
                            this.config[i][ii].forEach(iii => {
                                Object.keys(iii).forEach(k => {
                                    attr.push(k + '="' + iii[k] + '"');
                                });
                            });
                            const s = attr.join(' ');
                            conf += '        <' + ii + ' ' + s + '/>\n';
                        } else {
                            conf += `        <${ii}>\n`;
                            Object.keys(this.config[i][ii]).forEach(iii => {
                                //Object.keys(iii).forEach(function (k) {
                                attr.push(`            <${iii}>${this.config[i][ii][iii]}</${iii}>`);
                                //});
                            });
                            //const s = attr.join(' ');
                            //conf += '        <' + ii + ' ' + s + '/>\n';
                            conf += `${attr.join('\n')}\n`;
                            conf += `        </${ii}>\n`;
                        }
                    }
                });
                conf += '    </' + i + '>\n';
            }
        });
        conf += '</icecast>\n';
        fs.writeFileSync(this.options.xml_file, conf);
        LOG(this.label, 'XML SAVED', this.options.xml_file);
        this.emit('saved', this);
    };

    run() {
        const options = ['-c', this.options.xml_file];
        LOG(this.label, 'STARTING', this.options.bin, 'WITH CONFIG', options.join(' '));

        this.process = spawn(this.options.bin, options);
        this.process.stdout.setEncoding('utf8');
        this.process.stderr.setEncoding('utf8');

        this.process.stderr.on('data', chunk => {
            LOG(this.label, 'TTY', chunk.trim());
        });

        this.process.stderr.on('end', () => {
            LOG(this.label, 'EXITED');
        });

        this.checkStatus();
        setTimeout(() => {
                this.checkProcess()
            }, this.options.checkup_delay
        );
    };

    get path() {
        return this._path;
    }

    set path(path) {
        this._path = path;
    }

    checkProcess() {
        LOG(this.label, 'CHECK IF IS RUNNING ...');
        if (!this.status) {
            LOG(this.label, 'IS NOT RUNNING');
            setTimeout(() => {
                    this.checkProcess()
                }, this.options.checkup_delay
            );
        } else {
            this.emit('ready');
        }
    };

    checkStatus() {
        http.get({
            hostname: this.config.hostname,
            port: this.config["listen-socket"].port,
            path: '/' + this.options.status_endpoint
        }, (res) => {
            let json = '';
            res.on('data', data => {
                json += data;
            });
            res.on('end', () => {
                json = json.replace(/"title": -/gi, '"title": "-"');
                try {
                    this.status = JSON.parse(json).icestats;
                    // LOG(this.label, 'STATUS', this.status);
                } catch (err) {}
                    setTimeout(() => {
                        this.checkStatus();
                    }, this.options.status_delay
                );
            });
        }).on('error', err => {
            this.status = false;
            setTimeout(() => {
                    this.checkStatus();
                }, this.options.status_delay
            );
        });
    }

    save() {
        let save = this.options;
        fs.writeJsonSync(this.options.conf_file, save);
        LOG(this.label, 'JSON SAVED', this.options.conf_file);
    }

    getStatusByChannel(name) {
        let source = this.status.source;
        if (!source)
            return false;

        if (!source.filter)
            source = [this.status.source];

        return source.filter(i => i.server_name === name)[0];
    }
};