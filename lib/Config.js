import fs from 'fs-extra';
import ini from 'ini';

export default class AppConfig {
    constructor(args){
        this.name = 'appconfig';
        this.label = 'APPCONFIG';
        LOG(this.label, 'INIT', ENV);

        this.filePath = `config/${ENV}.conf`;

        if(fs.existsSync(this.filePath))
            return ini.parse(fs.readFileSync(this.filePath, 'utf-8'));


    }
};
