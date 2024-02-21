import './WorkoutButton.scss'
import React from 'react'

function WorkouButton(props) {

  return (
    <div className="workout-button">
      <button onClick={props.onClick}>
        <i className="fa-solid fa-person-running icon"></i>{props.value}
      </button>
    </div>
  )
}
export default WorkouButton