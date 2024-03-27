CREATE TABLE Users (
    userid VARCHAR(100), 
    name VARCHAR(50), 
    username VARCHAR(50), 
    email VARCHAR(50), 
    password VARCHAR(30), 
    profilePicture VARCHAR(500), 
    age INT, 
    PRIMARY KEY(userid)
);

CREATE TABLE Goals (
    userid VARCHAR(100),
    goalid VARCHAR(100),
    goal FLOAT,
    weight FLOAT,
    goalDate TIMESTAMP,
    weightDate TIMESTAMP,
    PRIMARY KEY(goalid),
    FOREIGN KEY(userid) REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE Workouts (
    userid VARCHAR(100),
    workoutid VARCHAR(100),
    name VARCHAR(100),
    PRIMARY KEY(workoutid),
    FOREIGN KEY(userid) REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE Groups (
    workoutid VARCHAR(100),
    groupid VARCHAR(100),
    name VARCHAR(100),
    PRIMARY KEY(groupid),
    FOREIGN KEY(workoutid) REFERENCES Workouts ON DELETE CASCADE
);

CREATE TABLE Exercises (
    userid VARCHAR(100),
    exerciseid VARCHAR(100),
    name VARCHAR(100),
    picture VARCHAR(500),
    categories text[],
    createdDate TIMESTAMP,
    PRIMARY KEY(exerciseid),
    FOREIGN KEY(userid) REFERENCES Users ON DELETE CASCADE
);

CREATE TABLE Contains (
    groupid VARCHAR(100),
    exerciseid VARCHAR(100),
    FOREIGN KEY(groupid) REFERENCES Groups ON DELETE CASCADE,
    FOREIGN KEY(exerciseid) REFERENCES Exercises ON DELETE CASCADE
);

CREATE TABLE Weightlifting (
    exerciseid VARCHAR(100),
    weightliftingid VARCHAR(100),
    difficulty FLOAT,
    completedDate TIMESTAMP,
    PRIMARY KEY(weightliftingid),
    FOREIGN KEY(exerciseid) REFERENCES Exercises ON DELETE CASCADE
);

CREATE TABLE Sets (
    weightliftingid VARCHAR(100),
    setid VARCHAR(100),
    weight FLOAT,
    reps INT,
    PRIMARY KEY(setid),
    FOREIGN KEY(weightliftingid) REFERENCES Weightlifting ON DELETE CASCADE
);

CREATE TABLE Cardio (
    exerciseid VARCHAR(100),
    cardioid VARCHAR(100),
    time TIME,
    distance FLOAT,
    completedDate TIMESTAMP,
    PRIMARY KEY(cardioid),
    FOREIGN KEY(exerciseid) REFERENCES Exercises ON DELETE CASCADE
);

CREATE TABLE Other (
    exerciseid VARCHAR(100),
    otherid VARCHAR(100),
    notes VARCHAR(10000),
    completedDate TIMESTAMP,
    PRIMARY KEY(otherid),
    FOREIGN KEY(exerciseid) REFERENCES Exercises ON DELETE CASCADE
);

-- If DB reset is needed... ALL DATA WILL BE LOST --
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Queries Below --

-- Create User
    -- Insert User info into the User table
    INSERT INTO Users (userid, username, email, password, name, age, profilePicture) VALUES ('${}', '${}', '${}', '${}', '${}', '${}', ${}); 
    -- Insert Goals info into the Goals table
    INSERT INTO Goals (userid, goalid, goal, weight, goalDate, weightDate) VALUES ('${}', '${}', ${}, ${}, '${}', '${}');

-- Edit User info (not password)
UPDATE Users SET name = '${}', age = ${}, email = '${}', profilePicture = '${}' WHERE userid = '${}';
    
-- Edit User password
UPDATE Users SET password = '${}' WHERE userid = '${}';

-- Update User's Weight info
INSERT INTO Goals (userID, goalid, weight, weightDate) VALUES ('${}', '${}', ${}, '${}');

-- Update User's Goals info
INSERT INTO Goals (userid, goalid, goal, goalDate) VALUES ('${}', '${}', ${}, '${}');

-- Get User info (w/o password)
SELECT userid, email, age, name, profilePicture FROM Users WHERE userid = '${}';

-- Get User id and password for login
SELECT userid, password FROM Users WHERE email = '${}' OR username = '${}';

-- Get User weight
SELECT weight, weightDate FROM Goals WHERE userid = '${}' AND weight IS NOT NULL ORDER BY weightDate DESC LIMIT 1;

-- Get User goal
SELECT goal, goalDate FROM Goals WHERE userid = '${}' AND goal IS NOT NULL ORDER BY goalDate DESC LIMIT 1;

-- Create an Exercise
INSERT INTO Exercises (userid, exerciseid, name, picture, categories, type, createdDate) VALUES ('${}', '${}', '${}', '${}', '${}', '${}', '${}');

-- Edit an Exercise
UPDATE Exercises SET name = '${}', picture = '${}', categories = '${}' WHERE exerciseid = '${}';

-- Delete an exercise
DELETE FROM Exercises WHERE exerciseid = '${}';

-- Get all Exercises and their most recent completed info: (must run separate queries for each type)
    -- Get all Weightlifting Exercises of a User (with most recent completion)
    WITH RecentHistory AS (
        Select *, Row_Number() Over (
            Partition By exerciseid Order By completedDate Desc
        ) RowNum From (
            SELECT * FROM (
                SELECT * FROM Exercises WHERE userid = '${}'
            ) AS Temp1 JOIN Weightlifting USING(exerciseid)
        ) AS Temp2
    ) SELECT * FROM RecentHistory WHERE RowNum = 1;

    -- Get all Cardio Exercises of a User (with most recent completion)
    WITH RecentHistory AS (
        Select *, Row_Number() Over (
            Partition By exerciseid Order By completedDate Desc
        ) RowNum From (
            SELECT * FROM (
                SELECT * FROM Exercises WHERE userid = '${}'
            ) AS Temp1 JOIN Cardio USING(exerciseid)
        ) AS Temp2
    ) SELECT * FROM RecentHistory WHERE RowNum = 1;

    -- Get all Other Exercises of a User (with most recent completion)
    WITH RecentHistory AS (
        Select *, Row_Number() Over (
            Partition By exerciseid Order By completedDate Desc
        ) RowNum From (
            SELECT * FROM (
                SELECT * FROM Exercises WHERE userid = '${}'
            ) AS Temp1 JOIN Other USING(exerciseid)
        ) AS Temp2
    ) SELECT * FROM RecentHistory WHERE RowNum = 1;

-- Get all Exercises of a specific category and their most recent completed info: (must run separate queries for each type)
    -- Get all Weightlifting Exercises and most recently completed sets with a specific category
    WITH RecentHistory AS (
        Select *, Row_Number() Over (
            Partition By exerciseid Order By completedDate Desc
        ) RowNum From (
            SELECT * FROM (
                SELECT * FROM Exercises WHERE userid = '${}' AND '${}' = ANY(categories)
            ) AS Temp1 JOIN Weightlifting USING(exerciseid)
        ) AS Temp2
    ) SELECT * FROM RecentHistory WHERE RowNum = 1;

    -- Get all Cardio Exercises with a specific category
    WITH RecentHistory AS (
        Select *, Row_Number() Over (
            Partition By exerciseid Order By completedDate Desc
        ) RowNum From (
            SELECT * FROM (
                SELECT * FROM Exercises WHERE userid = '${}' AND '${}' = ANY(categories)
            ) AS Temp1 JOIN Cardio USING(exerciseid)
        ) AS Temp2
    ) SELECT * FROM RecentHistory WHERE RowNum = 1;

    -- Get all Other Exercises with a specific category
    WITH RecentHistory AS (
        Select *, Row_Number() Over (
            Partition By exerciseid Order By completedDate Desc
        ) RowNum From (
            SELECT * FROM (
                SELECT * FROM Exercises WHERE userid = '${}' AND '${}' = ANY(categories)
            ) AS Temp1 JOIN Other USING(exerciseid)
        ) AS Temp2
    ) SELECT * FROM RecentHistory WHERE RowNum = 1;

-- Create a completion of a Weightlifting Exercise
    -- Create a Weightlifting entry
    INSERT INTO Weightlifting (exerciseid, weightliftingid, difficulty, completedDate) VALUES ('${}', '${}', ${}, '${}');
    
    -- Create a set (Insert multiple entries for multiple sets)
    INSERT INTO Sets (weightliftingid, setid, weight, reps) VALUES ('${}', '${}', ${}, ${});

-- Delete a completion of a Weightlifting Exercise
DELETE FROM Weightlifting WHERE weightliftingid = '${}';

-- Edit a Set completion of a Weightlifting Exercise
UPDATE Sets SET weight = '${}', reps = '${}' WHERE setid = '${}';

-- Delete a Set completion of a Weightlifting Exercise
DELETE FROM Sets WHERE setid = '${}';

-- Get all Set completions of a Workout
SELECT setid, weight, reps FROM Sets WHERE weightliftingid = '${}';

-- Create a completion of a Cardio Exercise
INSERT INTO Cardio (exerciseid, cardioid, time, distance, completedDate) VALUES ('${}', '${}', '${}', ${}, '${}');

-- Edit a completion of a Cardio Exercise
UPDATE Cardio SET time = '${}', distance = '${}' WHERE cardioid = '${}';

-- Delete a completion of a Cardio Exercise
DELETE FROM Cardio WHERE cardioid = '${}';

-- Create a completion of an Other Exercise
INSERT INTO Other (exerciseid, otherid, notes, completedDate) VALUES ('${}', '${}', '${}', '${}');

-- Edit a completion of an Other Exercise
UPDATE Other SET notes = '${}' WHERE otherid = '${}';

-- Delete a completion of an Other Exercise
DELETE FROM Other WHERE otherid = '${}';

-- Create a Workout
    -- Create the Workout
    INSERT INTO Workouts (userid, workoutid, name) VALUES ('${}', '${}', '${}');

    -- Create the default ungrouped Group to the Workout
    INSERT INTO Groups (workoutid, groupid, name) VALUES ('${}', '${}', '');

-- Edit a Workout
UPDATE Workouts SET name = '${}' WHERE workoutid = '${}';

-- Delete a Workout
DELETE FROM Workouts WHERE workoutid = '${}';

-- Get all Workouts of a User
SELECT * FROM Workouts WHERE userid = '${}';

-- Create a Group
INSERT INTO Groups (workoutid, groupid, name) VALUES ('${}', '${}', '${}');

-- Edit a Group
UPDATE Groups SET name = '${}' WHERE groupid = '${}';

-- Delete a Group
DELETE FROM Groups WHERE groupid = '${}';

-- Get all Groups of a Workout
SELECT groupid, name FROM Groups WHERE workoutid = '${}';

-- Add an Exercise to a Group
INSERT INTO Contains (workoutid, exerciseid) VALUES ('${}', '${}');

-- Remove an Exercise from a Group
DELETE FROM Contains WHERE workoutid = '${}' AND exerciseid = '${}';

-- Get all Exercises of a Group
    -- Get all Weightlifting Exercises of a Group
    SELECT * FROM (
        SELECT exerciseid FROM Contains WHERE groupid = '${}'
    ) AS Temp1 JOIN (
        WITH RecentHistory AS (
            Select *, Row_Number() Over (
                Partition By exerciseid Order By completedDate Desc
            ) RowNum From (
                SELECT * FROM (
                    SELECT * FROM Exercises WHERE userid = '${}'
                ) AS Temp2 JOIN Weightlifting USING(exerciseid)
            ) AS Temp3
        ) SELECT * FROM RecentHistory WHERE RowNum = 1
    ) AS Temp4 USING(exerciseid);

    -- Get all Cardio Exercises of a Group
    SELECT * FROM (
        SELECT exerciseid FROM Contains WHERE groupid = '${}'
    ) AS Temp1 JOIN (
        WITH RecentHistory AS (
            Select *, Row_Number() Over (
                Partition By exerciseid Order By completedDate Desc
            ) RowNum From (
                SELECT * FROM (
                    SELECT * FROM Exercises WHERE userid = '${}'
                ) AS Temp2 JOIN Cardio USING(exerciseid)
            ) AS Temp3
        ) SELECT * FROM RecentHistory WHERE RowNum = 1
    ) AS Temp4 USING(exerciseid);

    -- Get all Other Exercises of a Group
    SELECT * FROM (
        SELECT exerciseid FROM Contains WHERE groupid = '${}'
    ) AS Temp1 JOIN (
        WITH RecentHistory AS (
            Select *, Row_Number() Over (
                Partition By exerciseid Order By completedDate Desc
            ) RowNum From (
                SELECT * FROM (
                    SELECT * FROM Exercises WHERE userid = '${}'
                ) AS Temp2 JOIN Other USING(exerciseid)
            ) AS Temp3
        ) SELECT * FROM RecentHistory WHERE RowNum = 1
    ) AS Temp4 USING(exerciseid);


-- TEMP INFO FOR TESTING QUERIES
INSERT INTO Users (userid) VALUES ('u1'), ('u2');
INSERT INTO Exercises (exerciseid, userid, name, categories) VALUES 
    ('e1', 'u1', 'weight1', '{weight1}'),
    ('e2', 'u1', 'weight2', '{weight1, weight2}'),
    ('e3', 'u1', 'cardio1', '{cardio1}'),
    ('e4', 'u1', 'cardio2', '{cardio1, cardio2}'),
    ('e5', 'u1', 'other1', '{other1}'),
    ('e6', 'u1', 'other2', '{other1, other2}'),
    ('e7', 'u2', '2weight1', '{2weight1}'),
    ('e8', 'u2', '2weight2', '{2weight1, 2weight2}'),
    ('e9', 'u2', '2cardio1', '{2cardio1}'),
    ('e10', 'u2', '2cardio2', '{2cardio1, 2cardio2}'),
    ('e11', 'u2', '2other1', '{2other1}'),
    ('e12', 'u2', '2other2', '{2other1, 2other2}');
INSERT INTO Weightlifting (exerciseid, weightliftingid, completedDate) VALUES 
    ('e1', 'w1', '2024-03-15 16:21:37'),
    ('e1', 'w2', '2024-03-16 16:21:37'),
    ('e2', 'w3', '2024-03-15 16:21:37'),
    ('e7', 'w4', '2024-03-15 16:21:37'),
    ('e8', 'w5', '2024-03-15 16:21:37');
INSERT INTO Sets (weightliftingid, setid, weight, reps) VALUES 
    ('w1', 's1', 24, 8),
    ('w2', 's2', 8, 24),
    ('w2', 's3', 13, 10),
    ('w3', 's4', 34, 12),
    ('w4', 's5', 64, 30),
    ('w5', 's6', 23, 1),
    ('w5', 's7', 10, 6);
INSERT INTO Cardio (exerciseid, cardioid, time, completedDate) VALUES 
    ('e3', 'c1', '01:20:00', '2024-03-15 16:21:37'),
    ('e3', 'c2', '02:00:00', '2024-03-16 16:21:37'),
    ('e4', 'c3', '02:00:00', '2024-03-16 16:21:37'),
    ('e9', 'c4', '01:20:00', '2024-03-15 16:21:37'),
    ('e10', 'c5', '01:20:00', '2024-03-15 16:21:37');
INSERT INTO Other (exerciseid, otherid, completedDate) VALUES
    ('e5', 'o1', '2024-03-15 16:21:37'),
    ('e5', 'o2', '2024-03-16 16:21:37'),
    ('e6', 'o3', '2024-03-15 16:21:37'),
    ('e6', 'o4', '2024-03-16 16:21:37'),
    ('e6', 'o5', '2024-03-17 16:21:37'),
    ('e11', 'o6', '2024-03-15 16:21:37'),
    ('e12', 'o7', '2024-03-15 16:21:37');
INSERT INTO Workouts (userid, workoutid) VALUES 
    ('u1', 'wo1'),
    ('u2', 'wo2');
INSERT INTO Groups (workoutid, groupid, name) VALUES 
    ('wo1', 'g1', 'wo1g1'),
    ('wo1', 'g2', 'wo1g2'),
    ('wo2', 'g3', 'wo2g3'),
    ('wo2', 'g4', 'wo2g4');
INSERT INTO Contains (groupid, exerciseid) VALUES 
    ('g1', 'e1'),
    ('g1', 'e2'),
    ('g2', 'e3'),
    ('g3', 'e5'),
    ('g4', 'e11');