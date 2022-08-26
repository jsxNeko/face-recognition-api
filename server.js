const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dotenv = require('dotenv');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

dotenv.config();
const db = require('knex')({
  client: 'pg',
  version: '7.2',
  connection: {
    host : process.env.HOST,
    port : process.env.PORT,
    user : 'postgres',
    password : process.env.DBSECRET,
    database : 'smart-brain'
  }
});
const app = express();

app.use(cors());
app.use(express.json());

// signin - POST
app.post('/signin', (req,res) => {signin.handleSignin(req, res, db, bcrypt)})

// register - POST users info to database
app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)})

// edit profile - update profile
app.post('/profile/:id', (req,res) => {profile.handleUpdate(req, res, db, bcrypt)})

// delete - delete account permanently
app.delete('/profile/:id', (req,res) => {profile.handleDeleteAccount(req, res, db, bcrypt)})

// image upload - PUT update profile with object
app.put('/image', (req,res) => {image.handleEntries(req, res, db)})

app.post('/imageurl', (req,res) => {image.handleApiCall(req, res, process.env.CLARIFAIAPI)})

app.get('/', (req,res) => {
	db('users').returning('name')
	.then(user => res.json(user))
})


app.listen(3000, () => {
	console.log('Server listening...')
})
