const Follow = require('../model/Follow')



module.exports.addFollow = (req,res)=>{
    //console.log("follow controller"+""+req.params.username, req.session.user._id)
    let follow = new Follow(req.params.username, req.visitorId)

    follow.create().then(()=>{
        req.flash('success',"followed!");
        req.session.save(()=>res.redirect(`/profile/${req.params.username}`))
    }).catch((err)=>{
        console.log(err)
        err.forEach((e)=>{
            req.flash('errors',e)
        })
        req.session.save(()=>res.redirect('/'))
    })
    
}

