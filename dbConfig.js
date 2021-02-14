const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});

connection.connect((err) => {
    if(err){
        console.log(`db not connected ${err}`);
    }else{
        console.log("db connected!");
    }
    //console.log("db connected!");
})

module.exports = connection;