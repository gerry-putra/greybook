const user = require("../models/user");

const   express         = require("express"),      
        router          = express.Router({mergeParams: true}), //this objects includes all params...
        Book 	 		= require("../models/book"),
        User 	 		= require("../models/user"),
        middleware 		= require("../middleware");

        
//==================//
//  PROFILE ROUTES  //
//==================//
// SHOW Profile Route
router.get("/greybook/userprofile/:userid", middleware.isLoggedIn, async (req, res) => {
    let foundUser   = await User.findById(req.params.userid);
    let foundBooks  = await Book.find({author: {id: foundUser._id, username: foundUser.username}});
    res.render("greybook/profile", {user: user, books: foundBooks});
});


// EDIT Profile Route
// GET


// UPDATE



module.exports = router;