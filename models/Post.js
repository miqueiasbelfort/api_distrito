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
    }
},
{
    timestamps: true
})

const Post = mongoose.model("Post", postSchema)
module.exports = Post