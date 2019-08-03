export default {
    location: "",
    hostname: "localhost",
    admin: "",
    limits: {
        clients: 100,
        sources: 10,
        threadpool: 20,
        "queue-size": 524288,
        "client-timeout": 60,
        "header-timeout": 30,
        "source-timeout": 60,
        "burst-on-connect": 1,
        "burst-size": 65535
    },
    authentication: {
        "source-password": "",
        "relay-password": "",
        "admin-user": "",
        "admin-password": ""
    },
    "listen-socket": {
        port: 8100
    },
    fileserve: 1,
    paths: {
        basedir: "",
        logdir: "",
        webroot: "",
        adminroot: "",
        alias: [
            {source: "/"},
            {destination: "/status.xsl"}
        ]
    },
    logging: {
        accesslog: "icecast_access.log",
        errorlog: "icecast_error.log",
        loglevel: 4,
        logsize: 10000,
    },
    security: {
        chroot: 0
    }
};