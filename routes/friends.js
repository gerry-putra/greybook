const user = require("../models/user");

const   express         = require("express"),      
        router          = express.Router(),
        User 	        = require("../models/user"),
        Friend 	        = require("../models/friend"),
        middleware      = require("../middleware");
        
router.get("/greybook/friends/:userid", middleware.isLoggedIn, async (req, res) => {
    // find friend with requester = currentUser_id with status.type=1 to get all 'pending request'
    // AND recipient = currentUser_id with status.type=1 to get all 'incoming friend request'
    let foundUser       = await User.findById(req.params.userid);
    
    if(foundUser._id.equals(req.user._id)) {
        let pendingFriends  = 
        await Friend.find({requester: {id: req.user._id, username: req.user.username}, status: 1});
        let friendRequests  = 
            await Friend.find({recipient: {id: req.user._id, username: req.user.username}, status: 1});
        
        res.render("friends/friends", {user: foundUser, pendings: pendingFriends, requests: friendRequests});
    } else {
        res.render("friends/otherfriends", {user: foundUser});
    }
    
});

router.post("/greybook/friends/:userid/friend_req", middleware.isLoggedIn, async (req, res) => {
    try {
        // Make sure to not make request to SELF...
        if(req.params.userid !== req.user._id) {
            let foundUser   = await User.findById(req.params.userid);
            let foundFriend = await Friend.find({
                requester: {id: req.user._id, username: req.user.username},
                recipient: {id: foundUser._id, username: foundUser.username}
            });
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
        req.flash("error", "FR-1:Something went wrong, please try again...");
        res.redirect("back");
    }
});

router.put("/greybook/friends/:userid/:friendid/:status", middleware.checkUserOwnership, async (req, res) => {
    let foundUser   = await User.findById(req.params.friendid);
    let foundFriend = await Friend.findOne({
        requester: {id: foundUser._id, username: foundUser.username}, 
        recipient: {id: req.user._id, username: req.user.username}
    });
    
    if(req.params.status === "status_3") {
        await Friend.updateOne(foundFriend, {status: 3});
        let user1 = await User.findById(req.user._id);
        user1.friends.push({id: foundUser._id, username: foundUser.username});
        user1.save();
        foundUser.friends.push({id: user1._id, username: user1.username});
        foundUser.save();

    } else if(req.params.status === "status_2") {
        await Friend.updateOne(foundFriend, {status: 2});
    }
    // console.log(foundFriend);
    res.redirect("back");
});

module.exports = router;