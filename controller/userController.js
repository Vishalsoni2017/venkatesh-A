
const User = require('../model/User');
const Post = require('../model/Post');
const Follow = require('../model/Follow');

module.exports.register = (req,res)=>{
    console.log(req.body);
    let user = new User(req.body);
    user.register().then(()=>{
        //res.send("User registered!")
        req.session.user = {username : user.data.username}
        req.session.save(()=>res.redirect('/'));
    }).catch(err=>{
        //console.log(err)
        err.forEach(error=>{
            req.flash("regError",error)
        })
        req.session.save(()=>res.redirect('/'))
    })
}

module.exports.home = async(req,res)=>{
   // console.log("home"+" "+res.locals.errors)
   
    if(req.session.user){
        
        res.render('home-dashboard.ejs',{errors: res.locals.errors})
    }
    else{
    res.render('home-guest',{errors: req.flash("errors"),regError : req.flash("regError")})
    }
} 


module.exports.login = (req,res)=>{
    
    let user = new User(req.body)
     
    user.login().then(()=>{
        console.log(req.body.username)
        req.session.user = {avatar:user.avatar,username:req.body.username, _id:user.data._id}
        req.session.save(()=>res.redirect('/'));
    }).catch(err=>{
        req.flash("errors",err)
        req.session.save(()=>res.redirect('/'));
    })
}

module.exports.logout = (req,res)=>{
    req.session.destroy(()=>res.redirect('/'));
}

module.exports.profilePostScreen=(req,res,next)=>{
    // console.log(req.profileUser.username);
     //res.render('profile-post',{profile:req.profileUser})
     console.log("ProfilePostScreen function on user controller "+req.isFollowing)
     
    Post.findPostById(req.profileUser._id).then((findpost)=>{
        /*Post.isFollowOrNot(req.profileUser._id,req.session.user._id).then((result)=>{
            //console.log(result)
            this.isFollowOrNotFlag= result
        })*/
        console.log(req.followerLenghth)
        res.render('profile-post',{profile:req.profileUser,
            posts:findpost,length:findpost.length,
            followedFlag:res.locals.success,
            loggedInUser:req.session.user.username,
            flag:req.isFollowing,
            followerLenght:req.followerLenghth
        })
     })

}

module.exports.ifUserExist=(req,res,next)=>{
     
    User.findByUsername(req.params.username).then((userInfo)=>{
            req.profileUser = userInfo;
            next();

    }).catch(()=>res.render('404'))
}

module.exports.sharedProfile = async (req,res,next)=>{
    //console.log(req.profileUser._id,req.visitorId)
    let isVisitorProfile = false;
    let isFollowing = false;
    if(req.session.user){
        isVisitorProfile = req.profileUser._id.equals(req.session.user._id)
        isFollowing = await Post.isFollowOrNot(req.profileUser,req.session.user._id).then((data)=>{return data})
    }
    req.isVisitorProfile=isVisitorProfile;
    req.isFollowing = isFollowing;
    next()
}

module.exports.profileFollowerScreen = (req,res)=>{
    Post.findFowlloerById(req.profileUser._id).then((findfollower)=>{
        req.followerLenghth=findfollower.length
        res.render('profile-follower',
        {profile:req.profileUser,
            posts:findfollower,
            length:findfollower.length,
            followedFlag:res.locals.success,
            loggedInUser:req.session.user.username,
            flag:req.isFollowing})
     })
}