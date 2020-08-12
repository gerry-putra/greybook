const   express         = require("express"),      
        router          = express.Router({mergeParams: true}), //this objects includes all params...
        Book 	 		= require("../models/book"),
        User 	 		= require("../models/user"),
        Friend 	        = require("../models/friend"),
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

        // Self profile
        if(req.user._id.equals(req.params.userid)) {
            res.render("profile/profile", {user: foundUser, books: foundBooks, assoBooks: foundAssoBooks});
        
        // Others' profile
        } else {
            let obj          = {
                requester: {id: req.user._id, username: req.user.username}, 
                recipient: {id: foundUser._id, username: foundUser.username}
            }
            let obj2         = {
                requester: {id: foundUser._id, username: foundUser.username}, 
                recipient: {id: req.user._id, username: req.user.username}
            }
            let foundFriend  = await Friend.findOne(obj);
            let foundFriend2 = await Friend.findOne(obj2);

            res.render("profile/otherprofile", {
                user: foundUser, 
                books: foundBooks, 
                assoBooks: foundAssoBooks, 
                friend: foundFriend, 
                friend2: foundFriend2 
            });
        }
    } catch(error) {
        req.flash("error", "PROF 1: Something went wrong!");
        res.redirect("back");
    }
});


// EDIT Profile Route
// Features: Add names, Add bio, Upload/change profile pic, change password, change email address, unfriend?? 
//           Link to Show All Books Page -- 
//                in 'show all books' page show overalls for every books created/associated.

// GET
router.get("/greybook/userprofile/:userid/editprofile", middleware.checkUserOwnership, async (req, res) => {
    try {
        let foundUser   = await User.findById(req.params.userid);
        res.render("profile/editprofile", {user: foundUser});
    } catch(error) {
        req.flash("error", "PROF 2: Something went wrong!");
        res.redirect("back");
    }
});

// UPDATE
router.put("/greybook/userprofile/:userid", async (req, res) => {
    try {
        let obj = {
            profilepic: req.body.profilepic,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            bio: req.body.bio
        }
        await User.findByIdAndUpdate(req.params.userid, obj);
        req.flash("success", "Successfully updated your profile!");
        res.redirect("/greybook/userprofile/" + req.params.userid);
    } catch(error) {
        req.flash("error", "PROF 3: Something went wrong!");
        res.redirect("back");
    }
});



module.exports = router;