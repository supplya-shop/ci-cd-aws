const {default: mongoose} = require('mongoose')

const dbConnect = () => {
    try {
        const conn = mongoose.connect('')
        console.log('Db connected successfully')
    } catch (error) {
        console.log("Database error")
    }
}

module.exports = dbConnect