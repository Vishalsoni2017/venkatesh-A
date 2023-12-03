let Post = require('../model/Post')


module.exports.viewCreatePost = (req,res)=>{
    res.render('create-post')
}

module.exports.createPost =async (req,res)=>{
    console.log(req.session.user._id)
    let post = new Post(req.body,req.session.user._id);
    post.createPost().then((new_post)=>{
        req.session.save(()=>res.redirect(`/post/${new_post._id}`));
    }).catch(err=>{console.log(err);res.send("Error")})
    
}

module.exports.viewSingle = async(req,res)=>{
    //console.log(req.params.id+''+req.visitorId)
    console.log(res.locals.success)
    try{
        
        let post = await Post.findSinglebyId(req.params.id,req.visitorId)
        //console.log("viewSingle"+ post.author.username)
        res.render('single-screen-post',{success:res.locals.success,post:post,username:post.author.username, avatar :post.author.avatar,loginUser:req.session.user.username})
    }catch{
        res.render('404')
    }
}

module.exports.editPost = async(req,res)=>{
    try{
        let post = await Post.findSinglebyId(req.params.id,req.visitorId);
        if(post.isVisitorOwner){
            console.log(post)
            res.render('edit-post',{post:post})
        }
        else{
            res.flash("errors","You don't have permission");
            req.session.save(()=>res.redirect('/'))
        }
    }
    catch{err=>console.log(err)}

}

module.exports.edit = async(req,res)=>{

    let post = new Post(req.body, req.visitorId, req.params.id)
    post.updatePost().then((status)=>{
        if(status == 'success'){
            req.flash("success","post updated")
            req.session.save(()=>res.redirect(`/post/${req.params.id}`))
        }
        else {
            post.errors.forEach(err=>{
                req.flash("errors",err)
            })
        }
    }).catch(()=>req.session.save(()=>res.redirect(`/post/${req.params.id}/edit`)))
}

module.exports.search= async(req,res)=>{
    Post.search(req.body.searchTerm).then((posts)=>{
        //console.log(posts)
        res.json(posts)
    }).catch(err=>{
        console.log(err);
        res.json([])
    })
}