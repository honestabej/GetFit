require('dotenv').config()
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const { v4: uuid } = require('uuid')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const PORT = process.env.PORT || 3001
const {Client} = require('pg')
const { response } = require('express')
const client = new Client({
  host: "localhost",
  port: 5432,
  database: "getfit",
  user: "abejohnson"
})
client.connect()
app.listen(3001)

// Settings for server
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

// Function used for logging responses or failure messages
function logging(res, send, msg, success) {
  if (success) {
    res.status(200).send(send)
  } else {
    res.send(msg)
  } 
  console.log(msg)
}

// Function for rollbacks
var rollback = function(client, res, message) {
  client.query('ROLLBACK', function() {
    logging(res, '', message, false)
    client.end
  })
}

// Function to get the currentDate
async function getCurrentDate() {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()
  const hour = currentDate.getHours()
  const minute = currentDate.getMinutes()
  const second = currentDate.getSeconds()
  const date = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second
  return date
}

// Create User
app.post('/users/create', async (req, res) => {
  let user = req.body 
  let userID = uuid()
  let goalID = uuid()
  let currentDate = await getCurrentDate()
  const hashedPwd = await bcrypt.hash(user.password, 10)
  let isDuplicateEmail = await checkDuplicateEmail(req, res)
  let isDuplicateUsername = await checkDuplicateUsername(req, res)
  let profilePicture = 'https://firebasestorage.googleapis.com/v0/b/getfit-5d057.appspot.com/o/profilePictures%2FDefault_Profile.jpg?alt=media&token=0e951429-ea98-4c8e-b4aa-ad69245c4324'

  // Check for a duplicate email/username
  if (!isDuplicateEmail && !isDuplicateUsername) { 
    client.query('BEGIN', async (err, result) => {
      if(err) return rollback(client, res, {loggedIn: false, error: "Error creating user, please try again later", errNum: 1, errMsg: "Error @: Beginning user creation -> "+err.message}) // err1
      client.query(`INSERT INTO Users (userID, username, email, password, name, age, profilePicture) VALUES ('${userID}', '${user.username}', '${user.email}', '${hashedPwd}', '${user.name}', ${user.age}, '${profilePicture}');`, async (err, result) => {
        if(err) return rollback(client, res, {loggedIn: false, error: "Error creating user, please try again later", errNum: 2, errMsg: "Error @: Inserting new user info -> "+err.message}) // err2
        client.query(`INSERT INTO Goals (userID, goalID, goal, weight, goalDate, weightDate) VALUES ('${userID}', '${goalID}', 0, 0, '${currentDate}', '${currentDate}');`, async (err, result) => {
          if(err) { 
            return rollback(client, res, {loggedIn: false, error: "Error creating user, please try again later", errNum: 3, errMsg: "Error @: Inserting new goal info -> "+err.message})  // err3
          } else {
            client.query('COMMIT')
            req.session.user = userID
            logging(res, {loggedIn: true, user: req.session.user }, 'Successfully created user '+userID, true) // good1
          }
        })
      })
    })
    client.end
  } else if (isDuplicateEmail == "error" || isDuplicateUsername == "error") {
    logging(res, {loggedIn: false, error: "Error creating user, please try again later", errNum: 4, errMsg: "Error @: Checking for duplicate email/username"}, 'Error @: Checking for duplicate email/username', false) // err4
  } else {
    // Alert user if duplicate was email, username, or both
    var msg = ''

    if (isDuplicateEmail && isDuplicateUsername) {
      msg = 'email and username'
    } else if (isDuplicateEmail) {
      msg = 'email'
    } else if (isDuplicateUsername) {
      msg = 'username'
    }

    logging(res, {loggedIn: false, error: "User with that "+msg+" already exists" }, 'User with that '+msg+' already exists', true) // good2
  }
})

