const   mongoose                = require("mongoose"),
        passportLocalMongoose   = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    profilepic: {type: String, default: "/img/profile/default.png"},
    firstname: String,
    lastname: String,
    bio: String,
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, {timestamps: true});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);