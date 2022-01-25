require('dotenv').config();
const { Router, response } = require('express');
const User = require('../models/User');
const Token = require('../models/Token');
const router = Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');


router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.find({ email: email, password: password });
        console.log(user[0].isVerified);
        if (user.length == 0) {
            res.status(400).send("No user exists or Incorrect email/password");
        } else {
            if (user[0].isVerified == false) {
                res.json("You email is not verified yet, Kindly Verify you email via the link sent to your email");
            }

            res.redirect('/dashboard');
        }

    } catch (err) {
        console.log(err.message);
    }
});

router.get('/dashboard', async(req, res) => {
    res.json("you are logged in");
})



router.post('/register', async(req, res) => {
    const { name, email, password } = req.body;
    try {
        const response = await User.find({ email: email });
        console.log(response);

        if (response.length == 0) {
            const user = new User({
                name: name,
                email: email,
                password: password
            });
            user.save(function(err) {
                if (err) {
                    return res.status(500).send({ msg: err.message });
                }

                // generate token and save
                var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                token.save(function(err) {
                    if (err) {
                        return res.status(500).send({ msg: err.message });
                    }

                    // Send email (use verified sender's email address & generated API_KEY on SendGrid)
                    const transporter = nodemailer.createTransport(
                        sendgridTransport({
                            auth: {
                                api_key: process.env.SENDGRID_APIKEY,
                            }
                        })
                    )
                    var mailOptions = { from: 'tejaswarambhe@gmail.com', to: user.email, subject: 'Account Verification Link', text: 'Hello ' + req.body.name + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n' };
                    transporter.sendMail(mailOptions, function(err) {
                        if (err) {
                            return res.status(500).send({ msg: 'Technical Issue!, Please click on resend for verify your Email.' });
                        }
                        return res.status(200).send('A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.');
                    });
                });
            });
        } else {
            res.status(400).send("User already exists");
        }


    } catch (err) {
        console.log(err.message);
    }
});

router.get('/confirmation/:email/:token', async(req, res) => {

    // const { email, token } = req.params;
    try {
        const token = await Token.findOne({ token: req.params.token });

        if (token) {
            // res.json(token);
            const user = await User.findOne({ email: req.params.email });
            user.isVerified = true;
            const response = await user.save();
            res.json(response);
        } else {
            res.json("Token Expired");
        }





    } catch (err) {
        console.log(err.message);
    }
});

router.get('/forget/:email', async(req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ email: email });
        const transporter = nodemailer.createTransport(
            sendgridTransport({
                auth: {
                    api_key: process.env.SENDGRID_APIKEY,
                }
            })
        )
        var mailOptions = { from: 'tejaswarambhe@gmail.com', to: user.email, subject: 'Your Password', text: 'Hello ' + user.name + ',\n\n' + 'Your password is: ' + user.password };
        transporter.sendMail(mailOptions, function(err) {
            if (err) {
                return res.status(500).send({ msg: 'Technical Issue!, Please click on resend for verify your Email.' });
            }
            return res.status(200).send('A email has been sent to ' + user.email + 'with your password');
        });
    } catch (err) {
        console.log(err.message);
    }
})






module.exports = router;