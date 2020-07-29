const   mongoose = require("mongoose");

const EntrySchema = new mongoose.Schema({
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
    },
    created: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Entry", EntrySchema);