module.exports = {
    sql: require('mssql'), 
    knex: require('knex'), 

    dotenv: require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') }),
    database: {
        server: process.env.SQL_SERVER,
        database: process.env.SQL_DB,
        user: process.env.SQL_USERNAME,
        password: process.env.SQL_PASSWORD,
        port: parseInt(process.env.SQL_PORT),
        options: {
            encrypt: false,
            trustServerCertificate: true
        }
    },
    /**
     * @description mssql connection
     * @deprecated use knexConnection instead
     */
    connection: async () => {
        try {
            await module.exports.sql.connect(module.exports.database);
            module.exports.sql.on('error', err => { console.log(err.message); }); //handle error
            return module.exports.sql;
        }
        catch (err) {
            console.log(err.message)
        }
    },
    knexConnection: async () => {
        try {
            return module.exports.knex({
                client: 'mssql',
                connection: module.exports.database,
            });
        }
        catch (err) {
            console.log(err.message)
        }
    },
    //date format yyyy-mm-dd
    dateFormat: (date) => {
        let formattedDate = new Date(date)
        return formattedDate.toISOString().slice(0, 10)
    },
    /**
     * @description: booking status
     * @property {0} PENDING
     * @property {1} APPROVED
     * @property {2} ON_GOING
     * @property {3} COMPLETED
     * @property {4} CANCELLED
     */
    bookingStatus: {
        PENDING: 0,
        APPROVED: 1,
        ON_GOING: 2,
        COMPLETED: 3,
        CANCELLED: 4,
    },
    /**
     * @description: user role
     * @property {0} USER
     * @property {1} ADMIN
     */
    role: {
        USER: 0,
        ADMIN: 1,
    },
    /**
     * @description: user status
     * @property {0} INACTIVE
     * @property {1} ACTIVE
     */
    userStatus: {
        INACTIVE: 0,
        ACTIVE: 1,
    },
    /**
     * @description: service status
     * @property {0} UNAVAILABLE
     * @property {1} AVAILABLE
     */
    serviceStatus: {
        AVAILABLE: 1,
        UNAVAILABLE: 0,
    },
    //jwt
    JWT_EXP_TIME: 60 * 60 * 60 * 60 * 60 * 60 * 60 * 60 * 60 * 60,
    JWT_SECRET: process.env.JWT_SECRET,

}

