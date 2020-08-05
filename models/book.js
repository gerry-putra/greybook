const   mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
	title: String,
	type: String,
	desc: String,
	cover: String,
    author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
    associates: [{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String,
		_id: false
	}],
    entries: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Entry"
		}
	],
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
    ],
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Book", BookSchema);