//Connect to proper database (local vs hosted)
require('dotenv').config();
const config = require('./config');
const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const curConfig = config[env]; //access proper configurations

//sequelize instance
const sequelize = new Sequelize(curConfig.database, curConfig.username, curConfig.password, {
    host: curConfig.host,
    dialect: curConfig.dialect,
    dialectOptions: curConfig.dialectOptions, //wont include if undefined
});

sequelize.authenticate()
    .then(() => {
        console.log("database connection to ${env} database was successfull");
    })
    .catch(err => {
        console.error("error", err);
    });
module.exports = sequelize;