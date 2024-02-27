import './EditExercise.scss'
import React, { useState } from 'react'
import { storage } from './../../../Firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import LabelInput from '../../Inputs/LineInput/LabelInput'
import DefaultPicture from './.././../../images/Default_Exercise.png'
import ButtonFill from '../../Buttons/ButtonFill/ButtonFill'
import ButtonNoFill from '../../Buttons/ButtonNoFill/ButtonNoFill'

const EditExercise = (props) => {
  const [exercisePictureDisplay, setExercisePictureDisplay] = useState(props.picture)
  const [name, setName] = useState()
  const [file, setFile] = useState(null)
  const [weight, setWeight] = useState()
  const [sets, setSets] = useState()
  const [reps, setReps] = useState()
  const [errorMessage, setErrorMessage] = useState('')
  const [savingMessage, setSavingMessage] = useState('')
  let exercisePicture

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

  const editExercise = () => {
    let isValid = verifyInputs(name, weight, sets, reps)

    if (isValid) {
      setSavingMessage('Saving...')

      if (file !== null) {
        // Upload exercise image to DB
        const imageRef = ref(storage, `exercisePictures/${props.exerciseid}`)
        uploadBytes(imageRef, file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            exercisePicture = url
          }).then(() => {
            props.editExercise(props.exerciseid, name, exercisePicture, true, weight, sets, reps)
            props.setIsEditExercise(false)
          })
        })
      } else {
        props.editExercise(props.exerciseid, name, props.picture, false, weight, sets, reps)
        props.setIsEditExercise(false)
      }
    }
  }

  const verifyInputs = (name, weight, sets, reps) => {
    setErrorMessage('')
    
    // Verfiy the name is less than 30 characters, and is capitalized properly
    if(name !== undefined) {
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
    }

    // Verify that the weight is a number
    var isNumber = /^\d+$/
    if (weight !== undefined) {
      if (!isNumber.test(weight)) {
        setErrorMessage('Invalid weight')
        return false
      }
    }

    // Verify that the sets are a number
    if (sets !== undefined) {
      if (!isNumber.test(sets)) {
        setErrorMessage('Invalid sets')
        return false
      }
    }

    // Verify that the reps are a number
    if (reps !== undefined) {
      if (!isNumber.test(reps)) {
        setErrorMessage('Invalid reps')
        return false
      }
    }

    return true
  }

  return (
    <div className="edit-exercise-wrapper">
      <div className="edit-exercise-top-row">
        <div className="edit-exercise-img-container">
          <div className="edit-exercise-img-overlay"></div>
          <img className="edit-exercise-img" src={exercisePictureDisplay} alt='Profile' />
          <div className="edit-exercise-img-icon">
            <label htmlFor="file-upload" className="edit-exercise-file-upload">
              <i className="fa-solid fa-pen-to-square"></i>
            </label>
            <input type="file" id="file-upload" accept="image/*" onChange={exercisePictureChange} />
          </div>
        </div>
        <div className="edit-exercise-name-input">
          <LabelInput placeholder={props.name} label={'Exercise Name'} onChange={nameChange} />
        </div>
      </div>
      <div className="edit-exercise-bottom-row">
        <div className="edit-exercise-bottom-input">
          <LabelInput placeholder={props.weight} label={'Weight'} center={'center'} onChange={weightChange} />
        </div>
        <div className="edit-exercise-bottom-input">
          <LabelInput placeholder={props.sets} label={'Sets'} center={'center'} onChange={setsChange} />
        </div>
        <div className="edit-exercise-bottom-input">
          <LabelInput placeholder={props.reps} label={'Reps'} center={'center'} onChange={repsChange} />
        </div>
      </div>
      <div className="edit-exercise-btns-container">
        <div className="edit-exercise-btn">
          <ButtonNoFill value={'Cancel'} onClick={() => props.setIsEditExercise(false)} color={'red'} />
        </div>
        <div className="edit-exercise-btn">
          <ButtonFill value={'Save'} onClick={editExercise} />
        </div>
      </div>
      <div className="edit-exercise-message error">
        {errorMessage}
      </div>
      <div className="edit-exercise-message saving">
        {savingMessage}
      </div>
    </div>
  )
}

export default EditExercise