// Returns true if email was found, false if not, and "error" if problem with query
async function checkDuplicateEmail(req, res) {
  let user = req.body

  return new Promise((resolve, reject) => {
    client.query(`SELECT userID FROM Users WHERE email = '${user.email}';`, async (err, response) => {
      if (!err) {
        // Check if a user was found with the email
        if (response.rows[0] !== undefined) {
          resolve(true)
        } else {
          resolve(false)
        }
      } else {
        logging(res, '', "Error @: Checking for duplicate email -> "+err.message, false)
        resolve("error")
      }
    })
    client.end
  })
}

// Returns true if username was found, false if not, and "error" if problem with query
async function checkDuplicateUsername(req, res) {
  let user = req.body

  return new Promise((resolve, reject) => {
    client.query(`SELECT userID FROM Users WHERE username = '${user.username}';`, async (err, response) => {
      if (!err) {
        // Check if a user was found with the username
        if (response.rows[0] !== undefined) {
          resolve(true)
        } else {
          resolve(false)
        }
      } else {
        logging(res, '', "Error @: Checking for duplicate username -> "+err.message, false)
        resolve("error")
      }
    })
    client.end
  })
}

// User login
app.post('/users/login', async (req, res) => {
  let user = req.body
  var userID = await findUser(req, res)
  var isPasswordCorrect

  // If user exists, verify password is correct
  if(userID !== undefined) {
    client.query(`SELECT userID, password FROM Users WHERE userID = '${userID}';`, async (err, response) => {
      if (!err) {
        // Verify a password was found
        if (response.rows[0] !== undefined){
          // Verify the given password and retrieved password match
          if (await bcrypt.compare(user.password, JSON.parse(JSON.stringify(response.rows[0])).password)) {
            req.session.user = response.rows[0].userid
            logging(res, {loggedIn: true, user: req.session.user }, 'Login successful', true)
          } else {
            logging(res, '', "Incorrect Email/Username and Password", true)
          }
        } else {
          logging(res, '', 'Could not find User\'s password', true)
        }
      } else {
        logging(res, '', 'Error @ getting password for login ->'+err.message, false)
      }
      client.end
    })
  } else {
    logging(res, '', "Incorrect Email/Username and Password", true)
  }
})

// Returns userID if the user is found und undefined otherwise
async function findUser(req, res) {
  let user = req.body

  return new Promise((resolve, reject) => {
    client.query(`SELECT userID FROM Users WHERE email = '${user.emailUsername}' OR username = '${user.emailUsername}';`, async (err, response) => {
      if (!err) {
        // Check that a user was found
        if (response.rows[0] !== undefined) {
          resolve(JSON.parse(JSON.stringify(response.rows[0])).userid)
        } else {
          resolve(undefined)
        }
      } else {
        logging(res, '', 'Error @ getting user for login ->'+err.message, false)
        resolve(undefined)
      }
    })
    client.end
  })
}

// Get login status
app.get('/users/login', (req, res) => {
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
app.get('/users/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err)
    }
    res.clearCookie('userid')
    res.send("logged out")
    console.log("logged out")
  });
})

// Get a User's info
app.get('/users', async (req, res) => {
  client.query(`SELECT userID, email, age, name, profilePicture FROM Users WHERE userID = '${req.query.userID}';`, async (err, result) => {
    if (!err) {
      logging(res, result.rows, 'User '+req.query.userID+' info retrieved successfully', true)
    } else {
      logging(res, "Error @: Getting user's info -> "+err.message, false)
    }
  })
})

// Get a User's current Weight
app.get('/users/weight', async (req, res) => {
  client.query(`SELECT weight, weightDate FROM Goals WHERE userID = '${req.query.userID}' AND weight IS NOT NULL ORDER BY weightDate DESC LIMIT 1;`, async (err, result) => {
    if (!err) {
      if(result.rows[0] !== undefined) {
        logging(res, result.rows, 'User '+req.query.userID+' weight retrieved successfully', true)
      } else {
        logging(res, '', "Weight Not Retrieved", true)
      }
    } else {
      logging(res, '', "Error @: Getting user's current weight -> "+err.message, false)
    }
  })
  client.end
})

