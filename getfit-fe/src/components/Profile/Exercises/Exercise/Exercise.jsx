import './Exercise.scss'
import React from 'react'

function Exercise(props) {

  return (
    <div className="exercise-wrapper">
      <div className="exercise-container">
        <div className="exercise-img-container">
          <img src={props.picture} alt='Profile' />
        </div>
        <div className="exercise-info-container">
          <div className="exercise-name">{props.name}</div>
          <div className="exercise-text">Last Completed:</div>
          <div className="exercise-history-container">
            <div className="exercise-history">
              {props.weight} 
              <div className="exercise-history-label">
                Weight
              </div>
            </div>
            <div className="vertical-line"></div>
            <div className="exercise-history">
              {props.sets}
              <div className="exercise-history-label">
                Sets
              </div>
            </div>
            <div className="vertical-line"></div>
            <div className="exercise-history">
              {props.reps}
              <div className="exercise-history-label">
                Reps
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Exercise