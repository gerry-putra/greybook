const   express         = require("express"),      
        router          = express.Router(),
        User 	        = require("../models/user"),
        middleware      = require("../middleware");
        
router.get("/greybook/friends/:userid", middleware.checkUserOwnership, async (req, res) => {
    res.render("friends/friends");
});


module.exports = router;