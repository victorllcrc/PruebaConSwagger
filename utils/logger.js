const winston = require('winston')
//Logger es como una auditoria que ocurrio en un servidor

module.exports = new (winston.Logger)({
    transports:[
        new winston.transports.File({
            level:'info',
            json: false,
            handleExceptions:true,
            maxsize:5120000,
            maxFiles: 5,
            filename: `${__dirname}/../logs/logs-de-aplicacion.log`,
            prettyPrint: object => {return JSON.stringify(object)}   
        }),
        new winston.transports.Console({
            level:'debug',
            handleExceptions:true,
            json:false,
            colorize: true,
            prettyPrint: object => {return JSON.stringify(object)}
        })
    ]
})

/*
module.exports = winston.createLogger({
    format: winston.format.combine(
    winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(msg => `[${msg.timestamp}] ${msg.level}: ${msg.message}`)
    ),
    transports:[
    new winston.transports.File({
    level: 'info',
    handleExceptions: true,
    maxsize:5120000, // 5 MB,
    maxFiles: 5,
    format: winston.format.combine(
    winston.format.colorize({message: true})
    ),
    filename: `${__dirname}/../logs/logs-de-aplicacion.log`
    }),
    new winston.transports.Console({
    level: 'debug',
    handleExceptions: false
    })
    
    ],
    })

    */