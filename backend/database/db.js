const {Pool} = require('pg');
const config = require(` ./config/${process.env.NODE_ENW || 'development'}`);

const pool = new Pool(config.database);

const db = {
    query: (text,params) =>{
        return new Promise( (resolve,reject) =>{
            pool.query(text,params,(err,res)=>{
                if (err){
                    reject(err)
                }
                else{
                    resolve(res);
                }
            });
        });
    },
};

module.exports = db;