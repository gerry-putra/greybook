const mongoose = require("mongoose");

const FriendSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
	},
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
	},
    status: {
        type: Number,
        enums: [
            0,    //'add friend',
            1,    //'requested',
            2,    //'rejected',
            3     //'accepted'
        ],
        default: 0
    },
  }, {timestamps: true});

  module.exports = mongoose.model("Friend", FriendSchema);