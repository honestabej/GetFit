import './Exercises.scss'
import React, { useEffect, useState } from 'react'
import AddButton from './../../Buttons/AddButton/AddButton'

function Exercises(props) {
  // eslint-disable-next-line
  const [exercises, setExercises] = useState(props.exercises)

  useEffect(() => {
    setExercises(props.exercises)
  }, [setExercises, props.exercises])


  return (
    <div className="exercises-wrapper">
      {exercises.map(exercise => {
        return <>Name: {exercise.name} End<br/></>
      })}
      {props.from}
      <AddButton onClick={() => props.setIsAddExercise(true)} />
    </div>
  )
}

export default Exercises