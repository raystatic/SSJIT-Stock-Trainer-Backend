# Indian Stock Exchange NSEAPI
 - Provides API to get Data from National Stock Exchange

## IMPORTANT

> API Calls will fail when made from browser due to 'OPTIONS' request sent by browsers before making an API call and Have few 'insecure' headers set which fails when changed from browser.

> Workaround is to make the call either on your server or in your app. 

# Installation

- Make sure nodejs is installed on your system
- run `npm install --save indian-stock-exchange` or `yarn add indian-stock-exchange`

# Instructions on How to Use

```javascript
var API = require('indian-stock-exchange');

var NSEAPI = API.NSE;
var BSEAPI = API.BSE;


// Examples

NSEAPI.getIndices()
.then(function (response) { 
  console.log(response.data); //return the api data
});

BSEAPI.getIndices()
.then(function (response) { 
  console.log(response.data); //return the api data
});

```


 ## BSE (WIP)
 
 ### Available Methods
 
 - getTopTurnOvers
 - getIndices
 - getGainers
 - getLosers
 - getStockInfoAndDayChartData(securityCode)
 - getCompanyInfo(securityCode)
 - getStockMarketDepth(securityCode)
 - getStocksChartData(securityCode, flag=[5D, 1M, 3M, 6M, 12M]) ## BSE
 - getIndexChartData(symbolKey, time=[1|1M|3M|6M|12M])
 - getIndexStocks(symbolKey)
 - getIndexInfo(symbolKey)
 - getStockCandleStickData(securityCode, flag=[1D|1Y]) **(when using '1Y' as time, will return all data for the stock, you can filter out data accordingly for week wise or month wise data)**
 
 ***`symbolKey` is different from `symbol` or `securityCode`, this value is present in response of getIndices method in 'key' property
 
 ## NSE (WIP, actively working)
 
 ### Available Methods
   
 - getMarketStatus
 Response Format
  ```
     { status: 'closed/open' }
  ```
 ---
 - getIndices
  Response Format
 ```
    {
        data: [ 
          { 
            timeVal: 'Time when the stock info was last updated',
            indexName: 'Stock symbol',
            previousClose: 'previous close value',
            open: 'open value',
            high: 'high value',
            low: 'low value',
            last: 'Last stock value',
            percChange: 'percent change in stock price, -ve/+ve values',
            yearHigh: '52week highest value',
            yearLow: '52week lowest value',
            indexOrder: 'some random value, not important',
         },
         ...
        ],
    }
 ```
 ---
 
 - getIndices2
 
 ---
 - ~~getAllStocksCSV~~ (broken)

 ---
 - getGainers
   Response Format
  ```
    {
      data: [ 
              { 
                symbol: 'VEDL',
                series: 'EQ',
                openPrice: '214.00',
                highPrice: '225.00',
                lowPrice: '212.25',
                ltp: '223.50',
                previousPrice: '214.80',
                netPrice: '4.05',
                tradedQuantity: '1,20,31,227',
                turnoverInLakhs: '26,376.06',
                lastCorpAnnouncementDate: '14-Aug-2018',
                lastCorpAnnouncement: 'Annual General Meeting',
              },
              ...
           ]
    }
  ```
 ---
 - getLosers
  Response Format
```
     {
       data: [ 
               { 
                 symbol: 'VEDL',
                 series: 'EQ',
                 openPrice: '214.00',
                 highPrice: '225.00',
                 lowPrice: '212.25',
                 ltp: '223.50',
                 previousPrice: '214.80',
                 netPrice: '4.05',
                 tradedQuantity: '1,20,31,227',
                 turnoverInLakhs: '26,376.06',
                 lastCorpAnnouncementDate: '14-Aug-2018',
                 lastCorpAnnouncement: 'Annual General Meeting',
               },
               ...
            ]
     }
```
 ---
 - getSectorsList
 Response Format
```
    {
      data: {
        [STOCK SYMBOL]: { 
                date: '24-Aug-2018 06:45:03',
                symbol: 'STOCK SYMBOL VALUE',
                PE: '21.04',
                sectorPE: '15.17',
                sector: 'NIFTY METAL' 
        },
        ...
        }
    } 
```
 ---
 - getQuoteInfo(symbol)
 Response Format
