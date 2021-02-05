const express = require('express');
const router = express.Router();
const api = require('indian-stock-exchange');

const NSEAPI = api.NSE;

async function fetchWatchlist(list, res){
    const d = [];

    for(position in list){
        const s = list[position];
        const data = await NSEAPI.getQuoteInfo(s)
            .then((response) => {
                return response.data;
            });
        d.push(data)
    }
    
    res.json({
        error:false,
        watchlist:d
    });
    
}

router.get('/',(req, res, next) => {
    const symbols = req.query.watchlists;
    const list = symbols.split(',');
    console.log(`Symbols: ${symbols}`);
    fetchWatchlist(list, res);


})

module.exports = router;