const IsAuth = (req,res,next)=>{

    if(req.session.user){
        next();
    }
    else{
        req.flash("errors","Please login first")
        req.session.save(()=>res.redirect('/'))
        
    }
}

module.exports = IsAuth;