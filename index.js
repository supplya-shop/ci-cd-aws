const express = require('express');
const mongoose = require('mongoose')
// const bcrypt = require('bcrypt')
const app = express();
const dotenv = require('dotenv').config();
const port = process.env.PORT || 4000;
app.use(express.json())

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
app.use('/api/products', productRoute);

const userRoute = require('./routes/User.route.js');
app.use('/api/users', userRoute)

const authRoute = require('./routes/Auth.route.js')
app.use('/api/auth', authRoute)



// error handling
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


app.listen(port, () => {
    console.log(`Server running on Port ${port}`);
});
