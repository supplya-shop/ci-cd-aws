const mongoose = require('mongoose')

const LinksSchema = new mongoose.Schema({

    public: {
        type:String
    },

    private:{
        type:String
    },
})




module.exports = mongoose.model('Links', LinksSchema)