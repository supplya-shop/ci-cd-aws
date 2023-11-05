const mongoose = require('mongoose')
const schema = mongoose.Schema

const UserSchema = new schema({
    firstname: {
        type: String
    },
    lastname: {
        type: Number
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    password: {
        type: String
    },
    status: {
        type: String,
        default: "unverified"
    },
    gender: {
        type: String,
    },
    dateofBirth: {
        type: String
    },
    address: {
        type: String,
    },
    role: {
        type: String
    },
    dateCreated: {
        type: Date,
        default: Date.now // Set the default value to the current date
    },
    dateModified: {
        type: Date
    }
});

const User = mongoose.model('user', UserSchema);

module.exports = User;