import path from 'path';

global.P = (dir) => {
    if (dir.substring(0, 1) === '/') {
        return path.resolve(dir);
    } else {
        return path.resolve(`${APP_DIR}/${dir}`);
    }
};