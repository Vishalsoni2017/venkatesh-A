//const { TopologyDescriptionChangedEvent } = require('mongodb');
const posts = require('../DBmodel/post');
const follows = require('../DBmodel/follow');
const mongoose = require('mongoose')
const User = require('../model/User')


let Post = function(data,userId, requestedPostId) {
    this.data = data;
    this.errors = [];
    this.userId = userId
    this.requestedPostId = requestedPostId
}

Post.prototype.cleaUp = function(){

    if(typeof this.data.title != 'string'){this.data.title = ""}
    if(typeof this.data.body != 'string'){this.data.body =""}
    //console.log("before"+this.data.title+""+this.data.date)
    let d = new Date();
    //let newId = new mongoose.Types.ObjectId(this.userId);
    this.data = {
        title : this.data.title.trim(),
        body : this.data.body.trim(),
        createdDate : d.toString(),
        author: this.userId
    }
    //console.log("After"+this.data.title+""+this.data.date)

}

Post.prototype.validate = function(){

    if(this.data.title == ''){this.errors.push("Please enter title!")}
    if(this.data.body == ''){this.errors.push("Please enter body !!")}

}

Post.prototype.createPost = function(){
    return new Promise ((resolve,reject)=>{
        this.cleaUp();
        this.validate();

        if(!this.errors.length){
            let new_post = new posts(this.data);
           //console.log("new "+typeof this.data.title+""+this.data.author)
            new_post.save();
           console.log(new_post)
            resolve(new_post);
        }
        else{
            reject(this.errors)
        }
    })
}

Post.reusablePostQuery = function(uniqueOperation, visitorId, finalOperations=[]){
    return new Promise(async(resolve,reject)=>{
        let aggOperation = uniqueOperation.concat([
            {$lookup: {from : "users", localField:"author", foreignField:"_id", as:"authorDocument"}},
            {$project : {
                title:1,
                body:1,
                createdDate:1,
                author:{$arrayElemAt:["$authorDocument",0]}
            }}  
        ]).concat(finalOperations);
        
        let a_post = await posts.aggregate(aggOperation);
        //console.log("Resuasble POst query "+a_post)
        
        a_post = a_post.map((post)=>{
            //post.isVisitorOwner = visitorId.equals(post.author._id)
            //console.log("Resuasble POst query "+post)
            post.author ={
                username: post.author.username,
                avatar :new User(post.author,true).avatar
            }
            return post
         })

         resolve(a_post);
    })
}

Post.findSinglebyId = async function(id,visitorId){
    //console.log(id+""+visitorId)
    return new Promise(async(resolve,reject)=>{
        if(typeof id !== 'string'){
            reject("not a string");

            return;
        }
        else {

             let post = await posts.findOne({_id:id}).then((data)=>{return data});
             
             let a_post = await posts.aggregate([
                {$match : {_id:new mongoose.Types.ObjectId(id)}},
                {$lookup: {from : "users", localField:"author", foreignField:"_id", as:"authorDocument"}},
                {$project : {
                    title:1,
                    body:1,
                    createdDate:1,
                    author:{$arrayElemAt:["$authorDocument",0]}
                }}
             ])
             a_post = a_post.map((post)=>{
               post.isVisitorOwner = visitorId.equals(post.author._id)
                
                post.author ={
                    username: post.author.username,
                    avatar :new User(post.author,true).avatar
                }
                return post
             })
            
            
             try{
                if(a_post){
                  //  console.log("checking updated function"+a_post[0])
                    resolve(a_post[0]);
                }
             }
             catch{reject("Not find")}
        }
    })
}

Post.findPostById= function(id){
    //console.log(id)
    var  ObjectId = require('mongoose').Types.ObjectId;
    return new Promise((resolve,reject)=>{
        let findpost = posts.find({author:id}).then((data)=>{return(data)});
        resolve(findpost);
    }).catch(()=>reject("faild to get post"))
}

Post.prototype.actuallyUpdate = function(){
    return new Promise (async (resolve,reject)=>{
        if(!this.errors.length){
            await posts.findOneAndUpdate({_id:this.requestedPostId},{$set:{title:this.data.title,body:this.data.body}})
            resolve("success")
        }
        else{
            reject()
        }
    })
}

Post.prototype.updatePost= function(){
   return new Promise(async(resolve, reject)=>{
    
        try{
            //console.log("before chech update")
            //console.log("checking updated function"+this.requestedPostId+''+this.userId)
            let findPost = await Post.findSinglebyId(this.requestedPostId, this.userId).then((data)=>{
                if(data.isVisitorOwner){
                    let status =  this.actuallyUpdate()
                    console.log(status);
                    resolve(status)
                }
            }).catch(err=>console.log("errror"+err))


        }
        catch{
            reject("db error")
        };
    })

}

Post.search = function(searchTerm){
   // console.log("Send REquest Function"+searchTerm)
    return new Promise(async(resolve,reject)=>{
        if(typeof searchTerm == 'string'){
            let post = await Post.reusablePostQuery([
                {$match :{$text :{$search : searchTerm}}},

            ],undefined,[{$sort :{score: {$meta:"textScore"}}}] )
            //console.log("Search Functions"+post)
            resolve(post)
        }
        else{
            reject("not a string")
        }
    })
}


Post.isFollowOrNot = function(followId, authorId){
    return new Promise(async(resolve, reject)=>{
        let findFollowed =await follows.find({followedId:followId,authorID:authorId}).then((data)=>{
            if(data.length){
                console.log('true')
                resolve('true')
            }
            else{
                console.log('false')

                resolve('false')
            }
        }).catch(()=>resolve('f'))
    })
}

Post.findFowlloerById = function(id){
    return new Promise(async(resolve,reject)=>{
        let find = await follows.aggregate([
            {$match :{authorID :id}},
            {$lookup:{from:"users",localField:"followedId",foreignField:"_id",as:"userDocument"}},
            {$project:{
                authorID:1,
                followedId:1,
                user:{$arrayElemAt:["$userDocument",0]}
            }}
        ])
        edit_post = find.map((result)=>{
            result.user = {
                username : result.user.username,
                avatar: new User(result.user,true).avatar
            }
            return result
        })
        
        //console.log(find.userDocument.username)
        resolve(edit_post)
    })
}

Post.getFeed= function(id){
    return new Promise(async(resolve,reject)=>{
        
        resolve("hi")
    })
}

module.exports = Post;