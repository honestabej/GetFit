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

/***** API Helper functions *****/
// Check for an existing user
async function checkExistingUser(req, res) {
  // Check for existing email
  let user = await new Promise((resolve, reject) => {
    client.query(`SELECT userid FROM Users WHERE email = '${req.body.email}';`, (err, response) => {
      if (err) {
        logging(res, '', "Error @: Checking for duplicate email -> "+err.message, false)
        resolve("error")
      } else {
        resolve(response.rows[0])
      }
    })
    client.end
  })

  if (user !== undefined)
    return {doesExist: true, message: 'User with that email already exists', userid: user}

  // Check for existing username
  user = await new Promise((resolve, reject) => {
    client.query(`SELECT userid FROM Users WHERE username = '${req.body.username}';`, (err, response) => {
      if (err) {
        logging(res, '', "Error @: Checking for duplicate username -> "+err.message, false)
        resolve("error")
      } else {
        resolve(response.rows[0])
      }
    })
    client.end
  })

  if (user !== undefined)
    return {doesExist: true, message: 'User with that username already exists', userid: user}

  return {doesExist: false}
}

/***** API Endpoints *****/
/*** Session Endpoints ***/
// Get session status
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

// Destroy session 
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
app.post('/user/create', async (req, res) => {  
  const userid = uuid()
  const goalid = uuid()
  const date = await getCurrentDate()
  const hashedPwd = await bcrypt.hash(req.body.password, 10)
  const defaultPicture = 'https://firebasestorage.googleapis.com/v0/b/getfit-5d057.appspot.com/o/profilePictures%2FDefault_Profile.jpg?alt=media&token=0e951429-ea98-4c8e-b4aa-ad69245c4324'
  const existCheck = await checkExistingUser(req, res)
  
  // Check for existing user
  if (!existCheck.doesExist) {
    client.query('BEGIN', (err, response) => {
      if(err) return rollback(client, res, {loggedIn: false, error: "Error creating user, please try again later", errNum: 1, errMsg: "Error @: Beginning user creation -> "+err.message}) // err1
      client.query(`INSERT INTO Users (userID, username, email, password, name, age, profilePicture) VALUES ('${userid}', '${req.body.username}', '${req.body.email}', '${hashedPwd}', '${req.body.name}', ${req.body.age}, '${defaultPicture}');`, (err, response) => {
        if(err) return rollback(client, res, {loggedIn: false, error: "Error creating user, please try again later", errNum: 2, errMsg: "Error @: Inserting new user info -> "+err.message}) // err2
        client.query(`INSERT INTO Goals (userID, goalID, goal, weight, goalDate, weightDate) VALUES ('${userid}', '${goalid}', 0, 0, '${date}', '${date}');`, async (err, response) => {
          if(!err) { 
            client.query('COMMIT')
            req.session.user = userid
            logging(res, {loggedIn: true, user: req.session.user }, 'Successfully created user '+userid, true) // good1
          } else {
            rollback(client, res, {loggedIn: false, error: "Error creating user, please try again later", errNum: 3, errMsg: "Error @: Inserting new goal info -> "+err.message})  // err3
          }
        })
      })
    })
    client.end
  } else {
    logging(res, {loggedIn: false, error: existCheck.message}, existCheck.message, true)
  }
})

// User login
app.post('/user/login', async (req, res) => {
  client.query(`SELECT userid, password FROM Users WHERE email = '${req.body.emailUsername}' OR username = '${req.body.emailUsername}';`, async (err, response) => {
    if (!err) {
      // Verify a user was found with given email/username
      if (response.rows[0] !== undefined){
        // Verify the given password and retrieved password match
        if (await bcrypt.compare(req.body.password, JSON.parse(JSON.stringify(response.rows[0])).password)) {
          req.session.user = response.rows[0].userid
          logging(res, {loggedIn: true, user: req.session.user }, 'Login successful', true)
        } else {
          logging(res, '', "Incorrect Email/Username and Password", true)
        }
      } else {
        logging(res, '', "Incorrect Email/Username and Password", true)
      }
    } else {
      logging(res, '', 'Error @ getting user for login ->'+err.message, false)
    }
  })
  client.end
})

