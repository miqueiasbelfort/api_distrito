const mongoose = require("mongoose")
const {Schema} = mongoose

const guildUsersSchema = new Schema({
    guildName: String,
    guildId: String,
    Username: String,
    UserPhoto: String,
    userScore: Number,
    isGuildUser: Boolean,
},
{
    timestamps: true
}
)


const GuildUsers = mongoose.model("GuildUsers", guildUsersSchema)
module.exports = GuildUsers