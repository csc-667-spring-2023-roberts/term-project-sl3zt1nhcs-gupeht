const rootController = {};

rootController.main =(req,res,next)=>{


    res.render('index');
    next();
};

module.exports = rootController;