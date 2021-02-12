var axios = require('axios');
var _ = require('lodash');

var csvTojs = require('../utils/csvToJson');
var csvToJson2Keys = require('../utils/csvToJson_2Keys');
var companyNames = require('../constant/names');
var emptyData = require('../constant/emptyData');
var STOCK_CANDLESTICK_DAILY_URL = require('../constant').STOCK_CANDLESTICK_DAILY_URL;
var STOCK_CANDLESTICK_URL = require('../constant').STOCK_CANDLESTICK_URL;

var STOCK_HIGH_LOW_URL = require('../constant').STOCK_HIGH_LOW_URL;
var INDEX_INFO_URL = require('../constant').INDEX_INFO_URL;
var INDEX_HEAT_MAP = require('../constant').INDEX_HEAT_MAP_URL;
var LOSERS_URL = require('../constant').LOSERS_URL;
var INDICES_URL = require('../constant').INDICES_URL;
var GAINERS_URL = require('../constant').GAINERS_URL;
var TURNOVER_URL = require('../constant').TURNOVER_URL;
var COMPANY_HEADER = require('../constant').COMPANY_HEADER_URL;
var LOSERS_HEADERS = require('../constant').LOSERS_HEADERS;
var GAINERS_HEADERS = require('../constant').GAINERS_HEADERS;
var INDICES_HEADERS = require('../constant').INDICES_HEADERS;
var DAILY_STOCKS_URL = require('../constant').DAILY_STOCKS_URL;
var TURNOVER_HEADERS = require('../constant').TURNOVER_HEADERS;
var HISTORY_STOCKS_URL = require('../constant').HISTORY_STOCKS_URL;
var DAILY_STOCKS_HEADERS = require('../constant').DAILY_STOCKS_HEADERS;
var INDICES_CHART_DATA_URL = require('../constant').INDICES_CHART_DATA_URL;
var STOCK_POINT_PERCENT_URL = require('../constant').STOCK_POINT_PERCENT_URL;
var DAILY_STOCKS_CLOSING_HEADERS = require('../constant').DAILY_STOCKS_CLOSING_HEADERS;

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

//TODO https://www.bseindia.com/stock-share-price/SiteCache/Stock_Trading.aspx?text=500520&type=EQ

function axiosTransformer(url, headers) {
  return axios.get(url, {
    transformResponse: [function (data) {
      return csvTojs(data, headers || null)
    }]
  });
}

function axiosTransformerAdvance(url, closeHeaders, normalHeaders) {
  return axios.get(url, {
    transformResponse: [function (data) {
      var getClosing = data.split('#@#');
      var closingInfo = [];
      var normalData = [];
      if (getClosing.length > 1) {
        closingInfo = csvTojs(getClosing[0], closeHeaders);
        normalData = csvTojs(getClosing[1], normalHeaders)
      } else {
        normalData = csvTojs(data, normalHeaders);
      }
      return {
        closing: closingInfo,
        dailyData: normalData
      }
    }]
  });
}

function axiosTableTransformer(url) {
  return axios.get(url, {
    transformResponse: [function (data) {
      var formattedString = data;
      formattedString = formattedString.replace(/<\/td>/g, ',<\/td>');
      formattedString = formattedString.replace(/<\/tr>/g, '#<\/tr>');
      formattedString = formattedString.replace(/<(?:.|\n)*?>/gm, '');
      formattedString = formattedString.replaceAll(',#', '');
      formattedString = formattedString.replaceAll(',:,', ',');
      formattedString = formattedString.replaceAll(',,', '#');

      return csvToJson2Keys(formattedString);
    }]
  });
}

function getTopTurnOvers() {
  return axiosTransformer(TURNOVER_URL, TURNOVER_HEADERS);
}

function getIndices() {
  return axios({
    method: 'GET',
    url: INDICES_URL,
    params: {
      json: {
        "flag": "",
        "ln": "en",
        "pg": "1",
        "cnt": "16",
        "fields": "1,2,3,4,5,6,7",
        "hmpg": "1"
      }
    }
  }).then(response => {
    return {
      ...response,
      data: response.data.map(index => {
        return {
          securityCode: index.indxnm,
          key: index.code,
          pointChange: index.chg,
          todayClose: index.ltp,
          pointPercent: index.perchg
        }
      })
    }
  });
}

