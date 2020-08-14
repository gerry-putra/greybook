const   mongoose = require("mongoose");

const BookSchema = new mongoose.Schema({
	title: String,
	type: String,
	desc: String,
    author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
    associates: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
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
}, {timestamps: true});

module.exports = mongoose.model("Book", BookSchema);