const express = require ('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require("../database/db");




router.post('/register', (req,res)=>{

    const {username,password,email} = req.body;

    bcrypt.hash(password,10).then(hashed =>{return db.query( 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING user_id, username, email',
            [username, hashedPassword, email])
        }).then(result =>{
            if(result.rowCount === 1){
                res.status(201).json(result.rows[0]);
            }
            else{
                res.status(500).json({error:" User registration failed"});
            }
        }).catch(err =>{
            res.status(500).json({err: err.message});
        });

});


router.post('/login',  (req,res)=>{

    const {username,password} = req.body;

    db.query('Select * FROM users WHERE username = $1',[username])

        .then(result =>{

            if (result.rows.length > 0){

                const user = result.rows[0];

                return bcrypt.compare(password,user.password)

                    .then(isPasswordValid =>{

                        if (isPasswordValid){

                            const token = jwt.sign({user_id: user.user_id, username: user.username}, 'your_secret_key');
                            res.cookie('jwt',token);
                            res.redirect('/'); 
                        }
                        else{
                            res.status(401).json({error:'Invalid username or password'});
                        }
                    });

            }else{
                res.status(401).json({error:'Invalid username or password'});
            }
        })
        .catch(error =>{
            res.status(500).json({error: error.message});
        });

});

module.exports = router;