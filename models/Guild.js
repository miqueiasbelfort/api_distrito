const mongoose = require("mongoose")
const {Schema} = mongoose

const guildSchema = new Schema({
    guildname: {
        type: String,
        required: true,
        unique: true,
        max: 20
    },
    userName: {
        type: String
    },
    photoUser: {
        type: String
    },
    members: {
        type: Array
    },
    score: {
        type: Number,
        default: 0
    },
    warcry: {
        type: String,
        max: 100
    },
    description: {
        type: String,
        max: 500
    },
    guildPhoto: {
        type: String
    }
},
{
    timestamps: true
}
)

const Guild = mongoose.model("Guild", guildSchema)
module.exports = Guild