function getIndexStocks(symbolKey) {
  return axios({
    method: 'GET',
    url: INDEX_HEAT_MAP,
    params: {
      indexcode: symbolKey,
      random: Math.random()
    },
    transformResponse: [function (data) {
      var actualData = data.split('$#$');
      var stocks = _.compact(_.map(actualData[1].split('|'), function (stock) {
        var vals = stock.split(',');
        if (vals.length === 13 && vals[0] !== 'aaaa') {
          return {
            name: vals[0],
            percChange: vals[1] || vals[12] || 0,
            companyName: companyNames(vals[8]) || vals[2],
            open: vals[3],
            high: vals[4],
            low: vals[5],
            ltp: vals[6],
            pointChange: vals[7],
            symbol: vals[8],
            wap: vals[9],
            totalQuantityTraded: vals[10],
            url: vals[11]
          };
        }
        return null;
      }));
      return stocks || [];
    }]
  });
}

function getIndexInfo(symbolKey) {
  return axios({
    method: 'GET',
    url: INDEX_INFO_URL,
    params: {
      flag: 'INDEX',
      indexcode: symbolKey,
      random: Math.random()
    },
    transformResponse: [function (data) {
      var actualData = data.split('$#$');
      var values = actualData[1].split('@');
      var statusType = 'Close';

      if (values.length >= 11) {

        switch (values[10]) {
          case '2':
            statusType = 'Close';
            break;
          case '1':
            statusType = 'Pre-open';
            break;
          case '0':
            statusType = 'Open';
            break;
        }
        return {
          symbol: values[1],
          open: values[2],
          high: values[3],
          low: values[4],
          ltp: values[5],
          previousClose: values[6],
          pointChange: values[7],
          percChange: values[8],
          timeVal: values[9]
        }
      } else {
        return {};
      }
    }]
  });
}

function getIndexChartData(symbolKey, time) {
  return axiosTransformerAdvance(
    INDICES_CHART_DATA_URL + symbolKey + '&flag=' + time.toUpperCase() + '&random=' + Math.random(),
    'date,previousClose,high,low,symbol,close,time',
    'date,preOpen,value');
}

function getGainers() {
  return axiosTransformer(GAINERS_URL, GAINERS_HEADERS);
}

function getLosers() {
  return axiosTransformer(LOSERS_URL, LOSERS_HEADERS);
}

function getCompanyInfo(securityCode) {

  var stockInfo = axios({
    url: STOCK_HIGH_LOW_URL,
    method: 'GET',
    params: {
      text: securityCode
    },
    headers: {
      Referer: 'https://www.bseindia.com/'
    },
    transformResponse: function (responseData) {
      try {
        var initialSplit = responseData.split('##');
        if (initialSplit[0] === 'BSE') {

          var dataSplit = initialSplit[1].split('@');

          var arrB = dataSplit[0].split('#');
          var timeValue = arrB[1];

          var highLowCSV = dataSplit[3].split('#');
          var highLowValuesArray = highLowCSV[1].split(',');

          var previousClose = highLowValuesArray[0];
          var open = highLowValuesArray[1];
          var high = highLowValuesArray[2];
          var low = highLowValuesArray[3];
          var ltp = highLowValuesArray[4];
          var latestValue = highLowValuesArray[4];

          if (low === '-') {
            low = '0';
          }
          if (high === '-') {
            high = '0';
          }
          return {
            timeValue: _.trim(timeValue.replace(/(As|on)/g, '')) || '',
            previousClose: previousClose || 0,
            open: open || 0,
            high: high || 0,
            low: low || 0,
            ltp: ltp || 0,
            latestValue: latestValue || 0
          }
        }
      } catch (e) {
        return emptyData.emptyCompanyInfo
      }
    }
  });

  var stockPointPercentData = axios({
    url: STOCK_POINT_PERCENT_URL,
    method: 'GET',
    params: {
      scripcode: securityCode,
      DebtFlag: 'C'
    },
    headers: {
      Referer: 'https://www.bseindia.com/'
    },
    transformResponse: function (responseData) {
      try {
        var regex = new RegExp('(?:<td(?:.*?)>(.*?)<\/td>)', 'g');
        var data = responseData
          .replace(regex, '$1,') // replace html innerContent with just the text
          .replace(/((<([^>]+)>)|&nbsp;|\(|\)|%)/ig, ''); // remove html tags and extra garbage chars

        var values = _.compact(data.split(','));

        return {
          latestValue: values[0] || 0,
          pointChange: values[1] || 0,
          percChange: values[2] || 0
        };

      } catch (e) {
        console.log(e);
        return {
          latestValue: 0,
          pointChange: 0,
          percChange: 0
        }
      }
    }
  });

  var companyHeader = axiosTableTransformer(COMPANY_HEADER + securityCode);

  return Promise.all([stockInfo, companyHeader, stockPointPercentData]);
}

function getStockInfoAndDayChartData(securityCode) {
  return axiosTransformerAdvance(DAILY_STOCKS_URL + securityCode, DAILY_STOCKS_CLOSING_HEADERS, DAILY_STOCKS_HEADERS);
}