// Edit User info (not password)
app.put('/user/edit', (req, res) => {
  client.query(`UPDATE Users SET name = '${req.body.name}', age = ${req.body.age}, email = '${req.body.email}', profilePicture = '${req.body.profilePicture}' WHERE userID = '${req.body.userID}';`, async (err, response) => {
    if (!err) {
      logging(res, '', "Successfully updated User info", true)
    } else {
      logging(res, '', "Error @: Updating user info -> "+err.message, false)
    }
  })
  client.end
})

// Edit User's password
app.put('/user/edit-password', async (req, res) => {
  const hashedPwd = await bcrypt.hash(req.body.password, 10)

  client.query(`UPDATE Users SET password = '${hashedPwd}' WHERE userID = '${req.body.userID}';`, async (err, response) => {
    if(!err) {
      logging(res, '', "Successfully updated User password", true)
    } else {
      logging(res, '', "Error @: Updating user's password -> "+err.message, false)
    }
  }) 
  client.end
})

// Get User info (w/o password)
app.get('/user/get', (req, res) => {
  client.query(`SELECT userID, email, age, name, profilePicture FROM Users WHERE userID = '${req.query.userID}';`, async (err, response) => {
    if (!err) {
      logging(res, response.rows, 'User '+req.query.userID+' info retrieved successfully', true)
    } else {
      logging(res, "Error @: Getting user's info -> "+err.message, false)
    }
  })
  client.end
})

/*** Goals Endpoints ***/
// Update User's Weight info
app.put('/goal/update-weight', async (req, res) => {
  let goalid = uuid()
  let date = await getCurrentDate()

  client.query(`INSERT INTO Goals (userID, goalID, weight, weightDate) VALUES ('${req.body.userID}', '${goalid}', ${req.body.weight}, '${date}');`, async (err, response) => {
    if (!err) {
      logging(res, '', "Successfully inserted new User weight", true)
    } else {
      logging(res, '', "Error @: Inserting new user weight -> "+err.message, false)
    }
  })
})

// Update User's Goal info
app.put('/goal/update-goal', async (req, res) => {
  let goalid = uuid()
  let date = await getCurrentDate()

  client.query(`INSERT INTO Goals (userID, goalID, goal, goalDate) VALUES ('${req.body.userID}', '${goalid}', ${req.body.goal}, '${date}');`, async (err, response) => {
    if (!err) {
      logging(res, '', "Successfully inserted new User goal", true)
    } else {
      logging(res, '', "Error @: Inserting new user goal -> "+err.message, false)
    }
  })
})

// Get User weight
app.get('/goal/get-weight', (req, res) => {
  client.query(`SELECT weight, weightDate FROM Goals WHERE userID = '${req.query.userid}' AND weight IS NOT NULL ORDER BY weightDate DESC LIMIT 1;`, async (err, response) => {
    if (!err) {
      if(response.rows[0] !== undefined) {
        logging(res, response.rows, 'User '+req.query.userid+' weight retrieved successfully', true)
      } else {
        logging(res, '', "Weight Not Retrieved", true)
      }
    } else {
      logging(res, '', "Error @: Getting user's current weight -> "+err.message, false)
    }
  })
  client.end
})

// Get User goal
app.get('/goal/get-goal', (req, res) => {
  client.query(`SELECT goal, goalDate FROM Goals WHERE userID = '${req.query.userid}' AND goal IS NOT NULL ORDER BY goalDate DESC LIMIT 1;`, async (err, response) => {
    if (!err) {
      if(response.rows[0] !== undefined) {
        logging(res, response.rows, 'User '+req.query.userID+' goal retrieved successfully', true)
      } else {
        logging(res, '', "Goal Not Retrieved", true)
      }
    } else {
      logging(res, '', "Error @: Getting user's current goal -> "+err.message, false)
    }
  })
  client.end
})

