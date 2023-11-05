const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../model/User.model');

router.use(express.json());

router.post('/register', async (req, res) => {
    const { firstname, lastname, email, phoneNumber, password, dateofBirth, gender, address, role } = req.body;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            firstname,
            lastname,
            email,
            phoneNumber,
            password: hashedPassword,
            dateofBirth,
            gender,
            address,
            role
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to register user' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const foundUser = await User.findOne({ email });
    if (!foundUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = bcrypt.compare(password, foundUser.password);
    if (!validPassword) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ email: foundUser.email }, 'your_secret_key');
    res.status(200).json({ token });
});

// Protected route
router.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route' });
});

// Middleware for authenticating JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, 'my$ecretK3yy', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = router;
