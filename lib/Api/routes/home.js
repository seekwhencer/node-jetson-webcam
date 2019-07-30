import RouteSet from '../RouteSet.js'

export default class extends RouteSet {
    constructor() {
        super();
        this.router.get('/', (req, res) => {
            const data = APP.items.map(i => i.options);
            res.json(data);
        });
        return this.router;
    }
};