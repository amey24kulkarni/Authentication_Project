var express                = require("express"),
    mongoose               = require("mongoose"),
    passport               = require("passport"),
    bodyParser             = require("body-parser"),
    User                   = require("./models/user"),
    LocalStat              = require("passport-local"),
    passportLocalMongoose  = require("passport-local-mongoose"),
    flash                  = require("connect-flash"),    
    request                = require("request"),
    JSAlert                = require("js-alert");
    
mongoose.connect("mongodb://localhost:27017/auth_demo_app",{ useNewUrlParser: true });

 
var app = express();

app.use(require("express-session")({
    secret: "Auth Project",
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(bodyParser.urlencoded({extended: true}));

passport.use(new LocalStat(User.authenticate()));
passport.serializeUser(User.serializeUser(),function(user,done){
    done(null,user.id);
});

passport.deserializeUser(User.deserializeUser(),function(id,done){
    User.findById(id, function(err, user) {
            done(err, user);
        });
});
  
/////ROUTES


app.get("/", function(req,res){
    res.render("home");
});

app.get("/secret", isLoggedIn, function(req,res){
    res.render("secret");
});

app.get("/register",function(req,res){
   res.render("register"); 
});

app.post("/register", function(req,res){
    req.body.username
    req.body.password
    if(!req.body.username && res.statusCode == 200){
        res.render("missuser");
    }
    if(!req.body.password && res.statusCode == 200){
        res.render("misspass");
    }
    User.register(new User({username:req.body.username}), req.body.password, function(err, user){
        if(err && res.statusCode == 200){
             res.render('loginnot');
        }
        passport.authenticate("local")(req,res,function(){
           res.render("secret"); 
        });
    });
});




//LOGIN

app.get("/login",function(req,res){
   res.render("login"); 
});

passport.authenticate('local', { failureFlash: 'Invalid username or password.' });
app.post("/login", passport.authenticate("local",{
    successRedirect : "/secret",
    failureRedirect : "/login",
}), function(req,res){
});


app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}



app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server Started"); 
});