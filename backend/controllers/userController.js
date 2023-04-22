const express = require ('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require("../database/db");

exports.register = ( req,res)=>{

    const result = {};

    const {username,password,email} = req.body;

    db.query(`Select * FROM users WHERE username = $1 OR email = $2 `, [username,email]).then((data)=>{
        if ( data.rowCount > 0){
            result.error = "User with the provided username or password is already registered";
            res.status(409).json({Result:result});
        }
        else{
            return bcrypt.hash(password,10);
        }
    }).then(hashedPassword =>{
        return db.query( 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING user_id, username, email',
            [username, hashedPassword, email])
        }).then(result =>{
            if(result.rowCount !== 1){
                result.error = "User registration failed";
                res.status(500).json({Result: result});
            }
            else{
                result.user_id = data.rows[0].user_id;
                result.username = data.rows[0].username;
                result.email = data.rows[0].email;
                res.status(200).json({Result:result});
            }
        }).catch((err) =>{
            result.error = err.message;
            res.status(500).json({Result:result});
        });

};

exports.login = ( req,res) =>{

    const {username,password} = req.body;

    const result = {}

    db.query('Select * FROM users WHERE username = $1',[username])

        .then(result =>{

            if (result.rows.length > 0){

                const user = result.rows[0];

                return bcrypt.compare(password,user.password)

                    .then(isPasswordValid =>{

                        if (isPasswordValid){

                            const token = jwt.sign({user_id: user.user_id, username: user.username}, 'peanut_butter_is_bad');
                            res.cookie('jwt',token);
                            result.token = token;
                            result.username = user.username;
                            res.status(200).json({Result:result});
                        }
                        else{
                            result.error = "Invalid username or password";
                            res.status(401).json({Result:result});
                        }
                    });

            }else{
                result.error = "Invalid username or password";
                res.status(401).json({Result:result});
            }
        })
        .catch((error) =>{
            result.error = error.message;
            res.status(500).json({Result:result});
        });

}; 