import './AddExercise.scss'
import React, { useState } from 'react'
import { v4 } from 'uuid'
import { storage } from './../../../Firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import LabelInput from '../../Inputs/LineInput/LabelInput'
import DefaultPicture from './.././../../images/Default_Exercise.png'
import ButtonFill from '../../Buttons/ButtonFill/ButtonFill'
import ButtonNoFill from '../../Buttons/ButtonNoFill/ButtonNoFill'

const AddExercise = (props) => {
  const [exercisePictureDisplay, setExercisePictureDisplay] = useState(DefaultPicture)
  const [name, setName] = useState('')
  const [file, setFile] = useState(null)
  const [weight, setWeight] = useState(0)
  const [sets, setSets] = useState(0)
  const [reps, setReps] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [savingMessage, setSavingMessage] = useState('')
  let exercisePicture = 'https://firebasestorage.googleapis.com/v0/b/getfit-5d057.appspot.com/o/exercisePictures%2FDefault_Exercise.png?alt=media&token=3d89bc09-dfa0-4c5b-871f-a1a254e44ca7'

  const nameChange = (e) => {
    setName(e.target.value)
  }

  const exercisePictureChange = (e) => {
    setFile(e.target.files[0])
    setExercisePictureDisplay(URL.createObjectURL(e.target.files[0]))
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

  const addExercise = () => {
    let isValid = verifyInputs(name, weight, sets, reps)

    if (isValid) {
      let exerciseID = v4()
      setSavingMessage('Saving...')

      if (file !== null) {
        // Upload exercise image to DB
        const imageRef = ref(storage, `exercisePictures/${exerciseID}`)
        uploadBytes(imageRef, file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            exercisePicture = url
          }).then(() => {
            props.addExercise(exerciseID, name, exercisePicture, weight, sets, reps)
            props.setIsAddExercise(false)
          })
        })
      } else {
        props.addExercise(exerciseID, name, exercisePicture, weight, sets, reps)
        props.setIsAddExercise(false)
      }
    }
  }

  const verifyInputs = (name, weight, sets, reps) => {
    setErrorMessage('')
    
    // Verfiy the name is not empty is less than 30 characters, and is capitalized properly
    if (name === '' || name === undefined) {
      setErrorMessage('Fill out all fields')
      return false
    }

    if (name.length > 30) {
      setErrorMessage('Exercise name is too long')
      return false
    }

    // Get rid of space at end if it is there
    let newName = name.trim() 

    const nameSplit = newName.split(' ')
    for (let i = 0; i < nameSplit.length; i++) {
      nameSplit[i] = nameSplit[i][0].toUpperCase() + nameSplit[i].substr(1)
    }
    name = nameSplit.join(' ')

    // Verify that the weight is not empty and is a number
    if (weight === '' || weight === undefined) {
      setErrorMessage('Fill out all fields')
      return false
    }

    var isNumber = /^\d+$/
    if (!isNumber.test(weight)) {
      setErrorMessage('Invalid weight')
      return false
    }

    // Verify that the sets are not empty and is a number
    if (sets === '' || sets === undefined) {
      setErrorMessage('Fill out all fields')
      return false
    }

    if (!isNumber.test(sets)) {
      setErrorMessage('Invalid sets')
      return false
    }

    // Verify that the reps are not empty and is a number
    if (reps === '' || reps === undefined) {
      setErrorMessage('Fill out all fields')
      return false
    }

    if (!isNumber.test(reps)) {
      setErrorMessage('Invalid reps')
      return false
    }

    return true
  }

  return (
    <div className="add-exercise-wrapper">
      <div className="add-exercise-top-row">
        <div className="add-exercise-img-container">
          <div className="add-exercise-img-overlay"></div>
          <img className="add-exercise-img" src={exercisePictureDisplay} alt='Profile' />
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
          <ButtonNoFill value={'Cancel'} onClick={() => props.setIsAddExercise(false)} color={'red'} />
        </div>
        <div className="add-exercise-btn">
          <ButtonFill value={'Save'} onClick={addExercise} />
        </div>
      </div>
      <div className="add-exercise-message error">
        {errorMessage}
      </div>
      <div className="add-exercise-message saving">
        {savingMessage}
      </div>
    </div>
  )
}

export default AddExercise