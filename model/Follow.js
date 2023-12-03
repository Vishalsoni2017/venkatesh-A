
const follows = require('../DBmodel/follow')
const users = require('../DBmodel/user')

let Follow = function(followerUser, authorId){
    this.followerUser = followerUser;
    this.authorId = authorId; 
    this.followerId;
    this.errors = []
}

Follow.prototype.validate = async function(action){
    let user = await users.findOne({username:this.followerUser});
    //console.log("validate function"+" "+user)
    if(user){
        this.followerId = user._id
    }
    let doesFollow =await follows.findOne({followedId : this.followerId, authorID :this.authorId}).then((data)=>{return data})
    console.log("check does folllow"+" "+doesFollow)
    if(action == 'follow'){
        if(doesFollow){this.errors.push("Already followed")}

    }
    if(action == 'unfollow'){
        if(!doesFollow){this.errors.push("You are not following")}
    }
    if(this.followerId.equals(this.authorId)){
        this.errors.push("You are not follow himself")
    }
}

Follow.prototype.create = function(){
    return new Promise(async(resolve,reject)=>{
        await this.validate("follow")
        if(!this.errors.length){
          
            //console.log("create function "+""+this.followerId,this.authorId)
            let data = {followedId:this.followerId,authorID:this.authorId}
            let newFollower = new follows(data)
            //console.log("create function "+""+newFollower)
            await newFollower.save();
            resolve();
        }
        else {
            reject(this.errors)
        }
    });
}

module.exports = Follow;