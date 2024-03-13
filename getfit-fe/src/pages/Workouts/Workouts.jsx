import './Workouts.scss'
import React, { useEffect, useRef, useState } from 'react'
import LargePopup from './../../components/LargePopup/LargePopup'
import axios from 'axios'

const Workouts = (prop) => {
  const userID = useRef()
  const [popup, setPopup] = useState(<></>)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [exercisesDisplayed, setExercisesDisplayed] = useState([])

  useEffect(() => {
    // Check for current session
    axios.get("http://localhost:3001/users/login").then(res => {
      userID.current = res.data.user

      // Get user data if logged in
      if (res.data.loggedIn) {
        axios.get("http://localhost:3001/exercises/get-all?userID="+userID.current).then(res => {
          setExercisesDisplayed(res.data)
        })
      } else {
        window.location.href = '/' // TODO: change to error page when created
      }
    })
  }, [])

  const logExerciseClicked = (exerciseID, weight, sets, reps) => {
    setPopup(<LargePopup popup={'LogExercise'} setIsPopupOpen={setIsPopupOpen} logExercise={logExercise} exerciseid={exerciseID} weight={weight} sets={sets} reps={reps} />)
    setIsPopupOpen(true)
  }

  const logExercise = (exerciseID, weight, sets, reps) => {
    console.log("Inserting values "+weight+" "+sets+" "+reps+" "+" for "+exerciseID);
    axios.post("http://localhost:3001/exercise/update-history", {
      "exerciseID": exerciseID,
      "weight": weight,
      "sets": sets,
      "reps": reps
    }, {
      "content-type": "application/json"
    }).then(() => {
      axios.get("http://localhost:3001/exercises/get-all?userID="+userID.current).then(res => {
        setExercisesDisplayed(res.data)
        setIsPopupOpen(false)
      })
    })
  }

  return (
    <div className="Workouts-wrapper">
      {isPopupOpen ? popup : <></>}
      {exercisesDisplayed ?
        exercisesDisplayed.map(exercise => {
          return (
          <div onClick={() => logExerciseClicked(exercise.exerciseid, exercise.weight, exercise.sets, exercise.reps)}>
            {exercise.name +", Weight: "+exercise.weight}
          </div>)
        })
      :
        <></>
      }
    </div>
  )
}

export default Workouts