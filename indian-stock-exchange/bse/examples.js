var API = require('./index');

function getTopTurnOvers() {
  return API.getTopTurnOvers()
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getIndices() {
  return API.getIndices()
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getGainers() {
  return API.getGainers()
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getLosers() {
  return API.getLosers()
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getCompanyInfo(symbol) {
  return API.getCompanyInfo(symbol)
    .then(function (value) {
      console.log(value);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getStocksChartData() {
  return API.getStocksChartData(500325, '3M')
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getIndexChartData(symbol, time) {
  return API.getIndexChartData(symbol, time)
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}


function getStockInfoAndDayChartData(symbol) {
  return API.getStockInfoAndDayChartData(symbol)
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getIndexStocks(symbol) {
  return API.getIndexStocks(symbol)
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}


function getIndexInfo(symbol) {
  return API.getIndexInfo(symbol)
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getStockMarketDepth(symbol) {
  return API.getStockMarketDepth(symbol)
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

function getStockCandleStickData(symbol, time) {
  return API.getStockCandleStickData(symbol, time)
    .then(function (value) {
      console.log(value.data);
    })
    .catch(function (reason) {
      console.log(reason)
    });
}

//view-source:https://www.bseindia.com/stock-share-price/SiteCache/TabResult.aspx?text=500325&type=results
//document.body.innerText.replace(/\<\/td>/g,',').replace(/<\/tr>/g,'#').replace(/<(?:.|\n)*?>/gm, '');

// getTopTurnOvers();

getIndices();

// getStockCandleStickData(500112, '1Y');
// getStockInfoAndDayChartData(500112);
// getIndexInfo(16);