// Get a User's current Goal
app.get('/users/goal', async(req, res) => {
  client.query(`SELECT goal, goalDate FROM Goals WHERE userID = '${req.query.userID}' AND goal IS NOT NULL ORDER BY goalDate DESC LIMIT 1;`, async (err, result) => {
    if (!err) {
      if(result.rows[0] !== undefined) {
        logging(res, result.rows, 'User '+req.query.userID+' goal retrieved successfully', true)
      } else {
        logging(res, '', "Goal Not Retrieved", true)
      }
    } else {
      logging(res, '', "Error @: Getting user's current goal -> "+err.message, false)
    }
  })
  client.end
})

// Update User Info
app.put('/users/update-user-info', async (req, res) => {
  let user = req.body

  client.query(`UPDATE Users SET name = '${user.name}', age = ${user.age}, email = '${user.email}', profilePicture = '${user.profilePicture}' WHERE userID = '${user.userID}';`, async (err, result) => {
    if (!err) {
      logging(res, '', "Successfully updated User info", true)
    } else {
      logging(res, '', "Error @: Updating user info -> "+err.message, false)
    }
  })
  client.end
})

// Update User's Password
app.put('/users/update-password', async (req, res) => {
  let user = req.body
  const hashedPwd = await bcrypt.hash(user.password, 10)

  client.query(`UPDATE Users SET password = '${hashedPwd}' WHERE userID = '${user.userID}';`, async (err, result) => {
    if(!err) {
      logging(res, '', "Successfully updated User password", true)
    } else {
      logging(res, '', "Error @: Updating user's password -> "+err.message, false)
    }
  }) 
  client.end
})

// Update User's Weight
app.post('/users/update-weight', async (req, res) => {
  let user = req.body
  let goalID = uuid()
  let currentDate = await getCurrentDate()

  client.query(`INSERT INTO Goals (userID, goalID, weight, weightDate) VALUES ('${user.userID}', '${goalID}', ${user.weight}, '${currentDate}');`, async (err, result) => {
    if (!err) {
      logging(res, '', "Successfully inserted new User weight", true)
    } else {
      logging(res, '', "Error @: Inserting new user weight -> "+err.message, false)
    }
  })
})

// Update User's Goal
app.post('/users/update-goal', async (req, res) => {
  let user = req.body
  let goalID = uuid()
  let currentDate = await getCurrentDate()

  client.query(`INSERT INTO Goals (userID, goalID, goal, goalDate) VALUES ('${user.userID}', '${goalID}', ${user.goal}, '${currentDate}');`, async (err, result) => {
    if (!err) {
      logging(res, '', "Successfully inserted new User goal", true)
    } else {
      logging(res, '', "Error @: Inserting new user goal -> "+err.message, false)
    }
  })
})

// Add an Exercise
app.post('/exercise/create', async (req, res) => {
  let user = req.body
  let historyID = uuid()
  let date = await getCurrentDate()

  client.query('BEGIN', (err, result) => {
    if(err) return rollback(client, res, "Error @: Beginning exercise creation -> "+err.message)
    client.query(`INSERT INTO Exercises (userID, exerciseID, name, picture, categories, createdDate) VALUES ('${user.userID}', '${user.exerciseID}', '${user.name}', '${user.picture}', '${user.categories}', '${date}');`, async(err, result) => {
      if(err) return rollback(client, res, "Error @: Inserting new exercise info -> "+err.message)
      client.query(`INSERT INTO History (exerciseID, historyID, sets, reps, weight, completedDate) VALUES ('${user.exerciseID}', '${historyID}', 0, 0, 0, '${date}');`, async (err, result) => {
        if(!err) { 
          logging(res, '', "Exercise created successfully", true)
          client.query('COMMIT')
        } else {
          return rollback(client, res, "Error @: Inserting new history info -> "+err.message) 
        }
      })
    })
  })
  client.end
})

// Update exercise info
app.put('/exercise/update-info', async (req, res) => {
  let user = req.body

  client.query(`UPDATE Exercises SET name = '${user.name}', picture = '${user.picture}', categories = '${user.categories}' WHERE exerciseID = '${user.exerciseID}';`, async (err, result) => {
    if (!err) {
      logging(res, '', "Exercise info updated ", true)
    } else {
      logging(res, '', "Error @: Updating exercise info -> "+err.message, false)
    }
  })
  client.end
})

