const express = require('express');
const mailRouter = express.Router();
const mailController = require('../controllers/mail.controller');

mailRouter.post('/send', mailController.sendMail)


module.exports = mailRouter;