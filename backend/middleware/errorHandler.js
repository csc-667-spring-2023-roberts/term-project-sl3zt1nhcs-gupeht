const { customErrorHandler } = require("./customErroraHandler");


module.exports = {

    errorHandler: (err,req,res,next) =>{

        customErrorHandler(err,req,res,()=>{
            res.locals.message = err.message;
            res.locals.error = req.app.get("env") === "development" ? err:{};
            res.status(err.status || 500);
            res.render("error");
        });
    },

};




