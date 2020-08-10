const   middlewareObj   = {},
        Book            = require("../models/book"),
        User            = require("../models/user"),
        Comment         = require("../models/comment");

middlewareObj.checkBookOwnership = async (req, res, next) => {
    if(req.isAuthenticated()) {
        try {
            let foundBook   	= await Book.findById(req.params.bookid);
            if(foundBook.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "Denied! You do not have permission to access.");
                // "back" redirects user BACK to wherever they came from...
                res.redirect("back");
            }
        } catch(error) {
            req.flash("error", "Error! Book not found.");
            res.redirect("back");
        }
	} else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("back");
	}
}

middlewareObj.checkBookAndAssoOwnership = async (req, res, next) => {
    if(req.isAuthenticated()) {
        try {
            let foundBook   	= await Book.findById(req.params.bookid);
                if(foundBook.author.id.equals(req.user._id)) {
                    next();
                } else if(foundBook.associates.length > 0) {
                    foundBook.associates.forEach((asso) => {
                        if(asso.id.equals(req.user._id)) {
                            next();
                        } 
                    });
                    // req.flash("error", "1: Denied! You do not have permission to access.");
                    // // "back" redirects user BACK to wherever they came from...
                    // res.redirect("back");

                } else {
                    req.flash("error", "2: Denied! You do not have permission to access.");
                    // "back" redirects user BACK to wherever they came from...
                    res.redirect("back");
                }

        } catch(error) {
            req.flash("error", "Error! Book not found.");
            res.redirect("back");
        }
	} else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = async (req, res, next) => {
    if(req.isAuthenticated()) {
        try {
            let foundComment   		= await Comment.findById(req.params.commentid);
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You do not have permission to do that.");
                // "back" redirects user BACK to wherever they came from...
                res.redirect("back");
            }
        } catch(error) {
            req.flash("error", "Error! Comment not found.");
            res.redirect("back");
        }
	} else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("back");
	}
}

middlewareObj.checkProfileOwnership = async (req, res, next) => {
    if(req.isAuthenticated()) {
        try {
            let foundUser   		= await User.findById(req.params.userid);
            if(foundUser._id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You do not have permission to do that.");
                // "back" redirects user BACK to wherever they came from...
                res.redirect("back");
            }
        } catch(error) {
            req.flash("error", "Error! User not found.");
            res.redirect("back");
        }
	} else {
		req.flash("error", "You need to be logged in to do that.");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = (req, res, next) => {
	if(req.isAuthenticated()) {
		return next();
    }
    req.flash("error", "Access denied! You need to be logged in.");
	res.redirect("/login");
}

module.exports  = middlewareObj;