const User = require("../models/User")
const Guild = require("../models/Guild")
const Post = require("../models/Post")

const router = require("express").Router()
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const createUserToken = require("../middlewares/create-user-token")
const getToken = require("../middlewares/get-token.js")
const getUserByToken = require("../middlewares/get-user-by-token")
const verifyToken = require("../middlewares/verify-token")
const {imageUpload} = require("../middlewares/image-upload")

router.post("/register", async(req, res) => { //CREATE A NEW USER
    
    const {username, email, password, confirPassword} = req.body

    if(!username){
        return res.status(422).json({error: "Nome de usuário é obrigatorio!"})
    } else if (!email){
        return res.status(422).json({error: "O e-mail é obrigatorio!"})
    } else if (!password){
        return res.status(422).json({error: "A senha é obrigatoria!"})
    } else if (!confirPassword){
        return res.status(422).json({error: "Por favor confirme a sua senha!"})
    }

    if(password !== confirPassword){
        return res.status(422).json({error: "Senhas diferentes!"})
    }

    const userName = await User.findOne({username})
    if(userName){
        return res.status(422).json({error: "Nome de usuário já existe!"})
    }
    const userEmail = await User.findOne({email})
    if(userEmail){
        return res.status(422).json({error: "E-mail já cadastrado!"})
    }

    // create hash
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // username in lower case
    const usernameLower = username.toLowerCase()

    // create user
    const user = await User.create({
        username: usernameLower, 
        email,
        password: passwordHash
    })

    try {

        const newUser = await user.save()
        await createUserToken(newUser, req, res)

    } catch(err) {
        res.status(500).json({error: err})
    }

})

router.post("/login", async(req, res) => { // LOGIN A USER
    const {email, password} = req.body

    if (!email){
        return res.status(422).json({error: "O e-mail é obrigatorio!"})
    } else if (!password){
        return res.status(422).json({error: "A senha é obrigatoria!"})
    }

    const user = await User.findOne({email})
    if(!user){
        return res.status(422).json({error: "Usuário não existe!"})
    }

    // check the password
    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword){
        res.status(422).json({
            error: "Senha invalida!"
        })
        return
    }

    await createUserToken(user, req, res)

})

router.patch("/edit", verifyToken, imageUpload.single("userPhoto"), async(req, res) => { // EDIT USER


    const {username, bio, link} = req.body

    // check if user exist by token and get user
    const token = getToken(req)
    const user = await getUserByToken(token)

    if(req.file) {
        user.userPhoto = req.file.filename
    }

    if(!username){
        return res.status(422).json({error: "Nome de usuário é obrigatorio!"})
    } 
    
    user.username = username.toLowerCase()    
    user.bio = bio
    user.link = link

    try {

        const updatedUser = await User.findOneAndUpdate(
            {_id: user._id},
            {$set: user},
            {new: true}
        )

        res.status(200).json({message: "Usuário atualizado!"})

    } catch(err) {
        res.status(500).json(err)
    }


})

router.get("/", verifyToken, async(req, res) => {   // GET A USER BY TOKEN FOR EDIT
    // get user by token
    const token = getToken(req)
    const user = await getUserByToken(token)

    if(!user){
        return res.status(404).json({error: "Usuário não encontrado!"})
    }
    res.status(200).json(user)
})

router.put("/:username/follow", verifyToken, async(req, res) => { //FOLLOW AND UNFOLLOW A USER

    const username = req.params.username

    // Get user by params
    const userData = await User.findOne({username: username})

    // Get the user by token and check token
    const token = getToken(req)
    const user = await getUserByToken(token)

    if(!userData){
        return res.status(404),json({error: "Usuário não encontrado!"})
    }
    if(username === user.username){
        return res.status(422).json({error: "Ocorreu algum erro por favor tente novamente mais tarde!"})
    }

   try {

    if(userData.followings.includes(user._id)){
        
        await userData.updateOne({ $pull: { followings: user._id } })
        await user.updateOne({ $pull: { followers: userData._id } })

        res.status(200).json({message: `Você deixou de seguir ${userData.username}`})
        

    } else {
        userData.followings.push(user._id)
        userData.save()

        user.followers.push(userData._id)
        user.save()

        res.status(200).json({message: `Você esta seguindo ${userData.username}`})

    }

   } catch(err){
    res.status(500).json({err})
   }

})

router.patch("/accept/:id", verifyToken, async(req, res) => { // ACCEPT ENTER IN THE GUILD

    const {id} = req.params


    // get user by id
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get guild by id
    const guild = await Guild.findById(mongoose.Types.ObjectId(id))

    if(!guild){
        return res.status(404).json({error: "Guilda não encontrada."})
    }

    if(user.username === guild.userName){
        return res.status(422).json({error: `Você já é guilder master da ${guild.guildname}`})
    }

    try {

        if(guild.members.includes(user.username)){
            return res.status(422).json({error: `O usuário ${userAdd.username} já está na sua guilda!`})
        }

        guild.members.push(user.username)
        guild.save()

        user.guild = guild.guildname
        user.save()
        await user.updateOne({ $pull: { guildsMembersNotifications: guild._id } })

        res.status(200).json({message: `Você está participando da guilda ${guild.guildname}!`})

    } catch(err){
        res.status(500).json(err)
    }

})

router.get("/search", async(req, res) => { // SEARCH A USER

    const {q} = req.query

    // users
    const users = await User.find({username: new RegExp(q, "i")}).exec()

    res.status(200).json(users)

})

router.get("/:username", verifyToken, async(req, res) => { //USER PROFILE
    const {username} = req.params

    // get user by Id
    const user = await User.findOne({username: username})

    // get all posts of user
    const posts = await Post.findOne({userName: username})

    if(!user){
        return res.status(404).json({error: "Usuário não encontrado!"})
    }

    res.status(200).json({user, posts})

})

router.patch("/permission/:guildId", verifyToken, async(req, res) => {

    const {guildId} = req.params

    const token = getToken(req)
    const user = await getUserByToken(token)

    // get guild by id
    const guild = await Guild.findById(mongoose.Types.ObjectId(guildId))

    if(user.username === guild.userName) {
        return res.status(422).json({error: "Você já é Guild Master dessa guilda!"})
    }

    try {

        guild.permissionToEnter.push(user.username)
        guild.save()

        res.status(200).json({message: `Você pediu para entrar na guilda ${guild.guildname}`})

    }catch(err){
        res.status(500).json(err)
    }

})

module.exports = router