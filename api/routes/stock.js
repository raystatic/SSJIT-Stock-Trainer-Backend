const { json } = require('body-parser');
const express = require('express');
const router = express.Router();

const api = require('indian-stock-exchange');



const NSEAPI = api.NSE;

const BSEAPI = api.BSE;

router.get('/search',(req, res, next) => {

  const keyword = req.query.keyword;
  
  NSEAPI.searchStocks(keyword)
    .then((response) => {
      res.json({
        error:false,
        data:response.data
      });
    })
    .catch((err) => {
      res.json({
        error:true,
        message:err
      });
    });

});


module.exports = router;