// Update exercise history
app.post('/exercise/update-history', async (req, res) => {
  let user = req.body
  let historyID = uuid()
  let currentDate = await getCurrentDate()

  client.query(`INSERT INTO History (exerciseID, historyID, sets, reps, weight, completedDate) VALUES 
    ('${user.exerciseID}', '${historyID}', ${user.sets}, ${user.reps}, ${user.weight}, '${currentDate}');`, async (err, result) => {
    if (!err) {
      logging(res, '', "History info added successfully", true)
    } else {
      logging(res, '', "Error @: Inserting history info -> "+err.message, false)
    }
  })
})

// Delete an Exercise
app.delete('/exercise/delete', async (req, res) => {
  client.query(`DELETE FROM Exercises WHERE exerciseID = '${req.query.exerciseID}';`, async (err, result) => {
    if(!err) {
      logging(res, '', "Exercise deleted successfully", true)
    } else {
      logging(res, '', "Error @: Deleting exercise -> "+err.message, false)
    }
  })
  client.end
})

// Get all Exercises of a User
app.get('/exercises/get-all', async (req, res) => {
  client.query(`WITH RecentHistory As (Select *, Row_Number() Over (Partition By exerciseID Order By completedDate Desc) RowNum From 
    (SELECT * FROM (SELECT * FROM Exercises WHERE userID = '${req.query.userID}') AS Temp1 JOIN History USING(exerciseID)) AS Temp2) 
    SELECT * FROM RecentHistory WHERE RowNum = 1;`, async (err, result) => {
    if (!err) {
      logging(res, result.rows, 'User '+req.query.userID+' exercises retrieved successfully', true)
    } else {
      logging(res, '', "Error @: Getting exercises of user -> "+err.message, false)
    } 
  }) 
  client.end
})

// Get all Exercises of a User with a specific Category
app.get('/exercises/get-category', async (req, res) => {
  client.query(`WITH RecentHistory As (Select *, Row_Number() Over (Partition By exerciseID Order By completedDate Desc) RowNum From 
    (SELECT * FROM (SELECT * FROM Exercises WHERE userID = '${req.query.userID}') AS Temp1 JOIN History USING(exerciseID)) AS Temp2) 
    SELECT * FROM RecentHistory WHERE RowNum = 1 AND '${req.query.category}' = ANY(categories);`, async (err, result) => {
    if (!err) {
      logging(res, result.rows, 'User '+req.query.userID+' exercises of category '+req.query.categories+' retrieved successfully', true)
    } else {
      logging(res, '', "Error @: Getting exercises of user with category -> "+err.message, false)
    }
  })
  client.end
})

// Get all categories a user has made
app.get('/exercises/get-categories', async (req, res) => {
  client.query(`SELECT categories FROM Exercises WHERE userid = '${req.query.userID}';`, async (err, result) => {
    if (!err) {
      // Move all of the categories into an array
      let temp = []
      for (let i = 0; i < result.rows.length; i++) {
        if (result.rows[i].categories !== null) {
          for (let j = 0; j < result.rows[i].categories.length; j++) {
            temp.push(result.rows[i].categories[j])
          }
        }
      }
      // Remove all of the duplicate values
      temp = temp.reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);
      logging(res, temp, 'User '+req.query.userID+' categories retrieved successfully', true)
    }else {
      logging(res, '', "Error @: Getting categories -> "+err.message, false)
    }
  })
})

// Get all categories of an exercise
app.get('/exercise/get-categories', async (req, res) => {
  client.query(`SELECT categories FROM Exercises WHERE exerciseID = '${req.query.exerciseID}';`, async (err, result) => {
    if (!err) {
      logging(res, result.rows[0].categories, 'Categories of '+req.query.exerciseID+' exercise retrieved successfully', true)
    } else {
      logging(res, '', "Error @: Getting categories of exercise -> "+err.message, false)
    }
  })
})

