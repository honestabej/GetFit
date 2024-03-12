import './LargePopup.scss'
import React from 'react'
import AddEditExercise from './AddEditExercise/AddEditExercise'
import AddWorkout from './AddWorkout/AddWorkout'
 
const LargePopup = (props) => {
  var popup = <div>An error has occurred</div>

  if (props.popup === "Exercise") {
    popup = <AddEditExercise type={props.type} setIsPopupOpen={props.setIsPopupOpen} saveExercise={props.saveExercise} editExercise={props.editExercise} deleteExercise={props.deleteExercise} exerciseid={props.exerciseid} name={props.name} picture={props.picture} categories={props.categories}/>
  } else if (props.popup === "AddWorkout") {
    popup = <AddWorkout />
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