require("dotenv").config()

const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

//solve CORS
app.use(cors({credentials: true, origin: 'http://localhost:3000'}))

//upload directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))


// DB connecttion
require("./config/conn")

// Routes
app.use("/api/users", require("./routers/userRoutes"))
app.use("/api/guilds", require("./routers/guildRoutes"))
app.use("/api/posts", require("./routers/postRoutes"))

app.listen(process.env.PORT, () => {
    console.log("Backend is runnig!")
})