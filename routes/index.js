const   express         = require("express"),
        router          = express.Router(),
        passport		= require("passport"),
        User 	 		= require("../models/user");
        
//================//
//  INDEX ROUTES  //
//================//
//LANDING PAGE route
router.get("/", (req, res) => {
    res.render("landing");
});

// LOGIN route
router.get("/login", (req, res) => {
    if(req.isAuthenticated()) {
		req.flash("error", "You are already logged in bitch! You must be logged out to relog.");
		return res.redirect("/greybook");
	}
    res.render("login");
});
// LOGIN logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/greybook",
		failureRedirect: "/login"
	}), (req, res) => {
});

// RREGISTER route
router.get("/register", (req, res) => {
    res.render("register");
});
// REGISTER logic
router.post("/register", async (req, res) => {
	let newUser	= new User(
		{
			username: req.body.username,
			email: req.body.email,
			firstname: req.body.firstname,
			lastname: req.body.lastname
		}
	);
	try {
		let user = await User.register(newUser, req.body.password);	
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "Welcome to Greybook " + user.username + "!");
			res.redirect("/greybook");
		});

	} catch(error) {
		req.flash("error", error.message);
		return res.redirect("/register");
	}
});

// Logout ROUTE logic...
router.get("/logout", (req,res) => {
    req.logout();
    req.flash("success", "You are logged out");
	res.redirect("/");
});

module.exports = router;