/*** Exercises Endpoints ***/
// Create an Exercise
app.post('/exercise/create', async (req, res) => {
  const exerciseid = uuid()
  const typeid = uuid()
  const date = await getCurrentDate()

  client.query('BEGIN', (err, result) => {
    if(err) return rollback(client, res, "Error @: Beginning exercise creation -> "+err.message)
    client.query(`INSERT INTO Exercises (userid, exerciseid, name, picture, categories, type, createdDate) VALUES ('${req.body.userid}', '${exerciseid}', '${req.body.name}', '${req.body.picture}', '${req.body.categories}', '${req.body.type}', '${date}');`, (err, response) => {
      if(err) return rollback(client, res, "Error @: Inserting new exercise info -> "+err.message)
      if (req.body.type === "Weightlifting") {
        client.query(`INSERT INTO Weightlifting (exerciseid, weightliftingid, difficulty, completedDate) VALUES ('${exerciseid}', '${typeid}', ${null}, '${date}');`, (err, response) => {
          if(!err) { 
            logging(res, '', "Exercise created successfully", true)
            client.query('COMMIT')
          } else {
            return rollback(client, res, "Error @: Inserting new Weightlifting info -> "+err.message) 
          }
        })
      } else if (req.body.type === "Cardio") {
        client.query(`INSERT INTO Cardio (exerciseid, cardioid, time, distance, completedDate) VALUES ('${req.body.exerciseid}', '${typeid}', '${null}', ${null}, '${date}');`, (err, response) => {
          if(!err) { 
            logging(res, '', "Exercise created successfully", true)
            client.query('COMMIT')
          } else {
            return rollback(client, res, "Error @: Inserting new Cardio info -> "+err.message) 
          }
        })
      } else if (req.body.type === "Other") {
        client.query(`INSERT INTO Other (exerciseid, otherid, notes, completedDate) VALUES ('${req.body.exerciseid}', '${typeid}', '${null}', '${date}');`, (err, response) => {
          if(!err) { 
            logging(res, '', "Exercise created successfully", true)
            client.query('COMMIT')
          } else {
            return rollback(client, res, "Error @: Inserting new Other info -> "+err.message) 
          }
        })
      } else {
        return rollback(client, res, "Error @: Evaluating exercise type -> "+err.message) 
      } 
    })
  })
  client.end
})

// Edit an Exercise
app.put('/exercise/edit', (req, res) => {
  client.query(`UPDATE Exercises SET name = '${req.body.name}', picture = '${req.body.picture}', categories = '${req.body.categories}' WHERE exerciseID = '${req.body.exerciseid}';`, async (err, response) => {
    if (!err) {
      logging(res, '', "Exercise info updated ", true)
    } else {
      logging(res, '', "Error @: Updating exercise info -> "+err.message, false)
    }
  })
  client.end
})

// Delete an Exercise
app.delete('/exercise/delete', (req, res) => {
  client.query(`DELETE FROM Exercises WHERE exerciseid = '${req.body.exerciseid}';`, async (err, response) => {
    if (!err) {
      logging(res, '', "Exercise deleted successfully ", true)
    } else {
      logging(res, '', "Error @: Deleting exercise -> "+err.message, false)
    }
  })
  client.end
})

