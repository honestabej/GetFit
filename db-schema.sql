CREATE TABLE Users (
    userID VARCHAR(100), 
    userName VARCHAR(100), 
    email VARCHAR(100), 
    password VARCHAR(100), 
    name VARCHAR(100), 
    picture BIT(10000), 
    age INT, 
    PRIMARY KEY(userID)
);

CREATE TABLE Goals (
    userID VARCHAR(100),
    goalID VARCHAR(100),
    goal FLOAT,
    weight FLOAT,
    goalDate TIMESTAMP,
    weightDate TIMESTAMP,
    PRIMARY KEY(goalID),
    FOREIGN KEY(userID) REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE Workouts (
    userID VARCHAR(100),
    workoutID VARCHAR(100),
    name VARCHAR(100),
    PRIMARY KEY(workoutID),
    FOREIGN KEY(userID) REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE Exercises (
    userID VARCHAR(100),
    exerciseID VARCHAR(100),
    name VARCHAR(100),
    picture BIT(10000),
    category VARCHAR(100),
    PRIMARY KEY(exerciseID),
    FOREIGN KEY(userID) REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE History (
    exerciseID VARCHAR(100),
    historyID VARCHAR(100),
    sets INT,
    reps INT,
    weight FLOAT,
    changeDate TIMESTAMP,
    completedDate TIMESTAMP,
    PRIMARY KEY(historyID),
    FOREIGN KEY(exerciseID) REFERENCES Exercises ON DELETE CASCADE
);

CREATE TABLE WoEx (
    workoutID VARCHAR(100),
    exerciseID VARCHAR(100),
    PRIMARY KEY (workoutID, exerciseID)
);

INSERT INTO Users (userID, userName, email, password, name, age) VALUES
    ('u1', 'honestabej', 'honestabej@hotmail.com', 'password', 'Abe', 24);

INSERT INTO Goals (userID, goalID, goal, weight, goalDate, weightDate) VALUES
    ('u1', 'g1', 180.00, 185.00, '2023-11-27 14:55:46', '2023-11-27 14:55:46'),
    ('u1', 'g2', 181.00, 186.00, '2022-11-28 09:00:32', '2023-11-28 09:00:32'),
    ('u1', 'g3', 182.00, 187.00, '2023-11-28 20:50:01', '2023-11-28 20:50:01');

INSERT INTO Workouts (userID, workoutID, name) VALUES
    ('u1', 'w1', 'Day 1'),
    ('u1', 'w2', 'Day 2'),
    ('u1', 'w3', 'Day 3'),
    ('u1', 'w4', 'Day 4');

INSERT INTO Exercises (userID, exerciseID, name, category) VALUES
    ('u1', 'e1', 'Sit Up', 'Core'),
    ('u1', 'e2', 'Bicep Curl', 'Arms'),
    ('u1', 'e3', 'Chest Press', 'Upper'),
    ('u1', 'e4', 'Shoulder Press', 'Upper'),
    ('u1', 'e5', 'Tricep Pushdown', 'Arms'),
    ('u1', 'e6', 'Leg Press', 'Legs'),
    ('u1', 'e7', 'Calf Raise', 'Core'),
    ('u1', 'e8', 'Assisted Pull Up', 'Back'),
    ('u1', 'e9', 'Lat Pulldown', 'Back'),
    ('u1', 'e10', 'Leg Extension', 'Legs');

INSERT INTO History (exerciseID, historyID, sets, reps, weight, changeDate) VALUES
    ('e1', 'h1', 3, 25, 0.0, '2023-11-27 14:55:46'),
    ('e2', 'h2', 3, 8, 80.0, '2023-11-27 14:55:46'),
    ('e3', 'h3', 4, 10, 115.0, '2023-11-27 14:55:46'),
    ('e4', 'h4', 3, 8, 80.0, '2023-11-27 14:55:46'),
    ('e5', 'h5', 3, 12, 37.5, '2023-11-27 14:55:46'),
    ('e6', 'h6', 4, 12, 250.0, '2023-11-27 14:55:46'),
    ('e7', 'h7', 4, 15, 250.0, '2023-11-27 14:55:46'),
    ('e8', 'h8', 3, 8, -70.0, '2023-11-27 14:55:46'),
    ('e9', 'h9', 3, 8, 90.0, '2023-11-27 14:55:46'),
    ('e10', 'h10', 3, 12, 110.0, '2023-11-27 14:55:46'),
    ('e1', 'h11', 4, 26, 0.0, '2023-11-28 14:55:46');

INSERT INTO WoEx (workoutID, exerciseID) VALUES
    ('w1', 'e1'),
    ('w1', 'e2'),
    ('w1', 'e3'),
    ('w1', 'e4'),
    ('w1', 'e5'),
    ('w1', 'e6'),
    ('w2', 'e4'),
    ('w2', 'e5'),
    ('w2', 'e6'),
    ('w2', 'e7'),
    ('w2', 'e8'),
    ('w2', 'e9'),
    ('w3', 'e10'),
    ('w3', 'e1'),
    ('w3', 'e2'),
    ('w3', 'e3'),
    ('w3', 'e4'),
    ('w3', 'e5'),
    ('w4', 'e6'),
    ('w4', 'e7'),
    ('w4', 'e8'),
    ('w4', 'e9'),
    ('w4', 'e10'),
    ('w4', 'e1');

-- If DB reset is needed... ALL DATA WILL BE LOST --
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Queries Below --

-- Add user
INSERT INTO Users (userID, userName, email, password, name, age) VALUES ('${userID}', '${user.userName}', '${user.email}', '${hashedPwd}', '${user.name}', ${user.age}); -- Picture to come later
INSERT INTO Goals (userID, goalID, goal, weight, goalDate, weightDate) VALUES ('${userID}', '${goalID}', ${user.goal}, ${user.weight}, '${user.goalDate}', '${user.weightDate}');

-- Get userID and password from email (for logging in)
SELECT userID, password FROM Users WHERE email = '${user.email}';

-- Get a user's current weight
SELECT weight, weightDate FROM Goals WHERE userID = '${user.userID}' AND weight IS NOT NULL ORDER BY weightDate DESC LIMIT 1;

-- Get a user's current goal
SELECT goal, goalDate FROM Goals WHERE userID = '${user.userID}' AND goal IS NOT NULL ORDER BY goalDate DESC LIMIT 1;

-- Update user info (and weight/goal)
    UPDATE Users SET name = '${user.name}', age = ${user.age}, email = '${user.email}' WHERE userID = '${user.userID}'; -- Picture to come later
    -- If updating either weight OR goal
    INSERT INTO Goals (userID, goalID, goal, weight, goalDate, weightDate) VALUES ('${user.userID}', '${goalID}', ${user.goal}, ${user.weight}, '${user.goalDate}', '${user.weightDate}');

-- Update user password
UPDATE Users SET password = '${user.password}' WHERE userID = '${user.userID}';

-- Add an exercise
INSERT INTO Exercises (userID, exerciseID, name, category) VALUES ('${user.userID}', '${exerciseID}', '${user.name}', '${user.category}');
INSERT INTO History (exerciseID, historyID, sets, reps, weight, changeDate) VALUES ('${exerciseID}', '${historyID}', ${user.sets}, ${user.reps}, ${user.weight}, '${changeDate}'); -- completedDate to come later

-- Update an exercise
    UPDATE Exercises SET name = '${user.name}', category = '${user.category}' WHERE exerciseID = '${user.exerciseID}';
    -- If any of this info has changed
    INSERT INTO History (exerciseID, historyID, sets, reps, weight, changeDate) VALUES ('${user.exerciseID}', '${historyID}', ${user.sets}, ${user.reps}, ${user.weight}, '${changeDate}'); -- completedDate to come later

-- Delete an exercise
DELETE FROM Exercises WHERE exerciseID = '${user.exerciseID}';

-- Get an exercise with it's most recent history

-- Get all exercises of a user with most recent history
WITH RecentHistory As (Select *, Row_Number() Over (Partition By exerciseID Order By changeDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises WHERE userID = '${user.userID}') AS Temp1 JOIN History USING(exerciseID)) AS Temp2) SELECT * FROM RecentHistory WHERE RowNum = 1;

-- Get all exercises of a user with most recent history in a specific category
WITH RecentHistory As (Select *, Row_Number() Over (Partition By exerciseID Order By changeDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises WHERE userID = '${user.userID}') AS Temp1 JOIN History USING(exerciseID)) AS Temp2) SELECT * FROM RecentHistory WHERE RowNum = 1 AND category = '${user.category}';

-- Add a workout
INSERT INTO Workouts (userID, workoutID, name) VALUES ('${user.userID}', '${workoutID}', '${user.name}');

-- Delete a workout
DELETE FROM Workouts WHERE workoutID = '${user.workoutID}';

-- Get all workouts of a user
SELECT * FROM Workouts WHERE userID = '${user.userID}';

-- Add an exercise to a workout
INSERT INTO WoEx (workoutID, exerciseID) VALUES ('${user.workoutID}', '${user.exerciseID}');

-- Remove an exercise from a workout
DELETE FROM WoEx WHERE workoutID = '${user.workoutID}' AND exerciseID = '${user.exerciseID}';

-- Get all exercises of a user's workout
SELECT * FROM (SELECT exerciseID FROM WoEx WHERE workoutID = '${user.workoutID}') AS Temp1 JOIN (WITH RecentHistory As (Select *, Row_Number() Over (Partition By exerciseID Order By changeDate Desc) RowNum From (SELECT * FROM (SELECT * FROM Exercises WHERE userID = '${user.userID}') AS Temp2 JOIN History USING(exerciseID)) AS Temp3) SELECT * FROM RecentHistory WHERE RowNum = 1) AS Temp4 USING(exerciseID);
