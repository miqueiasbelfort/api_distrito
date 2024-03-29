const mongoose = require("mongoose")
const {Schema} = mongoose

const challengeSchema = new Schema({
    guildName: {
        type: String
    },
    guildPhoto: {
        type: String
    },
    title: {
        type: String,
        max: 220
    },
    desc: {
        type: String,
        max: 520
    },
    score: {
        type: Number
    },
    link: {
        type: String,
        max: 220
    }
},{
    timestamps: true
})

const Challenges = mongoose.model("Challenges", challengeSchema)
module.exports = Challenges