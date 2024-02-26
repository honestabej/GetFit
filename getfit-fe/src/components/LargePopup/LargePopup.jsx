import './LargePopup.scss'
import React from 'react'
import AddExercise from './AddExercise/AddExercise'
import AddWorkout from './AddWorkout/AddWorkout'
import EditExercise from './EditExercise/EditExercise'
import EditProfile from './EditProfile/EditProfile'
 
const LargePopup = (props) => {
  var popup = <div>An error has occurred</div>

  if (props.popup === "AddExercise") {
    popup = <AddExercise setIsAddExercise={props.setIsAddExercise} addExercise={props.addExercise} />
  } else if (props.popup === "AddWorkout") {
    popup = <AddWorkout/>
  } else if (props.popup === "EditExercise") {
    popup = <EditExercise/>
  } else if (props.popup === "EditProfile") {
    popup = <EditProfile/>
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