function getStocksChartData(securityCode, flag) {
  var flagtemp = flag.toUpperCase();
  var flagSlug = (flagtemp === '1D' ? '' : '&Flag=' + flagtemp);
  return axiosTransformerAdvance(
    HISTORY_STOCKS_URL + securityCode + (flagSlug),
    DAILY_STOCKS_CLOSING_HEADERS, DAILY_STOCKS_HEADERS);
}

function getStockMarketDepth(securityCode) {
  return axios({
    method: 'GET',
    url: 'https://www.bseindia.com/stock-share-price/SiteCache/MarketDepth.aspx',
    params: {
      Type: 'EQ',
      text: securityCode,
      random: Math.random()
    },
    transformResponse: function (responseData) {
      try {
        var data = _.replace(responseData, / type='hidden'/g, '');
        var regex = /(?:id='(.*?)'(?:.*?)value='(.*?)')/g;
        var newData = _.map(
          data.match(regex),
          function (a) {
            var key = _.replace(
              a.match('id=\'.*?\'')[0],
              /(id=)|(hd)|(')/g,
              ''
            );

            var newKey = key;

            if (key === 'Date') {
              // pass
            } else if (key === '6a') {
              newKey = 'totalBuyQuantity';
            } else if (key === '6b') {
              newKey = 'totalSellQuantity';
            } else if (_.includes(key, 'a')) {
              newKey = 'buyQuantity' + newKey.replace('a', '');
            } else if (_.includes(key, 'b')) {
              newKey = 'buyPrice' + newKey.replace('b', '');
            } else if (_.includes(key, 'c')) {
              newKey = 'sellPrice' + newKey.replace('c', '');
            } else if (_.includes(key, 'd')) {
              newKey = 'sellQuantity' + newKey.replace('d', '');
            }

            var value =
              _.replace(
                a.match('value=\'.*?\'')[0],
                /(value=)|(')/g, ''
              );

            var o = {};
            o[newKey] = value || '-';
            return o;
          }
        );

        return newData.reduce(function (obj, item) {
          var key = _.keys(item)[0];
          obj[key] = item[key];
          return obj;
        }, {});
      } catch (e) {
        console.log('error', e);
        return emptyData.bidTableData;
      }
    }
  });
}

function getStockCandleStickData(securityCode, time) {
  var url = STOCK_CANDLESTICK_URL;
  if (time === '1D') {
    url = STOCK_CANDLESTICK_DAILY_URL;
  }
  return axios({
    method: 'POST',
    url: url,
    params: {
      exch: 'N',
      scode: securityCode,
      type: 'b',
      mode: 'bseL',
      fromdate: '01-01-1991-01:01:00-AM'
    },
    transformResponse: function (responseData) {
      try {
        var key = time === '1D' ? 'getDatIResult' : 'getDatResult';
        var jsonString = JSON.parse(responseData)[key];
        var parsedJSON = JSON.parse(jsonString).DataInputValues;
        var dataObj = parsedJSON[0];
        var openArray = dataObj.OpenData[0].Open.split(',');
        var lowArray = dataObj.LowData[0].Low.split(',');
        var highArray = dataObj.HighData[0].High.split(',');
        var closeArray = dataObj.CloseData[0].Close.split(',');
        var dateArray = dataObj.DateData[0].Date.split(',');
        var volumeArray = dataObj.VolumeData[0].Volume.split(',');

        return _.map(dateArray, function (date, indx) {

          var validDate = date.replace(/(\d{2})\/(\d{2})\/(\d{4}) (.*?)/, "$2/$1/$3 $4");
          return {
            date: new Date(validDate).toLocaleString(),
            open: openArray[indx] || 0,
            close: closeArray[indx] || 0,
            high: highArray[indx] || 0,
            low: lowArray[indx] || 0,
            volume: volumeArray[indx] || 0
          }
        })
      } catch (e) {
        var today = new Date();
        return [{
          open: 0,
          close: 0,
          high: 0,
          low: 0,
          volume: 0,
          date: today.toLocaleString()
        }]
      }
    }
  });
}

var API = {
  getTopTurnOvers: getTopTurnOvers,
  getIndices: getIndices,
  getGainers: getGainers,
  getLosers: getLosers,
  getStockInfoAndDayChartData: getStockInfoAndDayChartData,
  getCompanyInfo: getCompanyInfo,
  getStocksChartData: getStocksChartData,
  getIndexChartData: getIndexChartData,
  getIndexStocks: getIndexStocks,
  getIndexInfo: getIndexInfo,
  getStockMarketDepth: getStockMarketDepth,
  getStockCandleStickData: getStockCandleStickData
};

module.exports = API;