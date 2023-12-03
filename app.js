const express = require('express');
const app = express();
const Router = require('./router')
const cors = require('cors')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const dotenv = require('dotenv');
const flash = require('connect-flash')

dotenv.config()
const url = process.env.URL;


const store = new MongoDBStore({
    uri:url,
    collection:'sessions'
})

const sessionOptions = session({
    secret:"vsoni",
    resave:false,
    saveUninitialized:true,
    store:store
    ,cookie:{maxAge:1000*60*60*10,httpOnly:true}
})


app.use(sessionOptions)
app.use(flash());  
app.use(function(req,res,next){
    if(req.session.user){
        req.visitorId = req.session.user._id
    }
    else {
        req.visitorId = 0;
    }
    res.locals.errors = req.flash("errors")
    res.locals.success =req.flash("success")
    res.locals.user = req.session.user;
    next();
}) 
app.use(cors());
app.use(express.static('public'))
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.set('view engine','ejs');



app.use('/',Router);

const server = require('http').createServer(app);
const io = require('socket.io')(server);

//make expression session data avalible from socket

io.use(function(socket,next){
    sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection',(socket)=>{
    console.log("new user connected"+" "+socket.request.session.user.username)
    //socket.on()
    if(socket.request.session.user){
        let user = socket.request.session.user

        socket.emit('welcome',{username : user.username, avatar: user.avatar})
        socket.on('chatMessageFromBrowser',function(data){
            socket.broadcast.emit('chatMessageFromServer',{message:data.message,user : user.username, avatar:user.avatar})
        })
    }
    
})


module.exports = server;