const express = require('express')
const Router = express.Router();
const {register,home,login,logout,ifUserExist,profilePostScreen,sharedProfile,profileFollowerScreen} = require('./controller/userController')
const {viewCreatePost,createPost,viewSingle,editPost,edit,search} = require('./controller/postController')
const {addFollow} = require('./controller/followController')

const IsAuth = require('./Auth/isAuth');

Router.get('/',home)

Router.post('/register',register)

Router.post('/login',login)

Router.post('/logout',logout)

Router.get('/create-post',IsAuth,viewCreatePost)

Router.post('/create-post',createPost)

Router.get('/post/:id',viewSingle)

Router.post('/search',search)

Router.get('/profile/:username',ifUserExist,sharedProfile,profilePostScreen)

Router.get('/profile/:username/follower',ifUserExist,sharedProfile,profileFollowerScreen)

Router.post('/addFollow/:username',addFollow)

Router.get('/post/:id/edit',editPost)

Router.post('/post/:id/edit',edit)

module.exports = Router;