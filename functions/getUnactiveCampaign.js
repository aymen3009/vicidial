const mariadb = require('mariadb');
require('dotenv').config()
const fs = require("fs");
const pool = mariadb.createPool({
    host: process.env.MysqlHost,
    user: process.env.MysqlUser,
    password: process.env.MysqlPassword,
    database: process.env.MysqlDataBase
});
const ora = require('ora');
const figures = require('figures');
const colors = require('colors');
var spinner = ora({
    text: "",
    color: 'red'
});

const getUnactiveCampaign = async ()=>{
    let connection;
    try {
        connection = await pool.getConnection();
       let campaign =  await connection.query("SELECT campaign_id,campaign_name,active from vicidial_campaigns where active='N'");
       delete campaign.meta
        return campaign
    } catch (error) {
        console.log(error);
        return error
    } finally {
        if (connection) {
            connection.end()
        }
    }
}
module.exports = getUnactiveCampaign;