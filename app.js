const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require('morgan');
const mysql = require('mysql');
const connection = require('./dbConfig');


const loginRouter = require('./api/routes/login');
const stockRouter = require('./api/routes/stock');
const watchlistRouter = require('./api/routes/watchlist');

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

if(connection === null){
    console.error("db connection failed!");
}

app.use(express.json());

app.use('/api/v1/login',loginRouter);
app.use('/api/v1/stock',stockRouter);
app.use('/api/v1/watchlist', watchlistRouter);

app.use('/',(req, res, next) => {
    
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

module.exports = app;