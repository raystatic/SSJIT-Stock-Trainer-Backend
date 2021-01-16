const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const morgan = require('morgan');

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
    // const error = new Error("Not Found!")
    // error.status = 404;
    // next(error);

    res.send("Welcome to paper trading testing server!")
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