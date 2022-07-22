const mongoose = require("mongoose")
const {Schema} = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        max: 20,
        required: true
    },
    email: {
        type: String,
        unique: true,
        max: 50,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userPhoto: String,
    party: String,
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    },
    bio: {
        type: String,
        max: 500
    },
    link: {
        type: String
    },
    guildsMembersNotifications: {
        type: Array
    },
    guild: {
        type: String
    },
    guildPhoto: {
        type: String
    },
    guildLink: {
        type: String
    },
    isGuildAdmin: {
        type: Boolean,
        default: false
    },
    score: {
        type: Number,
        default: 100
    }
},
{
    timestamps: true
}
)

const User = mongoose.model("User", userSchema)

module.exports = User