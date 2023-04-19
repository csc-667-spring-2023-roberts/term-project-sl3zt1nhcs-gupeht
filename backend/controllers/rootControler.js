
exports.getHome = (req,res)=>{
    res.render("Home page",{
        title:"Texas Hold Game",
        message:"Web app under development"
    })
}