// Get all Exercises of a User
app.get('/exercise/get-all', async (req, res) => {
  let exercisesObj = []

  client.query('BEGIN', (err, response) => {
    if(err) return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 1, errMsg: "Error @: Beginning get exercises -> "+err.message}) // err1
    // Query Weightlifting Exercises
    client.query(`WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises 
      WHERE userid = '${req.query.userid}') AS Temp1 JOIN Weightlifting USING(exerciseid)) AS Temp2) SELECT * FROM RecentHistory WHERE RowNum = 1;`, (err, response) => {
      if(err) {
        return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Weightlifting Exercises -> "+err.message}) // err2
      } else {
        for (let i = 0; i < response.rows.length; i++) {
          exercisesObj.push(response.rows[i])
        }
      }
      // Query Cardio Exercises
      client.query(`WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises 
        WHERE userid = '${req.query.userid}') AS Temp1 JOIN Cardio USING(exerciseid)) AS Temp2) SELECT * FROM RecentHistory WHERE RowNum = 1;`, (err, response) => {
        if(err) {
          return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Cardio Exercises -> "+err.message}) // err2
        } else {
          for (let i = 0; i < response.rows.length; i++) {
            exercisesObj.push(response.rows[i])
          }
        }
        // Query Other Exercises
        client.query(`WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises 
          WHERE userid = '${req.query.userid}') AS Temp1 JOIN Other USING(exerciseid)) AS Temp2) SELECT * FROM RecentHistory WHERE RowNum = 1;`, (err, response) => {
          if(err) {
            return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Other Exercises -> "+err.message}) // err2
          } else {
            for (let i = 0; i < response.rows.length; i++) {
              exercisesObj.push(response.rows[i])
            }
            client.query('COMMIT')
            logging(res, exercisesObj, 'User '+req.query.userID+' exercises retrieved successfully', true)
          }
        })
      }) 
    })
  })
  client.end
})

// Get all Exercises of a category of a User
app.get('/exercise/get-category', (req, res) => {
  let exercisesObj = []

  client.query('BEGIN', (err, response) => {
    if(err) return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 1, errMsg: "Error @: Beginning get exercises -> "+err.message}) // err1
    // Query Weightlifting Exercises
    client.query(`WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises 
      WHERE userid = '${req.query.userid}' AND '${req.query.category}' = ANY(categories)) AS Temp1 JOIN Weightlifting USING(exerciseid)) AS Temp2) SELECT * FROM RecentHistory WHERE RowNum = 1;`, (err, response) => {
      if(err) {
        return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Weightlifting Exercises -> "+err.message}) // err2
      } else {
        for (let i = 0; i < response.rows.length; i++) {
          exercisesObj.push(response.rows[i])
        }
      }
      // Query Cardio Exercises
      client.query(`WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises 
        WHERE userid = '${req.query.userid}' AND '${req.query.category}' = ANY(categories)) AS Temp1 JOIN Cardio USING(exerciseid)) AS Temp2) SELECT * FROM RecentHistory WHERE RowNum = 1;`, (err, response) => {
        if(err) {
          return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Cardio Exercises -> "+err.message}) // err2
        } else {
          for (let i = 0; i < response.rows.length; i++) {
            exercisesObj.push(response.rows[i])
          }
        }
        // Query Other Exercises
        client.query(`WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises 
          WHERE userid = '${req.query.userid}' AND '${req.query.category}' = ANY(categories)) AS Temp1 JOIN Other USING(exerciseid)) AS Temp2) SELECT * FROM RecentHistory WHERE RowNum = 1;`, (err, response) => {
          if(err) {
            return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Other Exercises -> "+err.message}) // err2
          } else {
            for (let i = 0; i < response.rows.length; i++) {
              exercisesObj.push(response.rows[i])
            }
            client.query('COMMIT')
            logging(res, exercisesObj, 'User '+req.query.userID+' exercises retrieved successfully', true)
          }
        })
      }) 
    })
  })
  client.end
})

