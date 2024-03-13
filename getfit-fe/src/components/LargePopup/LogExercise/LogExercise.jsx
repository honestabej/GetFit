import './LogExercise.scss'
import React from 'react'

const LogExercise = (props) => {

  return (
    <div className="log-exercise-wrapper">
      <button onClick={() => props.setIsPopupOpen(false)}>cancel</button>
      <button onClick={() => props.logExercise(props.exerciseid, 2, 2, 2)}>Save with 2s</button>
    </div>
  )
}

export default LogExercise