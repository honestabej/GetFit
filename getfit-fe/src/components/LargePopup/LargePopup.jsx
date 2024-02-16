import './LargePopup.scss'
import React from 'react'
import AddExercise from './AddExercise/AddExercise'
import AddWorkout from './AddWorkout/AddWorkout'
import EditExercise from './EditExercise/EditExercise'
import EditProfile from './EditProfile/EditProfile'
 
const LargePopup = (prop) => {
  var popup = <div>An error has occurred</div>

  if (prop.popup === "AddExercise") {
    popup = <AddExercise/>
  } else if (prop.popup === "AddWorkout") {
    popup = <AddWorkout/>
  } else if (prop.popup === "EditExercise") {
    popup = <EditExercise/>
  } else if (prop.popup === "EditProfile") {
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