/*** Weightlifting Exercise Endpoints ***/
// Create a completion of a Weightlifting Exercise
app.post('/weightlifting/create', async (req, res) => {
  const weightliftingid = uuid() 
  const date = await getCurrentDate()
  let values = ``

  for (let i = 0; i < req.body.sets.length; i++) {
    values += `('${weightliftingid}', '${uuid()}', ${req.body.sets[i].weight}, ${req.body.sets[i].reps})`
    if (i !== (req.body.sets.length - 1))
      values += `, `
  }

  client.query('BEGIN', (err, response) => {
    if(err) return rollback(client, res, {loggedIn: false, error: "Error creating Weightlifting entry, please try again later", errNum: 1, errMsg: "Error @: Beginning create Weightlifting -> "+err.message}) // err1
    client.query(`INSERT INTO Weightlifting (exerciseid, weightliftingid, difficulty, completedDate) VALUES ('${req.body.exerciseid}', '${weightliftingid}', ${req.body.difficulty}, '${date}');`, (err, response) => {
      if(err) return rollback(client, res, {loggedIn: false, error: "Error creating Weightlifting entry, please try again later", errNum: 2, errMsg: "Error @: Inserting  Weightlifting -> "+err.message}) // err2
      client.query(`INSERT INTO Sets (weightliftingid, setid, weight, reps) VALUES ${values};`, (err, response) => {
        if(err) return rollback(client, res, {loggedIn: false, error: "Error creating Weightlifting entry, please try again later", errNum: 3, errMsg: "Error @: Inserting Sets -> "+err.message}) // err3
        logging(res, '', "Exercise created successfully", true)
        client.query('COMMIT')
      })
    })
  })
  client.end
})

// Delete a completion of a Weightlifting Exercise
app.delete('/weightlifting/delete', (req, res) => {
  client.query(`DELETE FROM Weightlifting WHERE weightliftingid = '${req.query.weightliftingid}';`, async (err, result) => {
    if (!err) {
      logging(res, '', "Weightlifting completion deleted successfully", true)
    } else {
      logging(res, '', "Error @: Deleting Weightlifting completion -> "+err.message, false)
    }
  })
  client.end
})

/*** Sets Endpoints ***/
// Edit a Set completion of a Weightlifting Exercise
app.put('/set/edit', (req, res) => {
  client.query(`UPDATE Sets SET weight = '${req.body.weight}', reps = '${req.body.reps}' WHERE setid = '${req.body.setid}';`, (err, response) => {
    if (!err) {
      logging(res, '', "Set editied successfully", true)
    } else {
      logging(res, '', "Error @: Editing Set -> "+err.message, false)
    }
  })
  client.end
})

// Delete a set completion of a Weightlifting Exercise
app.delete('/set/delete', (req, res) => {
  client.query(`DELETE FROM Sets WHERE setid = '${req.body.setid}';`, (err, response) => {
    if (!err) {
      logging(res, '', "Set deleted successfully", true)
    } else {
      logging(res, '', "Error @: Deleting Set -> "+err.message, false)
    }
  })
  client.end
})

// Get all sets of a Weightlifting completion
app.get('/set/get-all', (req, res) => {
  client.query(`SELECT setid, weight, reps FROM Sets WHERE weightliftingid = '${req.query.weightliftingid}';`, (err, response) => {
    if (!err) {
      logging(res, response.rows, 'Weightlifting '+req.query.weightliftingid+' Sets retrieved successfully', true)
    } else {
      logging(res, '', "Error @: Getting all Weightlifting Sets -> "+err.message , false)
    }
  })
  client.end
})

/*** Cardio Exercise Endpoints ***/
// Create a completion of a Cardio Exercise
app.post('/cardio/create', async (req, res) => {
  const cardioid = uuid()
  const date = await getCurrentDate()

  client.query(`INSERT INTO Cardio (exerciseid, cardioid, time, distance, completedDate) VALUES ('${req.body.exerciseid}', '${cardioid}', '${req.body.time}', ${req.body.distance}, '${date}');`, (err, response) => {
    if (!err) {
      logging(res, '', "Cardio completion inserted successfully", true)
    } else {
      logging(res, '', "Error @: Inserting Cardio completion -> "+err.message, false)
    }
  })
  client.end
})

