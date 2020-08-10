const   express         = require("express"),
        app             = express(),
        bodyParser  	= require("body-parser"),
        mongoose 	    = require("mongoose"),
        flash	 		= require("connect-flash"),
        passport		= require("passport"),
        LocalStrategy	= require("passport-local"),
        methodOverride	= require("method-override"),
        User 	 		= require("./models/user");

// ***Requiring ROUTES files
const 	indexRoutes		= require("./routes/index"),
	 	greybookRoutes	= require("./routes/greybook"),
	 	entryRoutes 	= require("./routes/entry"),
	 	profileRoutes 	= require("./routes/profile"),
	 	commentRoutes	= require("./routes/comment");

// Set Up
mongoose.connect("mongodb://localhost/greybook", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});        
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public")); // Tell express to serve the public directory...
app.use(methodOverride("_method")); // Lets you use the HTTP (PUT or DELETE) where its not supported.
app.use(flash());
app.locals.moment = require('moment'); // Moment JS


//=========================
// PASSPORT CONFIGURATION
//=========================
app.use(require("express-session")({
	secret: "Ferrersford Storm Watch",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// This MIDDLEWARE will run for every ROUTES. It pass in currentUser to every single template...
// 'res.locals' is all that's available in our templates...
app.use((req, res, next) => {
    res.locals.currentUser	= req.user;
    res.locals.error		= req.flash("error");
	res.locals.success		= req.flash("success");
	next();
});


// ***TELL APP.JS to use these ROUTES files
app.use("/", indexRoutes);
app.use("/", greybookRoutes);
app.use("/", entryRoutes);
app.use("/", commentRoutes);
app.use("/", profileRoutes);


app.listen(process.env.PORT || 3001, process.env.IP, () => {
	console.log("The greyBook server start at port 3001.");
});