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
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
        _id: false
    }],
    created: {type: Date, default: Date.now}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);