// Edit a completion of a Cardio Exercise
app.put('/cardio/edit', (req, res) => {
  client.query(`UPDATE Cardio SET time = '${req.body.time}', distance = '${req.body.distance}' WHERE cardioid = '${req.body.cardioid}';`, (err, response) => {
    if (!err) {
      logging(res, '', "Cardio completion edited successfully", true)
    } else {
      logging(res, '', "Error @: Editing Cardio completion -> "+err.message, false)
    }
  })
  client.end
})

// Delete a completion of a Cardio Exercise
app.delete('/cardio/delete', (req, res) => {
  client.query(`DELETE FROM Cardio WHERE cardioid = '${req.body.cardioid}';`, (err, response) => {
    if (!err) {
      logging(res, '', "Cardio completion deleted successfully", true)
    } else {
      logging(res, '', "Error @: Deleting Cardio completion -> "+err.message, false)
    }
  })
  client.end
})

/*** Other Exercise Endpoints ***/
// Create a completion of an Other Exercise
app.post('/other/create', async (req, res) => {
  const otherid = uuid()
  const date = await getCurrentDate()

  client.query(`INSERT INTO Other (exerciseid, otherid, notes, completedDate) VALUES ('${req.body.exerciseid}', '${otherid}', '${req.body.notes}', '${date}');`, (err, response) => {
    if (!err) {
      logging(res, '', "Other completion inserted successfully", true)
    } else {
      logging(res, '', "Error @: Inserting Other completion -> "+err.message, false)
    }
  })
  client.end
})

// Edit a completion of an Other Exercise
app.put('/other/edit', (req, res) => {
  client.query(`UPDATE Other SET notes = '${req.body.notes}' WHERE otherid = '${req.body.otherid}';`, (err, response) => {
    if (!err) {
      logging(res, '', "Cardio completion edited successfully", true)
    } else {
      logging(res, '', "Error @: Editing Cardio completion -> "+err.message, false)
    }
  })
  client.end
})

// Delete a completion of an Other Exercise
app.delete('/other/delete', (req, res) => {
  client.query(`DELETE FROM Other WHERE otherid = '${req.body.cardioid}';`, (err, response) => {
    if (!err) {
      logging(res, '', "Other completion deleted successfully", true)
    } else {
      logging(res, '', "Error @: Deleting Other completion -> "+err.message, false)
    }
  })
  client.end
})

/*** Workout Endpoints ***/
// Create a Workout
app.post('/workout/create', (req, res) => {
  let workoutid = uuid()

  client.query(`INSERT INTO Workouts (userid, workoutid, name) VALUES ('${req.body.userid}', '${workoutid}', '${req.body.name}');`, async (err, response) => {
    if (!err) {
      logging(res, '', "Workout created successfully", true)
    } else {
      logging(res, '', "Error @: Inserting new Workout info -> "+err.message, false)
    }
  })
  client.end
})

// Edit a Workout
app.put('/workout/edit', (req, res) => {
  client.query(`UPDATE Workouts SET name = '${req.body.name}' WHERE workoutid = '${req.body.workoutid}';`, async (err, response) => {
    if (!err) {
      logging(res, '', "Workout edited successfully", true)
    } else {
      logging(res, '', "Error @: Editing Workout -> "+err.message, false)
    }
  })
  client.end
})

// Delete a Workout
app.delete('/workout/delete', (req, res) => {
  client.query(`DELETE FROM Workouts WHERE workoutid = '${req.query.workoutid}';`, async (err, response) => {
    if (!err) {
      logging(res, '', "Workout deleted successfully", true)
    } else {
      logging(res, '', "Error @: Deleting Workout -> "+err.message, false)
    }
  })
  client.end
})

// Get all Workouts of a User
app.get('/workout/get-all', (req, res) => {
  client.query(`SELECT * FROM Workouts WHERE userid = '${req.query.userid}';`, async (err, response) => {
    if (!err) {
      logging(res, response.rows, 'User '+req.query.userid+' Workouts retrieved successfully', true)
    } else {
      logging(res, '', "Error @: Getting all user Workouts -> "+err.message , false)
    }
  })
  client.end
})

