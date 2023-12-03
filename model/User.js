const validator = require('validator')
const user = require('../DBmodel/user')
const bcrypt = require('bcryptjs')
const md5 = require('md5')

let User = function(data, getAvatar){
    this.data = data;
    this.errors = [];
    //this.avatar;
    if(getAvatar == undefined){getAvatar = false}
    if(getAvatar){this.getAvatar()}
    
}

User.prototype.cleanUp = function(){
    if(typeof(this.data.username) != "string"){this.data.username = ""}
    if(typeof(this.data.profile) !=  "string"){this.data.profile =""}
    if(typeof(this.data.email) != 'string'){this.data.emamil =""}

    this.data = {
        username : this.data.username.trim().toLowerCase(),
        profile : this.data.profile,
        email : this.data.email.trim().toLowerCase(),
        password :this.data.password
    }
}

User.prototype.validate = function(){
    return new Promise(async(resolve, reject)=>{
    if(this.data.username == ''){this.errors.push("Provide Username !!!")}
    if(this.data.username != '' && !validator.isAlphanumeric(this.data.username)){this.errors.push("Username can not be a symbol")}
    if(!validator.isEmail(this.data.email)){this.errors.push("Must provide valid email !!")}
    if(this.data.password.length < 0 ){this.errors.push("Enter a password of lenght 5 or 10")}

    if(this.data.username != ''){
        console.log("check username")

       let findUser = await user.find({username:this.data.username}).then((data)=>{return data});
       console.log(findUser)
       if(findUser.length){
            this.errors.push("Username already exist")
       }
    }
    if(this.email != ''){
        let findEmail = user.find({email:this.data.email}).then((data)=>{return data});
        if(findEmail.length){
            this.errors.push("Email already exist")
        }
    }
    resolve();


    })
}

User.prototype.register = function(){
    
    //this.errors.push("Username is invalid")
    return new Promise(async(resolve,reject)=>{
        this.cleanUp();
        await this.validate();
        //console.log(this.errors.length)
        if(!this.errors.length){
            //let salt = bcrypt.genSaltSync(10)
            this.data.password = bcrypt.hashSync(this.data.password)
            console.log(this.data.password)
            let new_user = new user(this.data);
            await new_user.save();
            this.getAvatar();
            resolve("done")
        }
        else {
            reject(this.errors)
        }
    })      
        //console.log(new_user)
       //await new_user.save();
     
}

User.prototype.login = function(){
    return new Promise (async(resolve, reject)=>{
        
        let findUser =await user.findOne({username:this.data.username}).then((find)=>{
            if(find.password && bcrypt.compareSync(this.data.password,find.password)){
                this.data = find
                //this.getAvatar()
                this.getAvatar()
               
                resolve("Login success")
            }
            else{
                reject("Password wrong!")
            }
        }).catch(err=>{console.log(err);reject("Login falied")})
        
        

        

    })
}

User.prototype.getAvatar = function(){
    this.avatar = `https://secure.gravatar.com/avatar/${md5(this.data.email)}?s=64`
    //console.log(this.data.email)
}

User.findByUsername = function(username){
    //console.log(username)
    return new Promise(async(resolve,reject)=>{
            if(typeof username !== 'string'){
                reject();return;
            }
            else{
                let name = user.findOne({username:username}).then((userDoc)=>{
                    if(userDoc){
                        userDoc = new User(userDoc,true)
                        userDoc = {
                            _id:userDoc.data._id,
                            username:userDoc.data.username,
                            avatar:userDoc.avatar,
                            profile:userDoc.data.profile
                        }
                        resolve(userDoc)
                        //return userDoc 
                    }
                    else{
                        reject("error finding in user!")
                    }
                }).catch(()=>reject("db error!!"))

            }
    })
    
}
module.exports = User;