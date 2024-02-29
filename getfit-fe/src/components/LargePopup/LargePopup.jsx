import './LargePopup.scss'
import React from 'react'
import AddExercise from './AddExercise/AddExercise'
import AddWorkout from './AddWorkout/AddWorkout'
import EditExercise from './EditExercise/EditExercise'
import EditProfile from './EditProfile/EditProfile'
 
const LargePopup = (props) => {
  var popup = <div>An error has occurred</div>

  if (props.popup === "AddExercise") {
    popup = <AddExercise setIsAddingExercise={props.setIsAddingExercise} saveExercise={props.saveExercise} categories={props.categories} />
  } else if (props.popup === "AddWorkout") {
    popup = <AddWorkout />
  } else if (props.popup === "EditExercise") {
    popup = <EditExercise popup={'EditExercise'} setIsEditingExercise={props.setIsEditingExercise} editExercise={props.editExercise} deleteExercise={props.deleteExercise} categories={props.categories} exerciseid={props.exerciseid} name={props.name} picture={props.picture} weight={props.weight} sets={props.sets} reps={props.reps} />
  } else if (props.popup === "EditProfile") {
    popup = <EditProfile />
  }

  return (
    <div className="large-popup-wrapper">
      <div className="large-popup-container">
        {popup}
      </div>
    </div>
  )
}

export default LargePopup