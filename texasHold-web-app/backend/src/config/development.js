module.exports ={
    database:{
        host:"localhost",
        port: "5432" ,
        user:`${process.env.DB_USERNAME}`,
        password:`${process.env.DB_PASSWORD}`, // default
       database:"postgres",
    },

    PORT: 3000,
};