```
{
  data: { 
    tradedDate: '24AUG2018',
    data: [ 
        { 
           pricebandupper: '2,238.60',
           symbol: 'TCS',
           applicableMargin: '12.50',
           bcEndDate: '-',
           totalSellQuantity: '1,107',
           adhocMargin: '-',
           companyName: 'Tata Consultancy Services Limited',
           marketType: 'N',
           exDate: '14-AUG-18',
           bcStartDate: '-',
           css_status_desc: 'Listed',
           dayHigh: '2,046.00',
           basePrice: '2,035.10',
           securityVar: '3.36',
           pricebandlower: '1,831.60',
           sellQuantity5: '-',
           sellQuantity4: '-',
           sellQuantity3: '-',
           cm_adj_high_dt: '25-MAY-18',
           sellQuantity2: '-',
           dayLow: '2,031.00',
           sellQuantity1: '1,107',
           quantityTraded: '30,46,791',
           pChange: '0.32',
           totalTradedValue: '32,067.93',
           deliveryToTradedQuantity: '73.17',
           totalBuyQuantity: '-',
           averagePrice: '2,041.85',
           indexVar: '-',
           cm_ffm: '2,18,162.93',
           purpose: 'BUYBACK',
           buyPrice2: '-',
           secDate: '23AUG2018',
           buyPrice1: '-',
           high52: '3,674.80',
           previousClose: '2,035.10',
           ndEndDate: '-',
           low52: '1,711.15',
           buyPrice4: '-',
           buyPrice3: '-',
           recordDate: '18-AUG-18',
           deliveryQuantity: '22,29,341',
           buyPrice5: '-',
           priceBand: 'No Band',
           extremeLossMargin: '5.00',
           cm_adj_low_dt: '05-JUN-18',
           varMargin: '7.50',
           sellPrice1: '2,043.00',
           sellPrice2: '-',
           totalTradedVolume: '15,70,533',
           sellPrice3: '-',
           sellPrice4: '-',
           sellPrice5: '-',
           change: '6.50',
           surv_indicator: '-',
           ndStartDate: '-',
           buyQuantity4: '-',
           isExDateFlag: false,
           buyQuantity3: '-',
           buyQuantity2: '-',
           buyQuantity1: '-',
           series: 'EQ',
           faceValue: '1.00',
           buyQuantity5: '-',
           closePrice: '0.00',
           open: '2,035.10',
           isinCode: 'INE467B01029',
           lastPrice: '2,041.60',
        }
    ],
    otherSeries: [ 'EQ' ],
    lastUpdateTime: '24-AUG-2018 16:00:00',
   }
}
   ```
  ---
 - ~~getQuotes(symbol)~~
  ---
 - getInclineDecline
 Response Format
  ```{
      data: {
         data: [
            { 
              indice: 'INDEX SYMBOL VALUE',
              advances: '21',
              declines: '28',
              unchanged: '1',
            },
          ...
        ]
      }
}
   ```
  ---
 
 - getIndexStocks(slug) => see below code for slug values for different indices
 
 ---
 
 - getIndexChartData(symbol, time) => time values = (1, 5, 15, 30, 60, 'week', 'month', 'year') // pass int values as integer and not string (!important)

 ---
 
 - getIntraDayData(symbol, time) => time values = (1, 5, 15, 30, 60, 'week', 'month', 'year') // pass int values as integer and not string (!important)

 ---
 
 - getCandleStickData(symbol, time, isIndex: boolean) => time values as above, isIndex param to fetch data for indices

 ---
 
 - searchStocks(string) => search stocks by name or symbol (min 3 chars)

 ---
 
 - searchEquityDerivatives(string) => search Equity Derivatives (min 3 chars) (! provides wrapper around site search)

 ---
 
 - getStockFutureOptionsExpiryDates(symbol, isFutures? boolean, isIndex? boolean)
 
 ---
 
 - getStockOptionsPrices(symbol, expiryDate, isCall? boolean, isIndex? boolean) expiryDate value must be from one of values returned by above methods

 ---
 
 - getStockOptionsData(symbol, expiryDate, isCall, strikePrice, isIndex) strikePrice value from above api result only

 ---
 
 - getStockFuturesData(symbol, expiryDate, isIndex) expiryDate from api method only

 ---
 
 - getFuturesData(symbol) => wrapper around `getStockFuturesData` and `getStockFutureOptionsExpiryDates` and return all-together.

 ---
 
 - getOptionsData(symbol) => wrapper around `getStockOptionsPrices` and `getStockFutureOptionsExpiryDates` and returns list of all call and put prices for all the expiry Dates of a stock

 ---
 
 - getIndexFuturesData(symbol)
 
 ---
 
 - getIndexOptionsData(symbol)
 
 - get52WeekHigh
 - get52WeekLow
 
 - getTopValueStocks
 - getTopVolumeStocks
 
 ** valid symbols for Index Futures and Options are `["BANKNIFTY","FTSE100","NIFTY","NIFTYINFRA","NIFTYIT","NIFTYMID50","NIFTYPSE"]`

