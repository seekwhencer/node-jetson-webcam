export default class RouteSet {
    constructor(parent) {
        this.parent = parent || false;
        this.router = EXPRESS.Router();
        this.endpoint = '';
        this.url = '';
    }

    one(req, res) {
        const match = req.params[this.param];
        const item = this.source.get(match, 'id');
        return item;
    }

    success(req, res, message, data) {
        res.json({
            message: message,
            ...{data: data}
        });
    }

    error(message, res, data) {
        if (!data)
            data = {};

        res.json({
            error: message,
            ...{data: data}
        });
    }

    get endpoint() {
        return this._endpoint;
    }

    set endpoint(value) {
        this._endpoint = value;
    };

    addRoutes(Routes) {
        if (!this.parent) { // ony the first (root) route set has no parent
            if (CONFIG.api.root_endpoint) {
                this.url = `/${CONFIG.api.root_endpoint}`;
            }
        } else {
            this.url = `${this.parent.url}`;
            if (this.endpoint) { // if false, the parent's one will be used
                this.url += `/${this.endpoint}`;
            }
        }

        if (!APIAPP.routeset[this.url])
            APIAPP.routeset[this.url] = [];

        Object.keys(Routes).forEach(r => {
            const router = new Routes[r](this); // more than one can be feeded from here

            router.stack
                .filter(r => r.route)
                .map(r => {
                    let row = {};
                    Object.keys(r.route.methods).forEach(method => {
                        if (!APIAPP.endpoints[method])
                            APIAPP.endpoints[method] = [];

                        row[method] = `${this.url}${r.route.path}`;
                        APIAPP.endpoints[method].push(row[method]); // that is not fine!
                    });
                    return row; // not used
                });

            // here the final url will be mapped to the created router elements
            APIAPP.routeset[this.url].push(APIAPP.use(this.url, router));
        });
    };
};