const mongoose = require('mongoose')
const schema = mongoose.Schema

const ProductSchema = new schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    quantity: {
        type: String,
        required: true,
    },
    category: {
        type: String,
    },
    inStock: {
        type: Boolean,
    },
    hasDiscount: {
        type: Boolean,
    },
    dateCreated: {
        type: Date,
        default: Date.now // Set the default value to the current date
    },
    dateModified: {
        type: Date
    }
});

const Product = mongoose.model('product', ProductSchema);

module.exports = Product;