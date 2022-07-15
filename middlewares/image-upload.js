const multer = require("multer")
const path = require("path")
const {v4: uuidv4} = require("uuid")

// The file where the images are
const imageStore = multer.diskStorage({
    destination: function(req, file, cb) {

        let folder = ""

        if(req.baseUrl.includes("users")){
            folder = "users"
        } else if (req.baseUrl.includes("posts")){
            folder = "posts"
        } else if (req.baseUrl.includes("guilds")) {
            folder = "guilds"
        }

        cb(null, `uploads/images/${folder}`) // The path of image

    },
    filename: function (req, file, cb) { // The name of image with framework uuid
        cb(null, uuidv4() + path.extname(file.originalname))
    }
})

const imageUpload = multer({
    storage: imageStore,
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(png|jpg)$/)) {
            return cb(new Error("Por favor, envie apneas jpg ou png!"))
        }
        cb(undefined, true)
    }
})

module.exports = { imageUpload }