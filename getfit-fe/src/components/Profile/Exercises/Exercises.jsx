import './Exercises.scss'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AddButton from './../../Buttons/AddButton/AddButton'
import LargePopup from '../../LargePopup/LargePopup'

function Exercises(props) {
  const [exercises, setExercises] = useState()
  const [isEditingExercise, setIsEditingExercise] = useState(false)
  const [isAddingExercise, setIsAddingExercise] = useState(false)

  useEffect(() => {
    // console.log("Exercises rendered with "+props.userid)
    // Get all of user's exercises
    axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
      console.log("Exercises retrieved")
      setExercises(res.data)
    })
  }, [setExercises])

  // Add an exercise
  const saveExercise = (name, picture, weight, sets, reps) => {
    console.log(name)
    setIsAddingExercise(false)
  }

  // Edit an exercise

  // Delete and exercise
  const deleteExercise = (exerciseID) => {
    axios.delete("http://localhost:3001/exercise/delete?exerciseID="+exerciseID).then ( res => {
      axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
        setExercises(res.data)
        // TODO handle category stuff
      })
    })
  }


  return (
    <div className="exercises-wrapper">
      {isEditingExercise ? <LargePopup popup={'EditExercise'} /> : <></> }
      {isAddingExercise ? <LargePopup popup={'AddExercise'} setIsAddingExercise={setIsAddingExercise} saveExercise={saveExercise} /> : <></>}
      {exercises ? 
        exercises.map(exercise => {
          return (
            <div key={exercise.exerciseid} >
              Name: {exercise.name} 
              <button onClick={() => setIsEditingExercise(true)}>Edit</button>
              <button>Delete</button>
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