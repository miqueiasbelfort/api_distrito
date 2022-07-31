const Guild = require("../models/Guild")
const User = require("../models/User")
const GuildUsers = require("../models/GuildUsers")
const Challenges = require("../models/Challenge")

const router = require("express").Router()

// mongodb
const mongoose = require("mongoose")

// middlewares
const getToken = require("../middlewares/get-token.js")
const getUserByToken = require("../middlewares/get-user-by-token")
const verifyToken = require("../middlewares/verify-token")

router.post("/create/:guildId", verifyToken, async(req, res) => { //CREATEA A CHALLENGE
    
    const {guildId} = req.params

    const {title, desc, score, link} = req.body

    //get user by token
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get guild by id
    const guild = await Guild.findById(mongoose.Types.ObjectId(guildId))

    if(!guild){
        return res.status(404).json({error: "Guilda não encontrada!"})
    } else if(guild.score < score){
        return res.status(422).json({error: `Sua guilda só tem ${guild.score}`})
    } else if(guild.userName !== user.username){
        return res.status(422).json({error: `Oque você está fazendo aqui? Essa guilda não é sua!`})
    }

    if(!title){
        return res.status(422).json({error: "O Titulo é obrigatorio!"})
    } else if (!desc){
        return res.status(422).json({error: "Por favor descreva o seu desafio!"})
    } else if (!score){
        return res.status(422).json({error: "De um valor para esse desafio!"})
    }

    try {

        const newChallenge = await Challenges.create({
            guildName: guild.guildname,
            guildPhoto: guild.guildPhoto,
            guildScore: guild.score,
            title,
            desc,
            score,
            link,
            isActive: true
        })

        res.status(200).json({message: "Novo desafio criado!"})

    } catch(err){
        res.status(500).json(err)
    }

})



module.exports = router