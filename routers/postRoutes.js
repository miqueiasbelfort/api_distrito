const Guild = require("../models/Guild")
const User = require("../models/User")
const Post = require("../models/Post")

const router = require("express").Router()

// mongodb
const mongoose = require("mongoose")

const getToken = require("../middlewares/get-token.js")
const getUserByToken = require("../middlewares/get-user-by-token")
const verifyToken = require("../middlewares/verify-token")
const {imageUpload} = require("../middlewares/image-upload")

router.post("/create", verifyToken, imageUpload.single("postPhoto"), async(req, res) => { // CREATE A NEW POST

    const {text} = req.body
    let postPhoto;

    if(req.file){
        postPhoto = req.file.filename
    }

    // get user by token
    const token = getToken(req)
    const user = await getUserByToken(token)

    if(!text || !req.file) {
        return res.status(422).json({error: "Por favor, adicione uma foto ou um texto para postar!"})
    }

    try {

        const newPost = await Post.create({
            text,
            postPhoto,
            userName: user.username,
            userId: user._id,
            photoUser: user.userPhoto
        })

        res.status(200).json(newPost)

    } catch(err){
        res.status(500).json(err)
    }

})

router.patch("/:id/edit", verifyToken, async(req, res) => { // EDIT A POST

    const {id} = req.params
    const {text} = req.body

    // get user by token
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get post by id
    const post = await Post.findById(mongoose.Types.ObjectId(id))

    try {

        post.text = text
        post.save()

        res.status(200).json({message: "Seu post foi ataulizado!"})

    } catch(err){
        res.status(500).json(err)
    }

})

router.patch("/comment/:id", verifyToken, async(req, res) => { // COMMENT IN POST

    const {id} = req.params
    const {comment} = req.body

    // get user by id
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get post by id
    const post = await Post.findById(mongoose.Types.ObjectId(id))

    if(!post){
        return res.status(422).json({error: "Post não encontrado!"})
    } else if(!comment){
        return res.status(422).json({error: "Não pode comentarios vazios!"})
    }

    // new comment
    const newComment = {
        comment,
        userName: user.username,
        userPhoto: user.userPhoto
    }

    try {

        post.comments.push(newComment)
        post.save()
        res.status(200).json({comment: newComment, message: "Comentario adicionado!"})

    } catch(err){
        res.status(500).json(err)
    }

})

router.patch("/like/:id", verifyToken, async(req, res) => { // LIKE IN A PHOTO

    const {id} = req.params

    // get user by id
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get post by id
    const post = await Post.findById(mongoose.Types.ObjectId(id))

    if(!post){
        return res.status(422).json({error: "Post não encontrado!"})
    }

    try {

        if(post.likes.includes(user.username)){
            await post.updateOne({ $pull: { likes: user.username } })
            return res.status(200).json("Deslike")
        }

        post.likes.push(user.username)
        post.save()

        res.status(200).json("Liked")

    } catch(err){
        res.status(500).json(err)
    }

})

router.delete("/delete/:id", verifyToken, async(req, res) => { // DELETE A PHOTO

    const {id} = req.params
    
    // get user by id
    const token = getToken(req)
    const user = await getUserByToken(token)

    // get post by id
    const post = await Post.findById(mongoose.Types.ObjectId(id))

    if(!post){
        return res.status(422).json({error: "Post não encontrado!"})
    } else if(user.username !== post.userName){
        return res.status(422).json({error: "Você não tem permisão para editar esse post!"})
    }

    try {

        await Post.findByIdAndDelete(post._id)
        res.status(200).json({message: "Post deletado com sucesso!"})

    } catch(err){
        res.status(500).json(err)
    }

})

router.get("/", async(req, res) => { // GET ALL POSTS   

    // get all post 
    const posts = await Post.find({}).sort([["createdAt", -1]]).exec()

    res.status(200).json(posts)

})

router.get("/:id", verifyToken, async(req, res) => { // GET POST BY ID   

    const {id} = req.params

    const post = await Post.findById(mongoose.Types.ObjectId(id))

    if(!post){
        return res.status(404).json({error: "Post não encontrado!"})
    }
    
    res.status(200).json(post)

})

router.get("/search", async(req, res) => { // SEARCH POSTS

    const {q} = req.query

    const posts = await Post.find({text: new RegExp(q, "i")}).exec()

    res.status(200).json(posts)

})


module.exports = router