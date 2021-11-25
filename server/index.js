'use strict';
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config/default.json');
const cors = require('cors');
const port = 5000;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true
};

app.use(cors());

mongoose.connect(config.mongoURI, options);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'DB connection error:'));
db.once('open', () => console.log('DB connection successful'));

const User = require('./models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10; // 何回ハッシュ化を行うのか設定を行う

// /api/users にGETリクエストが送られた際の動作
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.log(err);
  }
});

// POSTリクエストはJSONで送信するため下記を設定
app.use(express.json());

// /api/auth/register にPOSTリクエストが送られた際の動作
app.post('/api/auth/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = await new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    res.json(savedUser);
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

/**
 * /api/auth/loginにアクセス
 * emailを検索し一致しなければ「user not found」を返す
 * passwordを検索し一致しなければ「password not correct」を返す
 * どちらも一致した場合はuser情報を返す
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'user not found' });

    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) return res.json({ message: 'password not correct' });

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email
    };
    const token = jwt.sign(payload, 'secret');

    res.json({ token });
  } catch (err) {
    console.log(err);
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    const bearToken = await req.headers['authorization'];
    const bearer = await bearToken.split(' ');
    const token = bearer[1];

    const user = await jwt.verify(token, 'secret');
    res.json({ user });
  } catch (err) {
    res.sendStatus(403);
  }
});
