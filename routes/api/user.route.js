const express = require('express');
const router = express.Router();
const userController = require('../../controllers/user.controller');
const auth = require('../../auth');

router.get('/', (req, res, next) => {
    res.send('Welcome to the API/user.routes');
  });
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', auth, userController.profile);
router.post('/userByMail', userController.userByMail);
router.put('/update', auth, userController.update);
router.delete('/delete', auth, userController.delete);
module.exports = router;