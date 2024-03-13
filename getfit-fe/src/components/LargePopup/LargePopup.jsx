import './LargePopup.scss'
import React from 'react'
import AddEditExercise from './AddEditExercise/AddEditExercise'
import AddWorkout from './AddWorkout/AddWorkout'
import LogExercise from './LogExercise/LogExercise'
 
const LargePopup = (props) => {
  var popup = <div>An error has occurred</div>

  if (props.popup === "Exercise") {
    popup = <AddEditExercise type={props.type} setIsPopupOpen={props.setIsPopupOpen} saveExercise={props.saveExercise} editExercise={props.editExercise} deleteExercise={props.deleteExercise} exerciseid={props.exerciseid} name={props.name} picture={props.picture} categories={props.categories}/>
  } else if (props.popup === "AddWorkout") {
    popup = <AddWorkout />
  } else if (props.popup === "LogExercise") {
    popup = <LogExercise setIsPopupOpen={props.setIsPopupOpen} logExercise={props.logExercise} exerciseid={props.exerciseid} weight={props.weight} sets={props.sets} reps={props.reps} />
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