// Add a Workout
app.post('/workout/create', async (req, res) => {
  let user = req.body
  let workoutID = uuid()

  client.query(`INSERT INTO Workouts (userID, workoutID, name) VALUES ('${user.userID}', '${workoutID}', '${user.name}');`, async (err, result) => {
    if (!err) {
      logging(res, '', "Workout created successfully", true)
    } else {
      logging(res, '', "Error @: Inserting new workout info -> "+err.message, false)
    }
  })
  client.end
})

// Delete a Workout
app.delete('/workout/delete', async (req, res) => {
  client.query(`DELETE FROM Workouts WHERE workoutID = '${req.query.workoutID}';`, async (err, result) => {
    if (!err) {
      logging(res, '', "Workout deleted successfully", true)
    } else {
      logging(res, '', "Error @: Deleting workout -> "+err.message, false)
    }
  })
  client.end
})

// Get all Workouts of a User
app.get('/workout/get-all', async (req, res) => {
  client.query(`SELECT * FROM Workouts WHERE userID = '${req.query.userID}';`, async (err, result) => {
    if (!err) {
      logging(res, result.rows, 'User '+req.query.userID+' workouts retrieved successfully', true)
    } else {
      logging(res, '', "Error @: Getting all user workouts -> "+err.message , false)
    }
  })
  client.end
})

// Get all Exercises of a User's Workout
app.get('/workout/get-exercises', async (req, res) => {
  client.query(`SELECT * FROM (SELECT exerciseID FROM Contains WHERE workoutID = '${req.query.workoutID}') AS Temp1 JOIN (WITH RecentHistory As 
    (Select *, Row_Number() Over (Partition By exerciseID Order By completedDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises 
    WHERE userID = '${req.query.userID}') AS Temp2 JOIN History USING(exerciseID)) AS Temp3) SELECT * FROM RecentHistory WHERE RowNum = 1) 
    AS Temp4 USING(exerciseID);`, async (err, result) => {
    if (!err) {
      logging(res, result.rows, 'User '+req.query.userID+' exercises of workout '+req.query.workoutID+' retrieved successfully', true)
    } else {
      logging(res, '', "Error @: Getting all exercises of a user's workout -> "+err.message, false)
    }
  })
  client.end
})

// Add an Exercise to a Workout
app.post('/workout/add-exercise', async (req, res) => {
  let user = req.body

  client.query(`INSERT INTO Contains (workoutID, exerciseID) VALUES ('${user.workoutID}', '${user.exerciseID}');`, async (err, result) => {
    if (!err) {
      logging(res, '', "Exercise added to workout successfully", true)
    } else {
      logging(res, '', "Error @: Adding exercise to workout -> "+err.message, false)
    }
  })
  client.end
})

// Remove an Exercise from a Workout
app.delete('/workout/delete-exercise', async (req, res) => {
  client.query(`DELETE FROM Contains WHERE workoutID = '${req.query.workoutID}' AND exerciseID = '${req.query.exerciseID}';`, async (err, result) => {
    if (!err) {
      logging(res, '', "Exercise deleted from workout successfully", true)
    } else {
      logging(res, '', "Error @: Deleting exercise from workout -> "+err.message, false)
    }
  })
  client.end
})

// Test
app.get('/test', (req, res) => {
  client.query(`WITH RecentHistory As (Select *, Row_Number() Over (Partition By exerciseID Order By completedDate Desc) RowNum From 
    (SELECT * FROM (SELECT * FROM Exercises WHERE userID = '${req.query.userID}') AS Temp1 JOIN History USING(exerciseID)) AS Temp2) 
    SELECT * FROM RecentHistory WHERE RowNum = 1;`, async (err, result) => {
    if (!err) {
      logging(res, result.rows, 'User '+req.query.userID+' exercises retrieved successfully', true)
    } else {
      logging(res, '', "Error @: Getting exercises of user -> "+err.message, false)
    } 
  })
  client.end
}) 