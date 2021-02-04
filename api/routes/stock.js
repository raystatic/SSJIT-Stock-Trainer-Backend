const { json } = require('body-parser');
const express = require('express');
const router = express.Router();
const api = require('indian-stock-exchange');
const connection = require('../../dbConfig');
const {v4: uuidv4} = require('uuid');
const OrderStatus = require('./orderStatus');
const { update } = require('lodash');

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
      console.log(`Error: ${err}`)
      res.json({
        error:true,
        message:`Some error occurred`
      });
    });
});

router.get('/stock_info',(req, res, next) => {

  const symbol = req.query.symbol;

  NSEAPI.getQuoteInfo(symbol)
    .then((response) => {
      res.json({
        error:false,
        data:response.data
      });
    })
    .catch((err) => {
        res.json({
          error:true,
          message:`Error: ${err.message}`
        });
    })

});

const executeTransaction = (order) => {
  const updateOrderQuery = `UPDATE orders SET ? WHERE id= ?`;
  order.status = OrderStatus.executed;
  order.order_executed_at = new Date().getTime();
  connection.query(updateOrderQuery,[order, order.id], (err, result) => {
    if(err){
      console.log(`Cannot update order: ${err}`);
    }else{
      if(result === null){
        console.log("order not find");
      }else{
        console.log("order updated");
      }
    }
  });
}

router.post('/transaction', (req, res, next) => {
    const order = {
      id : uuidv4(),
      symbol : req.body.symbol,
      no_shares : req.body.noOfShares,
      status : OrderStatus.pending,
      order_created_at : req.body.orderCreatedAt,
      user_id : req.body.userId,
      order_amount : req.body.orderAmount,
      intraday : req.body.intraday,
      type: req.body.type
    };

    const getUserDetails = "SELECT * FROM users WHERE id= ?"
    connection.query(getUserDetails,[order.user_id], (err, user) => {
      if(err){
        res.json({
          error:true,
          message:err.message
        });
      }else{

        if(user === null || user.length === 0){
          res.json({
            error:true,
            message:`Cannot find user`
          });
          return;
        }

        const now = new Date();
        const eta_ms = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).getTime() - Date.now();
        const eta_1day = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()+2).getTime() - Date.now();

        if(order.intraday && eta_ms <= 0){
            res.json({
              error:true,
              message:"Cannot create order now. Time over"
            });
        }else{
          const createOrderQuery = "INSERT INTO orders SET ?";
          const updateBalanceQuery = "UPDATE users SET ? WHERE id= ?";
          const updateProfitQuery = "UPDATE users SET ? WHERE id= ?";
          connection.query(createOrderQuery, order, (err, result) => {
            if(err){
              console.log(err);
              res.json({
                error:true,
                message:err
              });
            }else{
              if(result!==null){
                if(order.intraday && order.type == "BUY"){
                  setTimeout(() => {
                    NSEAPI.getQuoteInfo(order.symbol)
                    .then((response) => {
                      var freshPrice = 0;
                      if(response.data.data[0].buyPrice1.includes("-") && response.data.data[0].buyPrice2.includes("-") && response.data.data[0].buyPrice3.includes("-") && response.data.data[0].buyPrice4.includes("-") && response.data.data[0].buyPrice5.includes("-")){
                        freshPrice = parseFloat(response.data.data[0].closePrice.replace(',',''));
                      }else{
                        if(!isNaN(parseFloat(response.data.data[0].buyPrice1.replace(',','').replace('-','')))){
                          freshPrice+=parseFloat(response.data.data[0].buyPrice1.replace(',','').replace('-',''))
                        }
                        if(!isNaN(parseFloat(response.data.data[0].buyPrice2.replace(',','').replace('-','')))){
                          freshPrice+=parseFloat(response.data.data[0].buyPrice2.replace(',','').replace('-',''))
                        }
                        if(!isNaN(parseFloat(response.data.data[0].buyPrice3.replace(',','').replace('-','')))){
                          freshPrice+=parseFloat(response.data.data[0].buyPrice3.replace(',','').replace('-',''))
                        }
                        if(!isNaN(parseFloat(response.data.data[0].buyPrice4.replace(',','').replace('-','')))){
                          freshPrice+=parseFloat(response.data.data[0].buyPrice4.replace(',','').replace('-',''))
                        }
                        if(!isNaN(parseFloat(response.data.data[0].buyPrice5.replace(',','').replace('-','')))){
                          freshPrice+=parseFloat(response.data.data[0].buyPrice5.replace(',','').replace('-',''))
                        }
                      }
                      profit = order.order_amount.replace(',','') - freshPrice;
                      order.profit = profit;
                      order.status = OrderStatus.pending;
                      order.type = "SELL"
                      const updateQuery = `UPDATE orders SET ? WHERE id= ?`;
                      connection.query(updateQuery, [order,order.id],(err, updatedOrder) => {
                        if(err){
                        console.error(`Cannot update order ${err}`);
                        }else{
                          connection.query(getUserDetails, [order.user_id], (err, newUser) => {
                            if(err){
                              console.log("cannot find user");
                            }else{
                              const balance = parseFloat(user[0].balance.replace(',','')) + freshPrice;
                              var netProfit = parseFloat(user[0].profit.replace(',',''));
                              var netLoss = parseFloat(user[0].loss.replace(',',''));
                              if(order.profit >= 0){
                                netProfit+=order.profit;
                              }else{
                                netLoss+=order.profit;
                              }
                              var positive_transactions = user[0].positive_transactions;
                              var negative_transactions = user[0].negative_transactions;
                              if(order.profit >= 0){
                                positive_transactions+=1;
                              }else{
                                negative_transactions+=1
                              }
                              connection.query(updateProfitQuery,[{
                                  balance:balance, 
                                  profit:netProfit,
                                  loss:netLoss,
                                  positive_transaction: positive_transactions,
                                  negative_transaction: negative_transactions
                                }, order.user_id], (err, updatedUser) => {
                                if(err){
                                  console.log(`${err}`);
                                  res.json({
                                    error:true,
                                    message:`Cannot update balance of user ${err}`
                                  })
                                }else{
                                  console.log("user's balance updated");
                                  console.log("Sell Order successfully created");
                                  setTimeout(() => {
                                    executeTransaction(order);
                                  }, eta_1day);
                                }
                              })
                            }
                          })
                        }
                      })
                    })
                    .catch((err) => {
                        console.error(`Cannot get quote info ${err}`);
                        res.json({
                          error:true,
                          data:`Cannot get stock info`
                        });
                    })
                  }, eta_ms)
                }
                var balance = parseFloat(user[0].balance.replace(',',''));
                var investment = parseFloat(user[0].investment.replace(',',''));
                if(order.type == "BUY"){
                  balance = balance - parseFloat(order.order_amount);
                  investment = investment + parseFloat(order.order_amount);
                }else{
                  balance = balance + parseFloat(order.order_amount);
                }

                const updates = {balance:`${balance}`,investment:`${investment}`};
                connection.query(updateBalanceQuery,[updates, order.user_id], (err, updatedUser) => {
                  if(err){
                    res.json({
                      error:true,
                      message:`Cannot update balance of user ${err}`
                    })
                  }else{
                    console.log("user's balance updated");
                    if(order.intraday){
                      order.intraday = 1;
                    }else{
                      order.intraday = 0;
                    }
                    const now = new Date();
                    const eta_1day = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()+2).getTime() - Date.now();
                    setTimeout(() => {
                        executeTransaction(order);
                    }, eta_1day)
                    res.json({
                      error:false,
                      order:order
                    });
                  }
                })
              }else{
                res.json({
                  error:true,
                  message:"Cannot create order"
                });
              }
            }
          });
        }  
      }
    })
});

