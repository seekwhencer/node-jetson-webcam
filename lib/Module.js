import {EventEmitter} from 'events';
import * as R from './Ramda.js';

export default class Module {

    constructor(args) {
        this.name = 'module';
        this.label = 'MODULE';
        this.ready = false;
        this.args = args;
        this.options = {};
        this.event = new EventEmitter();

        this.on('ready', () => {
            this.ready = true;
        });
    }

    mergeOptions(args) {
        if (typeof args === 'object') {
            this.options = R.merge(this.defaults, args);
        } else {
            this.options = this.defaults;
        }
    }

    on() {
        this.event.on.apply(this.event, Array.from(arguments));
    }

    emit() {
        this.event.emit.apply(this.event, Array.from(arguments));
    }

    get args() {
        return this._args;
    }

    set args(param) {
        this._args = param;
    }

    get name() {
        return this._name;
    }

    set name(param) {
        this._name = param;
    }

    get label() {
        return this._label;
    }

    set label(param) {
        this._label = param;
    }

    get ready() {
        return this._ready;
    }

    set ready(ready) {
        this._ready = ready;
        //if (this.ready === true) {
        //    this.emit('ready', this);
        //}
    }

    get options() {
        return this._options;
    }

    set options(param) {
        this._options = param;
    }

    get defaults() {
        return this._defaults;
    }

    set defaults(param) {
        this._defaults = param;
    }


};