const   express         = require("express"),      
        router          = express.Router({mergeParams: true}), //this objects includes all params...
        Book 	 		= require("../models/book"),
		Comment 	 	= require("../models/comment"),
		middleware 		= require("../middleware");

//==================//
//  COMMENTS ROUTES //
//==================//
// CREATE Comment Route
router.post("/greybook/:bookid/comment/newcomment", middleware.isLoggedIn, async (req, res) => {
	let	text	= req.body.newcomment,
		author	= {
			id		: req.user._id,
			username: req.user.username
		};
	let commentObj	= {text: text, author: author};

	try {
		let newComment	= await Comment.create(commentObj);
		let foundBook	= await Book.findById(req.params.bookid);
		foundBook.comments.push(newComment);
		foundBook.save();
		req.flash("success", "Successfully added comment!");
		res.redirect("/greybook/" + req.params.bookid);

	} catch(error) {
		req.flash("error", "6:Something went wrong, please try again...");
		res.redirect("/greybook/" + req.params.bookid);
	}
	
});

// UPDATE Comment Route
router.put("/greybook/:bookid/comment/:commentid", middleware.checkCommentOwnership, async (req, res) => {
	try {
		await Comment.findByIdAndUpdate(req.params.commentid, {text: req.body.comment});
		req.flash("success", "Successfully updated comment!");
		res.redirect("/greybook/" + req.params.bookid);
	} catch(error) {
		req.flash("error", "Error updating comment, please try again...");
		res.redirect("/greybook/" + req.params.bookid);
	}
});

// DELETE Comment Route
router.delete("/greybook/:bookid/comment/:commentid", middleware.checkCommentOwnership, async (req, res) => {
	try {
		let deletedComment  = await Comment.findByIdAndRemove(req.params.commentid);
        let foundBook       = await Book.findById(req.params.bookid);
        let index           = foundBook.comments.indexOf(deletedComment._id);
        foundBook.comments.splice(index, 1);
        foundBook.save();
        req.flash("success", "Successfully deleted comment!");
        res.redirect("/greybook/" + req.params.bookid);
	} catch(error) {
		req.flash("error", "Error deleting comment, please try again...");
		res.redirect("/greybook/" + req.params.bookid);
	}
});

module.exports = router;