router.patch('/transaction', (req, res, next) => {
  var order = {
    id : req.body.id
  };

  const getOrderQuery = `SELECT * FROM orders WHERE id= ?`;
  const getUserQuery = `SELECT * FROM users WHERE id= ?`;

  connection.query(getOrderQuery,[order.id], (err, result) => {
    if(err){
      console.log(`Cannot get Order: ${err}`);
      res.json({
        error:true,
        message:`Error: ${err}`
      });
    }else{
      if(result !== null && result.length > 0){
        order = result[0];
        const orderAmount = parseFloat(result[0].order_amount.replace(',',''));
        NSEAPI.getQuoteInfo(result[0].symbol)
          .then((response) => {
            var freshPrice = 0;
            if(response.data.data[0].buyPrice1.includes("-") && response.data.data[0].buyPrice2.includes("-") && response.data.data[0].buyPrice3.includes("-") && response.data.data[0].buyPrice4.includes("-") && response.data.data[0].buyPrice5.includes("-")){
              freshPrice = parseFloat(response.data.data[0].closePrice.replace(',',''));
            }else{
              if(!isNaN(parseFloat(response.data.data[0].buyPrice1.replace(',','').replace('-','')))){
                freshPrice+=parseFloat(response.data.data[0].buyPrice1.replace(',','').replace('-',''))
              }
              if(!isNaN(parseFloat(response.data.data[0].buyPrice2.replace(',','').replace('-','')))){
                freshPrice+=parseFloat(response.data.data[0].buyPrice2.replace(',','').replace('-',''))
              }
              if(!isNaN(parseFloat(response.data.data[0].buyPrice3.replace(',','').replace('-','')))){
                freshPrice+=parseFloat(response.data.data[0].buyPrice3.replace(',','').replace('-',''))
              }
              if(!isNaN(parseFloat(response.data.data[0].buyPrice4.replace(',','').replace('-','')))){
                freshPrice+=parseFloat(response.data.data[0].buyPrice4.replace(',','').replace('-',''))
              }
              if(!isNaN(parseFloat(response.data.data[0].buyPrice5.replace(',','').replace('-','')))){
                freshPrice+=parseFloat(response.data.data[0].buyPrice5.replace(',','').replace('-',''))
              }
            }
            console.log(`${response.data.data.closePrice}, ${freshPrice}, ${result[0].order_amount}, ${orderAmount}`)
            profit = freshPrice - orderAmount;
            order.profit = profit;
            order.status = OrderStatus.pending;
            const updateQuery = `UPDATE orders SET ? WHERE id= ?`;
            connection.query(updateQuery, [order, order.id],(err, updatedOrder) => {
              if(err){
                res.json({
                  error:true,
                  message:`Cannot update order: ${err}`
                });
              }else{
                const updateBalanceQuery = `UPDATE users SET ? WHERE id= ?`;
                connection.query(getUserQuery, [order.user_id], (err, user) => {
                    if(err){
                      res.json({
                        error:true,
                        message:`Error: ${err}`
                      })
                    } else{
                      if(user !== null && user.length !== 0){
                        const balance = parseFloat(user[0].balance.replace(',','')) + freshPrice;
                        var netProfit = parseFloat(user[0].profit.replace(',',''));
                        var netLoss = parseFloat(user[0].loss.replace(',',''));
                        if(order.profit >= 0){
                          netProfit+=order.profit;
                        }else{
                          netLoss+=order.profit;
                        }
                        var positiveTransactions = user[0].positive_transactions;
                        var negativeTransactions = user[0].negative_transactions;
                        if(order.profit >= 0){
                          positiveTransactions+=1;
                        }else{
                          negativeTransactions+=1
                        }
                        const updates = {balance: balance, profit: netProfit,loss:netLoss, positive_transactions:positiveTransactions, negative_transactions: negativeTransactions};
                        connection.query(updateBalanceQuery,[updates,order.user_id], (err, updatedUser) => {
                          if(err){
                            res.json({
                              error:true,
                              message:`Cannot update balance: ${err}`
                            });
                          }else{
                            console.log(`User's balance updated`);
                            const now = new Date();
                            const eta_1day = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()+2).getTime() - Date.now();
                            setTimeout(() => {
                                executeTransaction(updatedOrder);
                            }, eta_1day)
                            res.json({
                              error:false,
                              data: updatedOrder
                            });
                          }
                        })
                      }else{
                        res.json({
                          error:true,
                          message:`Cannot find user`
                        })
                      }
                    }
                });
              }
            })
          })
          .catch((err) => {
              console.error(`Cannot get quote info ${err}`);
              res.json({
                error:true,
                data:`Cannot get stock info`
              });
          })
      }else{
        res.json({
          error:true,
          message:`No order available with this order id`
        });
      }
    }
  });
});

