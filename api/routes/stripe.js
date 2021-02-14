const express = require('express');
const router = express.Router();
const connection = require('../../dbConfig');
const { route } = require('./stock');
const {v4: uuidv4} = require('uuid');
const stripe = require("stripe")("sk_test_51IKddfBxBdshQqtee2BUUgS8K0CKsidnuf84CVz7nmxcHk14WWTLSmWeDBsNWWCJiLhmKxRFU786stSwG5NGJeB200QFRwMjsV");

router.get('/create-payment-intent', (req, res, next) => {
    const paymentIntent = stripe.paymentIntents.create({
        amount: 5 * 100,
        currency: "inr"
      })
      .then((response) => {
        res.json({
            error:false,
            client_secret:response.client_secret
        });
      })
      .catch((err) => {
          console.log(err);
        res.json({
            error:true,
        });
      })

    // res.json({
    //     error:false,
    //     client_secret:paymentIntent.client_secret
    // });
    
})

router.post('/createPayment',(req, res, next) => {
    
    const payment = {
        id:uuidv4(),
        user_id:req.body.userId,
        amount:req.body.amount,
        created_at:req.body.created_at,
        status:req.body.status
    };

    const insertPaymentQuery = `INSERT INTO payment SET ?`;

    connection.query(insertPaymentQuery,payment,(err, result) => {
        if(err){
            res.json({
                error:true,
                message:err.message
            });
        }else{

            const updates = {
                isProUser : 1
            };

            const updateUserQuery = `UPDATE users SET ? WHERE id= ?`;
            connection.query(updateUserQuery,[updates, payment.user_id], (err, updatedUser) => {
                if(err){
                res.json({
                    error:true,
                    message:`Cannot update user ${err}`
                })
                }else{
                    console.log("updated user")
                    console.log(updatedUser)
                    res.json({
                        error:false,
                        user:updatedUser
                    });
                }
            })

           
        }
    });


})


module.exports = router;