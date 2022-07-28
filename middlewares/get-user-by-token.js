const jwt = require("jsonwebtoken")

const User = require("../models/User")

// get user by token id
const getUserByToken = async (token) => {

    if(!token) {
        return res.status(401).json({message: "Acesso Negado!"})
    }

    const decoded = jwt.verify(token, process.env.SECRET)

    const userId = decoded.id

    const user = await User.findOne({_id: userId}).select("-password")

    return user
}

module.exports = getUserByToken