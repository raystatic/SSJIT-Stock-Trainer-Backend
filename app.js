const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require('morgan');
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next)=> {
    res.header("Access-Control-Allow-Origin","*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-with, Content-Type, Accept, Authorization"
    );

    if(req.method == "OPTION"){
        res.header("Access-Control-Allow-Methods",'PUT, POST, PATCH, DELETE, GET');
        res.status(200).json({});
    }

    next();
});

app.use((req, res, next) => {

    res.json({
        error:false,
        message:"testing server"
    })
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

const connection = mysql.createConnection({
    host:process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});

connection.connect((err) => {
    if(err){
        console.log("db not connected");
        throw err;
    }
    console.log("db connected!");
})


module.exports = app;