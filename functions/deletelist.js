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
const deletelist = async (list_id) => {
    let connection;
    try {
        connection = await pool.getConnection();
        spinner.text = `Deleting ${list_id}`;
        spinner.start()
        await connection.query(`delete from vicidial_list where list_id=${list_id}`);
        await connection.query(`delete from vicidial_lists where list_id=${list_id}`);
        setTimeout(() => {
            spinner.stopAndPersist({
                symbol : '✔',
                text: `${list_id} deleted !`.blue
            })
        }, 500);
    } catch (error) {

    } finally {
        if (connection) {
            connection.end()
        }
    }
};
module.exports = deletelist;