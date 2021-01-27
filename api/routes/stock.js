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

router.get('/buy_stock',(req, res, next) => {

  const now = new Date();
  const eta_ms = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).getTime() - Date.now();

  res.json({
    data:now.getDate()+1
  })

})


router.post('/transaction', (req, res, next) => {
    const order = {
      id : uuidv4(),
      symbol : req.body.symbol,
      no_shares : req.body.noOfShares,
      status : OrderStatus.pending,
      order_created_at : req.body.orderCreatedAt,
      user_id : req.body.userId,
      order_amount : req.body.orderAmount,
      intraday : req.body.intraday
    };

    const getUserDetails = "SELECT * FROM users WHERE id= ?"
    connection.query(getUserDetails,[order.user_id], (err, user) => {
      if(err){
        console.error(`Cannot get user with this id`);
        res.json({
          error:true,
          message:`Cannot find user`
        });
      }else{
        const now = new Date();
        const eta_ms = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).getTime() - Date.now();

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
              res.json({
                error:true,
                message:err
              });
            }else{
              if(result!==null){
                if(order.intraday){
                  setTimeout(() => {
                    NSEAPI.getQuoteInfo(order.symbol)
                    .then((response) => {
                      const freshPrice = parseFloat(response.data.data.closePrice.replace(',',''));
                      profit = order.order_amount.replace(',','') - freshPrice;
                      order.profit = profit;
                      order.order_executed_at = (new Date()).getTime();
                      order.status = OrderStatus.executed;
                      const updateQuery = `UPDATE orders SET ? WHERE id= ?`;
                      connection.query(updateQuery, [order,order.id],(err, updatedOrder) => {
                        if(err){
                        console.error(`Cannot execute order ${err}`);
                        }else{
                          connection.query(getUserDetails, [order.user_id], (err, newUser) => {
                            if(err){
                              console.log("cannot find user");
                            }else{
                              const balance = parseFloat(user[0].balance.replace(',','')) + freshPrice;
                              const netProfit = parseFloat(user[0].profit.replace(',','')) + order.profit;
                              connection.query(updateProfitQuery,[{balance:balance, profit:netProfit}, order.user_id], (err, updatedUser) => {
                                if(err){
                                  console.log(`${err}`);
                                  res.json({
                                    error:true,
                                    message:`Cannot update balance of user ${err}`
                                  })
                                }else{
                                  console.log("user's balance updated");
                                  console.log("Order successfully executed");
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
                const balance = parseFloat(user[0].balance.replace(',','')) - parseFloat(order.order_amount);
                const investment = parseFloat(user[0].investment.replace(',','')) + parseFloat(order.order_amount);
                const updates = {balance:`${balance}`,investment:`${investment}`};
                connection.query(updateBalanceQuery,[updates, order.user_id], (err, updatedUser) => {
                  if(err){
                    res.json({
                      error:true,
                      message:`Cannot update balance of user ${err}`
                    })
                  }else{
                    console.log("user's balance updated");
                    res.json({
                      error:false,
                      orderId:order
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
      if(result !== null){
        order = result[0];
        const orderAmount = parseFloat(result[0].order_amount.replace(',',''));
        NSEAPI.getQuoteInfo(result[0].symbol)
          .then((response) => {
            const freshPrice = parseFloat(response.data.data[0].closePrice.replace(',',''));
            console.log(`${response.data.data.closePrice}, ${freshPrice}, ${result[0].order_amount}, ${orderAmount}`)
            profit = freshPrice - orderAmount;
            const now = new Date();
            order.profit = profit;
            order.order_executed_at = now.getTime();
            order.status = OrderStatus.executed;
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
                        console.log(user);
                        const balance = parseFloat(user[0].balance.replace(',','')) + freshPrice;
                        const netProfit = parseFloat(user[0].profit.replace(',','')) + order.profit;
                        const updates = {balance: balance, profit: netProfit};
                        connection.query(updateBalanceQuery,[updates,order.user_id], (err, updatedUser) => {
                          if(err){
                            res.json({
                              error:true,
                              message:`Cannot update balance: ${err}`
                            });
                          }else{
                            console.log(`User's balance updated`);
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

module.exports = router;