import './AddExercise.scss'
import React, { useState } from 'react'
import LabelInput from '../../Inputs/LineInput/LabelInput'
import DefaultPicture from './.././../../images/Default_Exercise.png'
import ButtonFill from '../../Buttons/ButtonFill/ButtonFill'
import ButtonNoFill from '../../Buttons/ButtonNoFill/ButtonNoFill'

const AddExercise = (props) => {
  const [name, setName] = useState()
  const [picture, setPicture] = useState(DefaultPicture)
  const [weight, setWeight] = useState()
  const [sets, setSets] = useState()
  const [reps, setReps] = useState()
  const [file, setFile] = useState(null)


  const nameChange = (e) => {
    setName(e.target.value)
  }

  const exercisePictureChange = (e) => {
    setFile(e.target.files[0])
    setPicture(URL.createObjectURL(e.target.files[0]))
  }

  const weightChange = (e) => {
    setWeight(Number(e.target.value))
  }

  const setsChange = (e) => {
    setSets(Number(e.target.value))
  }

  const repsChange = (e) => {
    setReps(Number(e.target.value))
  }

  const saveExercise = (name, picture, weight, sets, reps) => {
    props.saveExercise(name, picture, weight, sets, reps)
  }

  const validateFormatInputs = (name, weight, sets, reps) => {

  }

  return (
    <div className="add-exercise-wrapper">
      <div className="add-exercise-top-row">
        <div className="add-exercise-img-container">
          <div className="add-exercise-img-overlay"></div>
          <img className="add-exercise-img" src={picture} alt='Profile' />
          <div className="add-exercise-img-icon">
            <label htmlFor="file-upload" className="add-exercise-file-upload">
              <i className="fa-solid fa-pen-to-square"></i>
            </label>
            <input type="file" id="file-upload" accept="image/*" onChange={exercisePictureChange} />
          </div>
        </div>
        <div className="add-exercise-name-input">
          <LabelInput placeholder={'Exercise'} label={'Exercise Name'} onChange={nameChange} />
        </div>
      </div>
      <div className="add-exercise-bottom-row">
        <div className="add-exercise-bottom-input">
          <LabelInput placeholder={'0'} label={'Weight'} center={'center'} onChange={weightChange} />
        </div>
        <div className="add-exercise-bottom-input">
          <LabelInput placeholder={'0'} label={'Sets'} center={'center'} onChange={setsChange} />
        </div>
        <div className="add-exercise-bottom-input">
          <LabelInput placeholder={'0'} label={'Reps'} center={'center'} onChange={repsChange} />
        </div>
      </div>
      <div className="add-exercise-btns-container">
        <div className="add-exercise-btn">
          <ButtonNoFill value={'Cancel'} onClick={() => props.setIsAddingExercise(false)} color={'red'} />
        </div>
        <div className="add-exercise-btn">
          <ButtonFill value={'Save'} onClick={() => saveExercise(name, 0, 0, 0, 0)} />
        </div>
      </div>
      {/* <div className="add-exercise-message error">
        {errorMessage}
      </div>
      <div className="add-exercise-message saving">
        {savingMessage}
      </div> */}
    </div>
  )
}

export default AddExercise