const   mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
    bookid: String,
    date: String,
    description: String,
    amount: Number,
    type: String,
    tofrom: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        username: String
    }
}, {timestamps: true});

module.exports = mongoose.model("Entry", EntrySchema);