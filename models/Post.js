const mongoose = require("mongoose")
const {Schema} = mongoose

const postSchema = new Schema({
    text: {
        type: String,
        max: 500
    },
    postPhoto: {
        type: String
    },
    link: {
        type: String
    },
    likes: {
        type: Array
    },
    comments: {
        type: Array
    },
    userName: {
        type: String
    },
    userId: {
        type: String
    },
    photoUser: {
        type: String
    },
    challenge: {
        type: String
    },
    challengeId: {
        type: String
    },
    guildChallenge: {
        type: String
    },
    imageGuildChallenge: {
        type: String
    },
    complete: {
        type: Array
    },
    incomplete: {
        type: Array
    }
},
{
    timestamps: true
})

const Post = mongoose.model("Post", postSchema)
module.exports = Post