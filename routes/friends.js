const   express         = require("express"),      
        router          = express.Router(),
        User 	        = require("../models/user"),
        Friend 	        = require("../models/friend"),
        middleware      = require("../middleware");
        
router.get("/greybook/friends/:userid", middleware.checkUserOwnership, async (req, res) => {
    // find friend with requester = currentUser_id with status.type=1 to get all 'pending request'
    // AND recipient = currentUser_id with status.type=1 to get all 'incoming friend request'
    
    res.render("friends/friends");
});

router.post("/greybook/friends/:userid/friend_req", middleware.isLoggedIn, async (req, res) => {
    try {
        // Make sure to not make request to SELF...
        if(req.params.userid !== req.user._id) {
            let foundUser   = await User.findById(req.params.userid);
            let foundFriend = await Friend.find({recipient: {id: foundUser._id, username: foundUser.username}});
            console.log(foundUser);
            console.log(foundFriend);
            
            // Make sure to not make double request
            if(foundFriend.length === 0 || foundFriend.status === 2) {
                let friendObj   = {
                    requester: {id: req.user._id, username: req.user.username},
                    recipient: {id: req.params.userid, username: foundUser.username},
                    status: 1
                }
                await Friend.create(friendObj);
                req.flash("success", "Sent friend request to " + foundUser.username);
                res.redirect("back");
            
            // If already requested, redirect and throw message.
            } else {
                req.flash("error", "You've already made a request to this user. Still waiting for approval.");
                res.redirect("back");
            }
        }
    } catch(error) {
        console.log(error);
        req.flash("error", "FR-1:Something went wrong, please try again...");
        res.redirect("back");
    }
});


module.exports = router;