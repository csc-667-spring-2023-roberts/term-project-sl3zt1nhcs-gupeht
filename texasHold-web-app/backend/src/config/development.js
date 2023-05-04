module.exports ={
    database:{
        host:"localhost",
        port: "5432" ,
        user:`${process.env.DB_USERNAME}`,
        password:`${process.env.DB_PASSWORD}`,
       database:"postgres",
    },

    PORT: process.env.PORT,
};