/*** Contains Endpoints ***/
// Add an Exercise to a Workout
app.post('/contains/add', (req, res) => {
  client.query(`INSERT INTO Contains (workoutid, exerciseid) VALUES ('${req.body.workoutid}', '${req.body.exerciseid}');`, async (err, response) => {
    if (!err) {
      logging(res, '', "Exercise added to Workout successfully", true)
    } else {
      logging(res, '', "Error @: Adding Exercise to Workout -> "+err.message, false)
    }
  })
  client.end
})

// Delete an Exercise from a Workout
app.delete('/contains/delete', (req, res) => {
  client.query(`DELETE FROM Contains WHERE workoutid = '${req.query.workoutid}' AND exerciseid = '${req.query.exerciseid}';`, async (err, response) => {
    if (!err) {
      logging(res, '', "Exercise deleted from Workout successfully", true)
    } else {
      logging(res, '', "Error @: Deleting Exercise from Workout -> "+err.message, false)
    }
  })
  client.end
})

// Get all Exercises of a Workout
app.get('/contains/get-all', (req, res) => {
  let exercisesObj = []

  client.query('BEGIN', (err, response) => {
    if(err) return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 1, errMsg: "Error @: Beginning get exercises -> "+err.message}) // err1
    // Query Weightlifting Exercises
    client.query(`SELECT * FROM (SELECT exerciseid FROM Contains WHERE workoutid = '${req.query.workoutid}') AS Temp1 JOIN (SELECT * FROM (WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By 
      completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises WHERE userid = '${req.query.userid}') AS Temp2 JOIN Weightlifting USING(exerciseid)) AS Temp3) SELECT * FROM RecentHistory WHERE RowNum = 1) 
      AS Temp4 JOIN Sets Using(weightliftingid)) AS Temp5 USING(exerciseid);`, (err, response) => {
      if(err) {
        return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Weightlifting Exercises -> "+err.message}) // err2
      } else {
        for (let i = 0; i < response.rows.length; i++) {
          exercisesObj.push(response.rows[i])
        }
      }
      // Query Cardio Exercises
      client.query(`SELECT * FROM (SELECT exerciseid FROM Contains WHERE workoutid = '${req.query.workoutid}') AS Temp1 JOIN (WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By 
        completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises WHERE userid = '${req.query.userid}') AS Temp2 JOIN Cardio USING(exerciseid)) AS Temp3) SELECT * FROM RecentHistory WHERE RowNum = 1)
        AS Temp4 USING(exerciseid);`, (err, response) => {
        if(err) {
          return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Cardio Exercises -> "+err.message}) // err2
        } else {
          for (let i = 0; i < response.rows.length; i++) {
            exercisesObj.push(response.rows[i])
          }
        }
        // Query Other Exercises
        client.query(`SELECT * FROM (SELECT exerciseid FROM Contains WHERE workoutid = '${req.query.workoutid}') AS Temp1 JOIN (WITH RecentHistory AS (Select *, Row_Number() Over (Partition By exerciseid Order By 
          completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises WHERE userid = '${req.query.userid}') AS Temp2 JOIN Other USING(exerciseid)) AS Temp3) SELECT * FROM RecentHistory WHERE RowNum = 1) 
          AS Temp4 USING(exerciseid);`, (err, response) => {
          if(err) {
            return rollback(client, res, {loggedIn: false, error: "Error getting exercises, please try again later", errNum: 2, errMsg: "Error @: Getting Other Exercises -> "+err.message}) // err2
          } else {
            for (let i = 0; i < response.rows.length; i++) {
              exercisesObj.push(response.rows[i])
            }
            client.query('COMMIT')
            logging(res, exercisesObj, 'User '+req.query.userID+' exercises retrieved successfully', true)
          }
        })
      }) 
    })
  })
  client.end
})