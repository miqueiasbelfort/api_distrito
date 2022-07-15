require("dotenv").config()
const jwt = require("jsonwebtoken")

const createUserToken = async(user, req, res) => {

    // criando o token
    const token = jwt.sign({
        username: user.username,
        id: user._id
    }, process.env.SECRET )

    // return token
    res.status(200).json({
        message: "Você está aultenticado",
        token: token,
        userId: user._id
    })

}

module.exports = createUserToken