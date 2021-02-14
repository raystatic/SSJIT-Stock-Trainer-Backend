const express = require('express');
const router = express.Router();
const connection = require('../../dbConfig');
const { v4: uuidv4 } = require('uuid');

router.get('/',(req, res, next) => {
    res.status(405).json({
        error:true,
        message:"Get not supported"
    });
});

router.post('/', (req, res, next) => {
    const user = {
        name: req.body.name,
        email: req.body.email,
        avatar: req.body.avatar,
        last_login: new Date().getTime()
    };


    const isUserExistQuery = `SELECT * FROM users WHERE email= ?`;

    const insertUserQuery = `INSERT INTO users SET ?`;

    connection.query(isUserExistQuery,[user.email], (err, rows) => {
        if(err){
            console.log(`${err} : ${rows}`);
            res.json({
                error:true,
                message:`${err}`
            });
        }else{
            if(rows.length === 0){
                user.id = uuidv4();
                user.user_created_at = new Date().getTime();
                connection.query(insertUserQuery, user, (err, result) => {
                    if(err){
                        res.json({
                            error:true,
                            message:err
                        });
                    }else{
                        if(result !== null){    
                            res.json({
                                error:false,
                                user:result[0]
                            });
                        }else{
                            res.json({
                                error:true,
                                message: "Login failed" 
                            });
                        }
                    }
                })
            }else{
                user.id = rows[0].id
                user.balance = rows[0].balance;
                user.investment = rows[0].investment;
                user.profit = rows[0].profit;
                user.loss = rows[0].loss;
                user.positive_transactions = rows[0].positive_transactions;
                user.negative_transactions = rows[0].negative_transactions;
                user.isProUser = rows[0].isProUser
                user.user_created_at = rows[0].user_created_at;
                const updateUserQuery = `UPDATE users SET ? WHERE id = ?`;
                connection.query(updateUserQuery,[user, user.id], (err, result) => {
                    if(err){
                        res.json({
                            error:true,
                            message:err
                        });
                    }else{
                        if(result !== null){
                            console.log(user);
                             res.json({
                                error:false,
                                user:user 
                            });
                        }else{
                            res.json({
                                error:true,
                                message: "Login failed" 
                            });
                        }
                    }
                });
            }
        }
    });
});

router.put('/',(req, res, next) => {
    res.status(405).json({
        error:true,
        message:"Put not supported"
    });
});


router.delete('/',(req, res, next) => {
    res.status(405).json({
        error:true,
        message:"Delete not supported"
    });
});


module.exports = router;