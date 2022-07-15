require("dotenv").config()
const mongoose = require("mongoose")

//connection
const conn = async () => {
    try {

        const dbConn = await mongoose.connect(process.env.MONGODB)
        console.log("DB connected")

        return dbConn

    } catch(error) {
        console.log(error)
    }
}

conn()
module.exports = conn