async function fetchCurrentPrice(orders, res){
  const d = [];
  for(order in orders){
    const data = await NSEAPI.getQuoteInfo(orders[order].symbol)
                        .then((response) => {
                          return response.data.data[0];
                        });

     var freshPrice = 0;
    if(data.buyPrice1.includes("-") && data.buyPrice1.includes("-") && data.buyPrice2.includes("-") && data.buyPrice3.includes("-") && data.buyPrice4.includes("-") && data.buyPrice5.includes("-")){
      freshPrice = parseFloat(data.closePrice.replace(',',''));
    }else{
      if(!isNaN(parseFloat(data.buyPrice1.replace(',','').replace('-','')))){
        freshPrice+=parseFloat(data.buyPrice1.replace(',','').replace('-',''))
      }
      if(!isNaN(parseFloat(data.buyPrice2.replace(',','').replace('-','')))){
        freshPrice+=parseFloat(data.buyPrice2.replace(',','').replace('-',''))
      }
      if(!isNaN(parseFloat(data.buyPrice3.replace(',','').replace('-','')))){
        freshPrice+=parseFloat(data.buyPrice3.replace(',','').replace('-',''))
      }
      if(!isNaN(parseFloat(data.buyPrice4.replace(',','').replace('-','')))){
        freshPrice+=parseFloat(data.buyPrice4.replace(',','').replace('-',''))
      }
      if(!isNaN(parseFloat(data.buyPrice5.replace(',','').replace('-','')))){
        freshPrice+=parseFloat(data.buyPrice5.replace(',','').replace('-',''))
      }
    }
    orders[order].currentPrice = freshPrice;
    orders[order].companyName = data.companyName;
    d.push(orders[order]); 
  }

  res.json({
    error:false,
    orders:d
  });

}


router.get('/transaction', (req, res, next) => {
  const userId = req.query.userId

  const getOrderQuery = `SELECT * FROM orders WHERE user_id= ?`;
  connection.query(getOrderQuery,[userId],(err, result) => {
    if(err){
      res.json({
        error:true,
        message:err
      });
    }else{
      if(result === null){
        res.json({
          error:true,
          message:"No orders found of the current user"
        });
      }else{
        const orders = result;
        fetchCurrentPrice(orders, res);
      }
    }
  })

});

module.exports = router;