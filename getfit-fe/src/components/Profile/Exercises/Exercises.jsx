import './Exercises.scss'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { storage } from './../../../Firebase'
import { ref, deleteObject } from 'firebase/storage'
import AddButton from './../../Buttons/AddButton/AddButton'
import LargePopup from '../../LargePopup/LargePopup'

function Exercises(props) {
  const [exercises, setExercises] = useState([])
  const [editingPopup, setEditingPopup] = useState(<></>)
  const [isEditingExercise, setIsEditingExercise] = useState(false)
  const [isAddingExercise, setIsAddingExercise] = useState(false)

  useEffect(() => {
    // Get all of user's exercises
    axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
      console.log("Exercises retrieved")
      setExercises(res.data)
    })
  }, [setExercises])

  // Add an exercise
  const saveExercise = (exerciseID, name, picture, weight, sets, reps) => {
    axios.post("http://localhost:3001/exercise/create", {
      "userID": props.userid,
      "exerciseID": exerciseID,
      "name": name,
      "picture": picture,
      "weight": weight,
      "reps": reps, 
      "sets": sets
    }, {
      "content-type": "application/json"
    }).then(() => {
      axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
        console.log("Exercises retrieved")
        setExercises(res.data)
        setIsAddingExercise(false)
      })
    })
  }

  // Edit an exercise
  const editExerciseClicked = (exerciseID, name, picture, weight, sets, reps) => {
    setEditingPopup(<LargePopup popup={'EditExercise'} setIsEditingExercise={setIsEditingExercise} editExercise={editExercise} exerciseid={exerciseID} name={name} picture={picture} weight={weight} sets={sets} reps={reps} />)
    setIsEditingExercise(true)
  }

  const editExercise = (exerciseID, name, picture, weight, sets, reps, isExerciseInfoChanged, isExerciseHistoryChanged) => {
    if (isExerciseInfoChanged) {
      axios.put("http://localhost:3001/exercise/update-info", {
        "exerciseID": exerciseID, 
        "name": name,
        "picture": picture
      }, {
        "content-type": "application/json"
      }).then(() => {
        axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
          console.log("Exercises retrieved")
          setExercises(res.data)
        })
      })
    }

    if (isExerciseHistoryChanged) {
      axios.post("http://localhost:3001/exercise/update-history", {
        "exerciseID": exerciseID,
        "weight": weight,
        "reps": reps, 
        "sets": sets
      }, {
        "content-type": "application/json"
      }).then(() => {
        axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
          console.log("Exercises retrieved")
          setExercises(res.data)
        })
      })
    }

    setIsEditingExercise(false)
  }

  // Delete and exercise
  const deleteExercise = (exerciseID) => {
    // TODO: Delete image from firebase
    axios.delete("http://localhost:3001/exercise/delete?exerciseID="+exerciseID).then ( res => {
      const imageRef = ref(storage, `exercisePictures/${exerciseID}`)
      deleteObject(imageRef)
      axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
        setExercises(res.data)
        // TODO handle category stuff
      })
    })
  }

  return (
    <div className="exercises-wrapper">
      {isEditingExercise ? editingPopup : <></> }
      {isAddingExercise ? <LargePopup popup={'AddExercise'} setIsAddingExercise={setIsAddingExercise} saveExercise={saveExercise} /> : <></>}
      {exercises ? 
        exercises.map(exercise => {
          return (
            <div key={exercise.exerciseid} >
              Name: {exercise.name} 
              Weight: {exercise.weight}
              <button onClick={() => editExerciseClicked(exercise.exerciseid, exercise.name, exercise.picture, exercise.weight, exercise.sets, exercise.reps)}>Edit</button>
              <button onClick={() => deleteExercise(exercise.exerciseid)} >Delete</button>
            </div>
          )
        })
      :
        <>Loading...</>
      }
      <AddButton onClick={() => setIsAddingExercise(true)} />
    </div>
  )
}

export default Exercises