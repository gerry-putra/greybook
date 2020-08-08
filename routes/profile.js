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
    try {
        let foundUser       = await User.findById(req.params.userid);
        let foundBooks      = await Book.find({author: {id: foundUser._id, username: foundUser.username}});
        let foundAssoBooks  = await Book.find({associates: {id: foundUser._id, username: foundUser.username}});
        if(req.user._id.equals(req.params.userid)) {
            res.render("profile/profile", {user: foundUser, books: foundBooks, assoBooks: foundAssoBooks});
        } else {
            res.render("profile/otherprofile", {user: foundUser, books: foundBooks, assoBooks: foundAssoBooks});
        }
    } catch(error) {
        res.redirect("back");
    }
});


// EDIT Profile Route
// Features: Edit names, upload profile pic, change password, change email address, add/remove Friends, 
//           Link to Show All Books Page -- 
//                in 'show all books' page show overalls for every books created/associated.

// GET


// UPDATE



module.exports = router;