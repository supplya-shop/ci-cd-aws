const express = require('express')
const router = express.Router()

//user routes
router.get('/', (req, res, next) => {
    res.send('listing all users...')
})

router.post('/', (req, res, next) => {
    res.send('creating a user')
})

router.get('/:id', (req, res, next) => {
    res.send('getting a single user')
})

router.patch('/:id', (req, res, next) => {
    res.send('updating user')
})

router.delete('/:id', (req, res, next) => {
    res.send('deleting user')
})

module.exports = router