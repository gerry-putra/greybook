const   express         = require("express"),      
        router          = express.Router(),
        User 	 		= require("../models/user"),
        Book 	 		= require("../models/book"),
        Entry 	 		= require("../models/entry"),
        middleware 		= require("../middleware");

//==================//
//   ENTRY ROUTES   //
//==================//
// CREATE Entry Logic Route
router.post("/greybook/:bookid/newentry", middleware.checkBookOwnership, async (req, res) => {
	try {
		let	bookid		= req.params.bookid,
			date		= req.body.date,
			description	= req.body.description,
			amount		= req.body.amount,
			type		= req.body.entrytype;
		let foundUser	= await User.findById(req.body.tofrom);
		let foundBook	= await Book.findById(req.params.bookid);
		let entryObj	= {};
		if(foundBook.associates.length === 0) {
			entryObj	= {
				bookid: bookid,
				date: date, 
				description: description, 
				amount: amount, 
				type: type};
		} else {
			let tofromObj	= {id: req.body.tofrom, username: foundUser.username};
			entryObj		= {
				bookid: bookid,
				date: date, 
				description: description, 
				amount: amount, 
				type: type, 
				tofrom: tofromObj};
		}
		let newEntry	= await Entry.create(entryObj);
		foundBook.entries.push(newEntry._id);
		foundBook.save();
		req.flash("success", "Successfully created new entry!");
		res.redirect("/greybook/" + req.params.bookid);
		
	} catch(error) {
		req.flash("error", "5:Something went wrong, please try again...");
		res.redirect("/greybook/" + req.params.bookid);
	}
});

// EDIT Entry Route
router.get("/greybook/:bookid/entry/:entryid/editentry", middleware.checkBookOwnership, async (req, res) => {
	let foundBook	= await Book.findById(req.params.bookid).populate("associates").exec();
	let foundEntry	= await Entry.findById(req.params.entryid);
	res.render("greybook/entryedit", {book: foundBook, entry: foundEntry});
});

// UPDATE Entry Route
router.put("/greybook/:bookid/entry/:entryid", middleware.checkBookOwnership, async (req, res) => {
	let entryObj	= {};
	let	date		= req.body.date,
		description	= req.body.description,
		amount		= req.body.amount,
		type		= req.body.entrytype;
	try {
		// BOOKS w/o associate will have Entries w/o tofrom(undefined)	
		if(req.body.tofrom == undefined) {
			entryObj		= {
				date: date,
				description: description, 
				amount: amount, 
				type: type, 
			};
		} else {
			let foundUser	= await User.findById(req.body.tofrom);
			let tofromObj	= {id: req.body.tofrom, username: foundUser.username};
			entryObj		= {
				date: date,
				description: description, 
				amount: amount, 
				type: type, 
				tofrom: tofromObj
			};
		}
		
		await Entry.findByIdAndUpdate(req.params.entryid, entryObj);
		req.flash("success", "Successfully editted entry!");
		res.redirect("/greybook/" + req.params.bookid);
	} catch(error) {
		req.flash("error", "12:Error while updating book, please try again...");
		res.redirect("/greybook/" + req.params.bookid);
	}
});

// DELETE Entry Route
router.delete("/greybook/:bookid/entry/:entryid", middleware.checkBookOwnership, async (req, res) => {
    try {
        let deletedEntry    = await Entry.findByIdAndRemove(req.params.entryid);
        let foundBook       = await Book.findById(req.params.bookid);
        let index           = foundBook.entries.indexOf(deletedEntry._id);
        foundBook.entries.splice(index, 1);
        foundBook.save();
        req.flash("success", "Successfully deleted entry!");
        res.redirect("/greybook/" + req.params.bookid);
    } catch(error) {
        req.flash("error", "13:Error while deleting entry, please try again...");
		res.redirect("/greybook/" + req.params.bookid);
    }
});

module.exports = router;