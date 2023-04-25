const rootController = {};

rootController.main =( req,res,next)=>{

    res.send("welcome to main page");

    
};

module.exports = rootController;