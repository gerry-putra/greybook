const   express         = require("express"),      
        router          = express.Router(),
        User 	 		= require("../models/user"),
        Book 	 		= require("../models/book"),
        Entry 	 		= require("../models/entry"),
		Comment 	 	= require("../models/comment"),
		middleware 		= require("../middleware"),
		myFunctions		= require("../public/js/functions.js");

//===================//
//    BOOKS ROUTES   //
//===================//
// Greybook HOME Route
router.get("/greybook", middleware.isLoggedInMain, async (req, res) => {
	try {
		let foundUser 		= await User.findById(req.user._id);
		let foundBooks 		= await Book.find({author: {id: foundUser._id, username: foundUser.username}});
		let foundAssoBooks 	= await Book.find({associates: foundUser._id}).populate("associates").exec();

		res.render("greybook/greybookhome", {books: foundBooks, assoBooks: foundAssoBooks});
	} catch(error) {
		req.flash("error", "1:Something went wrong, please try again...");
		res.redirect("/greybook");
	}
});

// Greybook New ROUTE
router.get("/greybook/new", middleware.isLoggedIn, async (req, res) => {
	try {
		let foundUser = await User.findById(req.user._id).populate("friends").exec(); 
		res.render("greybook/greybooknew", {user: foundUser});
	} catch(error) {
		req.flash("error", "2:Something went wrong, please try again...");
		res.redirect("/greybook");
	}		
});	
	

// Greybook CREATE NEW BOOK Route
router.post("/greybook/new", middleware.isLoggedIn, async (req, res) => {
	try {
		let	title	= req.body.title,
			type	= req.body.type,
			desc	= req.body.desc,
			author	= {
				id		: req.user._id,
				username: req.user.username
			};
		let bookObj	= {title: title, type: type, desc: desc, author: author};
		let newBook	= await Book.create(bookObj);

		if(Array.isArray(req.body.associate)) {
			for(let associateId of req.body.associate) {
				newBook.associates.push(associateId);
			}

		} else if(req.body.associate !== undefined) {
			newBook.associates.push(req.body.associate);
		}
		newBook.save();
		req.flash("success", "Successfully created " + newBook.title + " book!");
		res.redirect("/greybook");

	} catch(error) {
		req.flash("error", "3:Something went wrong, please try again...");
		res.redirect("/greybook/new");
	}
});

// Greybook SHOW BOOK Route
router.get("/greybook/:bookid", middleware.checkBookAndAssoOwnership, async (req, res) => {
	try {
		let foundBook = await Book.findById(req.params.bookid)
			.populate("entries")
			.populate("comments")
			.populate("associates")
			.exec();

		if(foundBook.associates.length !== 0) {
			let toFromAmountArrLoan		= [],
				toFromAmountArrPayment	= [],
				objHolderLoan			= {},
				objHolderPayment		= {},
				foundEntries 			= await Entry.find({bookid: req.params.bookid});

			foundEntries.forEach((entry) => {
				if(entry.type === "loan") {
					toFromAmountArrLoan.push({username: entry.tofrom.username, amount: entry.amount});
				} else if(entry.type === "payment") {
					toFromAmountArrPayment.push({username: entry.tofrom.username, amount: entry.amount});
				}
			});	
			
			toFromAmountArrLoan.forEach((loan) => {
				if(objHolderLoan.hasOwnProperty(loan.username)) {
					objHolderLoan[loan.username] = objHolderLoan[loan.username] + loan.amount;
				} else {
					objHolderLoan[loan.username] = loan.amount;
				}
			});
			toFromAmountArrPayment.forEach((payment) => {
				if(objHolderPayment.hasOwnProperty(payment.username)) {
					objHolderPayment[payment.username] = objHolderPayment[payment.username] + payment.amount;
				} else {
					objHolderPayment[payment.username] = payment.amount;
				}
			});
			
			toFromAmountArrLoan		= [];
			for(let obj in objHolderLoan) {
				toFromAmountArrLoan.push({username: obj, loan: objHolderLoan[obj], payment: 0});
			}
			for(let obj in objHolderPayment) {
				toFromAmountArrLoan.forEach((payment) => {
					if(payment.username === obj) {
						payment.payment = objHolderPayment[obj];
					}
				});
			}
			res.render("greybook/greybookshow", 
				{book: foundBook, loans: toFromAmountArrLoan});

		} else if(foundBook.associates.length === 0) {
			// if statement here to branch for rendering between bookTypes...
			res.render("greybook/greybookshow", {book: foundBook});
		}	
		
	} catch(error) {
		req.flash("error", "4:Something went wrong, please try again...");
		res.redirect("/greybook");
	}
});

// EDIT Book Route
router.get("/greybook/:bookid/bookedit", middleware.checkBookOwnership, async (req, res) => {
	try {
		let foundBook = await Book.findById(req.params.bookid).populate("associates").exec();
		let foundUser = await User.findById(req.user._id).populate("friends").exec(); 
		res.render("greybook/greybookedit", {book: foundBook, user: foundUser, myFunctions: myFunctions});
	} catch(error) {
		req.flash("error", "7:Something went wrong, please try again...");
		res.redirect("/greybook/" + req.params.bookid + "/bookedit");
	}
});

// UPDATE Book Route
router.put("/greybook/:bookid", middleware.checkBookOwnership, async (req, res) => {
	try {
		let obj		= {
			title: req.body.title,
			desc: req.body.desc
		} 
		// Clear existing array for new associates...
		let updatedBook	= await Book.findByIdAndUpdate(req.params.bookid, {associates: []});

		if(Array.isArray(req.body.associate)) {
			for(let associateId of req.body.associate) {
				updatedBook.associates.push(associateId);
			}

		} else if(req.body.associate !== undefined) {
			updatedBook.associates.push(req.body.associate);
		}
		// Update associate...
		updatedBook.save();
		// Update title and description...
		await Book.findByIdAndUpdate(req.params.bookid, obj);

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