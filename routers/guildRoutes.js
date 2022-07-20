const Guild = require("../models/Guild")
const User = require("../models/User")

const router = require("express").Router()

// mongodb
const mongoose = require("mongoose")

// middlewares
const getToken = require("../middlewares/get-token.js")
const getUserByToken = require("../middlewares/get-user-by-token")
const verifyToken = require("../middlewares/verify-token")
const {imageUpload} = require("../middlewares/image-upload")

router.post("/create", verifyToken, imageUpload.single("guildPhoto"), async(req, res) => { // CREATE A NEW GUILD

    const {guildname, warcry, description} = req.body
    let image;
    
    const guilds = await Guild.findOne({guildname})

    // get user by token
    const token = getToken(req)
    const user = await getUserByToken(token)

    if(req.file){
        image = req.file.filename
    } else {
        return res.status(422).json({error: `${user.username}, a foto de guilda é obrigatoria!`})
    }

    if(!guildname){
        return res.status(422).json({error: "O nome da guilda é obrigatorio."})
    } else if (guilds){
        return res.status(422).json({error: "Esse nome de guilda já existe, por favor escolha outro!"})
    } else if (user.score < 100){
        return res.status(422).json({error: "Para criar uma guilda a pontuação miníma é de 100"})
    }
    
    try {
        // Create a new guild
        const newGuild = await Guild.create({
            guildname,
            userName: user.username,
            photoUser: user.userPhoto,
            warcry,
            description,
            guildPhoto: image
        })

        res.status(200).json(newGuild)

    } catch(err) {
        res.status({err})
    }

})

router.patch("/edit/:id", verifyToken, async(req, res) => { // EDIT THE GUILD 

    const {id} = req.params
    const {guildname, warcry, description} = req.body

    if(req.file){
        guildPhoto = req.file.filename
    }

    // get user by token
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get user guild
    const guild = await Guild.findById(mongoose.Types.ObjectId(id))

    if (!guild){
        return res.status(422).json({error: "Esse nome de guilda não existe, por favor escolha outro!"})
    } else if (!guildname){
        return res.status(422).json({error: "O nome da guilda é obrigatorio."})
    }

    if(user.username !== guild.userName){
        return res.status(422).json({error: "Você não tem permisão para editar essa guilda!"})
    }

    try {

        guild.guildname = guildname
        guild.warcry = warcry
        guild.description = description

        await guild.save()

        res.status(200).json({message: `Guilda Atualizada com sucesso!`})

    } catch(err) {
        res.status(500).json({err: err})
    }

})

router.patch("/addmembers/:guildId/user/:userId", verifyToken, async(req, res) => { // ADD MEMBERS IN GUILD

    const {guildId, userId} = req.params

    // get user by token
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get the guild
    const guild = await Guild.findById(mongoose.Types.ObjectId(guildId))
    const userAdd = await User.findById(mongoose.Types.ObjectId(userId))

    if(user.username !== guild.userName){
        return res.status(422).json({error: "Você não tem permisão para adicionar membros!"})
    }

    try {

        if(guild.members.includes(userAdd.username)){
            return res.status(422).json({error: `O usuário ${userAdd.username} já está na sua guilda!`})
        }

        userAdd.guildsMembersNotifications.push(guild._id)
        userAdd.save()

        res.status(200).json({message: `O pedido para entrar na guilda foi mandado para ${userAdd.username}!`})

    } catch(err) {
        res.status(500).json(err)
    }

})

router.patch("/removemembers/:guildId/user/:userId", verifyToken, async(req, res) => { // REMOVE MENBERS OF GUILD

    const {guildId, userId} = req.params

    // get user by token
    const token = getToken(req)
    const user = await getUserByToken(token)
 
    // get the guild
    const guild = await Guild.findById(mongoose.Types.ObjectId(guildId))
    const userAdd = await User.findById(mongoose.Types.ObjectId(userId))

    if(user.username !== guild.userName){
        return res.status(422).json({error: "Você não tem permisão para remover membros!"})
    }

    try {

        if(!guild.members.includes(userAdd.username)){
            return res.status(422).json({error: `O usuário ${userAdd.username} não está na sua guilda!`})
        }

        await guild.updateOne({ $pull: { members: userAdd.username } })

        res.status(200).json({message: `O usuário ${userAdd.username} foi removido da guilda!`})

    } catch(err) {
        res.status(500).json(err)
    }

})

router.delete("/remove/:id", verifyToken, async(req, res) => { // DELETE A GUILD

    const {id} = req.params

    // Get a user vy token
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get the guild
    const guild = await Guild.findById(mongoose.Types.ObjectId(id))

    if(user.username !== guild.userName){
        return res.status(422).json({error: "Você não tem permisão para deletar essa guilda!"})
    }

    try {

        await Guild.findByIdAndDelete(guild._id)

        user.guild = null
        user.isGuildAdmin = false
        user.save()

        res.status(200).json({message: "Guilda excluida com sucesso!"})

    } catch(err) {
        res.status(500).json(err)
    }

})

router.get("/search", async(req, res) => { // SEARCH A GUILD

    const {q} = req.query

    // Get guilds with search
    const guilds = await Guild.find({guildname: new RegExp(q, "i")}).exec()

    res.status(200).json(guilds)

})

router.get("/", async(req, res) => { // GET ALL GUILDS

    const guilds = await Guild.find({})

    res.status(200).json(guilds)

})

module.exports = router