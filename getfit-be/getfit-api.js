/***** Import necessary libraries and etc *****/
require('dotenv').config()
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const { v4: uuid } = require('uuid')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const {Client} = require('pg')
const { response } = require('express')

/***** Connect to the server *****/
const PORT = process.env.PORT || 3001
const client = new Client({
  host: "localhost",
  port: 5432,
  database: "getfit",
  user: "abejohnson"
})
client.connect()
app.listen(3001)

/***** Settings for the server *****/
app.use(express.json())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], 
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true
}))
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  key: 'userid',
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 6.048e+8
  }
}))
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  res.setHeader('Access-Control-Allow-Credentials', true);
  next()
})

/***** Common functions *****/
// Rollback queries being made in succession upon a failure
var rollback = function(client, res, message) {
  client.query('ROLLBACK', function() {
    logging(res, '', message, false)
    client.end
  })
}

// Return the current date in the proper DB format
async function getCurrentDate() {
  let currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()
  const hour = currentDate.getHours()
  const minute = currentDate.getMinutes()
  const second = currentDate.getSeconds()
  return year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second
}

// Log response/failure messages and send data on success
function logging(res, send, msg, success) {
  if (success) {
    res.status(200).send(send)
  } else {
    res.send(msg)
  } 
  console.log(msg)
}

/***** API Endpoints *****/
/*** Session Endpoints ***/
// Get login status
app.get('/session/login', (req, res) => {
  if (req.session.user) {
    res.send({
      loggedIn: true,
      user: req.session.user
    })
  } else {
    res.send({
      loggedIn: false
    })
  }
})

// User logout
app.get('/session/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err)
    }
    res.clearCookie('userid')
    res.send("logged out")
    console.log("logged out")
  });
})

/*** User Endpoints ***/
// Create User
app.post('/user/create', (req, res) => {

})

// Edit User info (not password)
app.put('/user/edit', (req, res) => {

})

// Edit User's password
app.put('/user/edit-password', (req, res) => {

})

// Get User info (w/o password)
app.put('/user/get', (req, res) => {

})

// Get User id and password for login
app.put('/user/get-password', (req, res) => {

})

/*** Goals Endpoints ***/
// Update User's Goals info
app.put('/goal/update', (req, res) => {

})

// Get User weight
app.put('/goal/get-weight', (req, res) => {

})

// Get User goal
app.put('/goal/get-goal', (req, res) => {

})

/*** Exercises Endpoints ***/
// Create an Exercise
app.post('/exercise/create', (req, res) => {

})

// Edit an Exercise
app.put('/exercise/edit', (req, res) => {

})

// Delete an Exercise
app.delete('/exercise/delete', (req, res) => {

})

// Get all Exercises of a User
app.put('/exercise/get-all', (req, res) => {

})

// Get all Exercises of a category of a User
app.put('/exercise/get-category', (req, res) => {

})

/*** Weightlifting Exercise Endpoints ***/
// Create a completion of a Weightlifting Exercise
app.post('/weightlifting/create', (req, res) => {

})

// Delete a completion of a Weightlifting Exercise
app.delete('/weightlifting/delete', (req, res) => {

})

/*** Sets Endpoints ***/
// Edit a Set completion of a Weightlifting Exercise
app.put('/set/edit', (req, res) => {

})

// Delete a set completion of a Weightlifting Exercise
app.delete('/set/delete', (req, res) => {

})

/*** Cardio Exercise Endpoints ***/
// Create a completion of a Cardio Exercise
app.post('/cardio/create', (req, res) => {

})

// Edit a completion of a Cardio Exercise
app.put('/cardio/edit', (req, res) => {

})

// Delete a completion of a Cardio Exercise
app.delete('/cardio/delete', (req, res) => {

})

/*** Other Exercise Endpoints ***/
// Create a completion of an Other Exercise
app.post('/other/create', (req, res) => {

})

// Edit a completion of an Other Exercise
app.put('/other/edit', (req, res) => {

})

// Delete a completion of an Other Exercise
app.delete('/other/delete', (req, res) => {

})

/*** Workout Endpoints ***/
// Create a Workout
app.post('/workout/create', (req, res) => {

})

// Edit a Workout
app.put('/workout/edit', (req, res) => {

})

// Delete a Workout
app.delete('/workout/delete', (req, res) => {

})

// Get all Workouts of a User
app.put('/workout/get-all', (req, res) => {

})

/*** Contains Endpoints ***/
// Add an Exercise to a Workout
app.post('/contains/add', (req, res) => {

})

// Delete an Exercise from a Workout
app.delete('/contains/delete', (req, res) => {

})

// Get all Exercises of a Workout
app.put('/contains/get-all', (req, res) => {

})