## Slug List
```javascript

 {
  'NIFTY 50': 'nifty',
  'NIFTY NEXT 50': 'juniorNifty',
  'NIFTY MIDCAP 50': 'niftyMidcap50',
  'NIFTY AUTO': 'cnxAuto',
  'NIFTY BANK': 'bankNifty',
  'NIFTY ENERGY': 'cnxEnergy',
  'NIFTY FIN SERVICE': 'cnxFinance',
  'NIFTY FMCG': 'cnxFMCG',
  'NIFTY IT': 'cnxit',
  'NIFTY MEDIA': 'cnxMedia',
  'NIFTY METAL': 'cnxMetal',
  'NIFTY PHARMA': 'cnxPharma',
  'NIFTY PSU BANK': 'cnxPSU',
  'NIFTY REALTY': 'cnxRealty',
  'NIFTY PVT BANK': 'niftyPvtBank',
  'NIFTY COMMODITIES': 'cnxCommodities',
  'NIFTY CONSUMPTION': 'cnxConsumption',
  'NIFTY CPSE': 'cpse',
  'NIFTY INFRA': 'cnxInfra',
  'NIFTY MNC': 'cnxMNC',
  'NIFTY GROWSECT 15': 'ni15',
  'NIFTY PSE': 'cnxPSE',
  'NIFTY SERV SECTOR': 'cnxService',
  'NIFTY100 LIQ 15': 'nseliquid',
  'NIFTY MID LIQ 15': 'niftyMidcapLiq15',
  'NIFTY DIV OPPS 50': 'cnxDividendOppt',
  'NIFTY50 VALUE 20': 'nv20',
  'NIFTY QUALITY 30': 'niftyQuality30',
  'NIFTY50 EQL WGT': 'nifty50EqualWeight',
  'NIFTY100 EQL WGT': 'nifty100EqualWeight',
  'NIFTY100 LOWVOL30': 'nifty100LowVolatility30',
  'NIFTY ALPHA 50': 'niftyAlpha50',


  'INDIA VIX': '-',
  'NIFTY 100': '-',
  'NIFTY 500': '-',
  'NIFTY MIDCAP 100': '-',
  'NIFTY GS 11 15YR': '-',
  'NIFTY50 PR 1X INV': '-',
  'NIFTY GS COMPSITE': '-',
  'NIFTY GS 15YRPLUS': '-',
  'NIFTY50 PR 2X LEV': '-',
  'NIFTY50 TR 1X INV': '-',
  'NIFTY 200': '-',
  'NIFTY GS 4 8YR': '-',
  'NIFTY GS 8 13YR': '-',
  'NIFTY50 TR 2X LEV': '-',
  'NIFTY50 DIV POINT': '-',
  'NIFTY SMLCAP 100': '-',
  'NIFTY GS 10YR': '-',
  'NIFTY GS 10YR CLN': '-',
};

```
