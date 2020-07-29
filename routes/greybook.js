const   express         = require("express"),      
        router          = express.Router(),
        User 	 		= require("../models/user"),
        Book 	 		= require("../models/book"),
        Entry 	 		= require("../models/entry"),
		Comment 	 	= require("../models/comment"),
		middleware 		= require("../middleware");

//===================//
//    BOOKS ROUTES   //
//===================//
// Greybook HOME Route
router.get("/greybook", middleware.isLoggedIn, async (req, res) => {
	try {
		let allBooks = await Book.find({});
		res.render("greybook/greybookhome", {books: allBooks});
	} catch(error) {
		req.flash("error", "1:Something went wrong, please try again...");
		res.redirect("/greybook");
	}
});

// Greybook New ROUTE
router.get("/greybook/new", middleware.isLoggedIn, async (req, res) => {
	try {
		let allUsers = await User.find({});
		res.render("greybook/greybooknew", {users: allUsers});
	} catch(error) {
		req.flash("error", "2:Something went wrong, please try again...");
		return res.redirect("/greybook");
	}		
});	
	

// Greybook CREATE NEW BOOK Route
router.post("/greybook/new", middleware.isLoggedIn, async (req, res) => {
	let	title	= req.body.title,
		author	= {
			id		: req.user._id,
			username: req.user.username
		};
	let bookObj	= {title: title, author: author};

	try {
		let newBook			= await Book.create(bookObj);
		let associateObj	= {};
		if(Array.isArray(req.body.associate)) {
			for(let associateId of req.body.associate) {
				let foundUser 	= await User.findById(associateId);
				associateObj 	= {id: associateId, username: foundUser.username};
				newBook.associates.push(associateObj);
			}
		} else {
			let foundUser 	= await User.findById(req.body.associate);
			associateObj 	= {id: req.body.associate, username: foundUser.username};
			newBook.associates.push(associateObj);
		}
		newBook.save();
		req.flash("success", "Successfully created " + newBook.title + " book!");
		res.redirect("/greybook");

	} catch(error) {
		req.flash("error", "3:Something went wrong, please try again...");
		return res.redirect("/greybook/new");
	}
});

// Greybook SHOW BOOK Route
router.get("/greybook/:bookid", middleware.isLoggedIn, async (req, res) => {
	try {
		let foundBook = await Book.findById(req.params.bookid)
			.populate("entries")
			.populate("comments")
			.exec();
		res.render("greybook/greybookshow", {book: foundBook});

	} catch(error) {
		req.flash("error", "4:Something went wrong, please try again...");
		res.redirect("/greybook");
	}
});

// EDIT Book Route
router.get("/greybook/:bookid/bookedit", middleware.checkBookOwnership, async (req, res) => {
	try {
		let foundBook = await Book.findById(req.params.bookid);
		res.render("greybook/greybookedit", {book: foundBook});
	} catch(error) {
		req.flash("error", "7:Something went wrong, please try again...");
		res.redirect("/greybook/" + req.params.bookid + "/bookedit");
	}
});

// UPDATE Book Route
router.put("/greybook/:bookid", middleware.checkBookOwnership, async (req, res) => {
	let titleObj 	= {title: req.body.title};
	try {
		await Book.findByIdAndUpdate(req.params.bookid, titleObj);
		req.flash("success", "Successfully editted book!");
		res.redirect("/greybook/" + req.params.bookid);
	} catch(error) {
		req.flash("error", "8:Error while updating book, please try again...");
		res.redirect("/greybook/" + req.params.bookid);
	}
});

// DELETE Book Route
router.delete("/greybook/:bookid", middleware.checkBookOwnership, async (req, res) => {
	try {
		// Remove book from DB
		let deletedBook	= await Book.findByIdAndRemove(req.params.bookid);
		// Remove associated entries from DB
		for(let entryId of deletedBook.entries) {
			try {
				await Entry.findByIdAndRemove(entryId);

			} catch(error) {
				req.flash("error", "10:Error trying to delete book, please try again...");
				res.redirect("/greybook");
			}
		}
		// Remove associated comments from DB
		for(let commentId of deletedBook.comments) {
			try {
				await Comment.findByIdAndRemove(commentId);

			} catch(error) {
				req.flash("error", "11:Error trying to delete book, please try again...");
				res.redirect("/greybook");
			}
		}
		req.flash("success", "Successfully deleted " + deletedBook.title);
		res.redirect("/greybook");	

	} catch(error) {
		req.flash("error", "9:Error trying to delete book, please try again...");
		res.redirect("/greybook");
	}
});

module.exports = router;