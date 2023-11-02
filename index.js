const express = require('express');
const mongoose = require('mongoose')
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PORT || 4000;
app.use(express.json())

mongoose.connect('mongodb+srv://supplya:Berth%232023@supplya.8lgr9ki.mongodb.net/').then(() => {
    console.log("Db connected successfully...")
})

app.all('/test', (req, res) => {
    // query string
    // console.log(req.query)
    // console.log(req.query.name)
    // res.send(req.query)

    // path params
    // console.log(req.params)
    // res.send(req.params)

    // post
    console.log(req.body)
    res.send(req.body)
})

const productRoute = require('./routes/Product.route.js');
app.use('/products', productRoute);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});

const userRoute = require('./routes/User.route.js');
app.use('/users', userRoute);

app.listen(port, () => {
    console.log(`Server running on Port ${port}`);
});
