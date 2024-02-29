import './EditExercise.scss'
import React, { useEffect, useState } from 'react'
import { storage } from './../../../Firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import LabelInput from '../../Inputs/LineInput/LabelInput'
import ButtonFill from '../../Buttons/ButtonFill/ButtonFill'
import ButtonNoFill from '../../Buttons/ButtonNoFill/ButtonNoFill'
import SelectOrAddCategory from '../../SelectOrAddCategory/SelectOrAddCategory'

const EditExercise = (props) => {
  const [name, setName] = useState(props.name)
  const [picture, setPicture] = useState(props.picture)
  const [weight, setWeight] = useState(props.weight)
  const [sets, setSets] = useState(props.sets)
  const [reps, setReps] = useState(props.reps)
  const [categories, setCategories] = useState(props.categories)
  const [file, setFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [savingMessage, setSavingMessage] = useState('')

  const nameChange = (e) => {
    if (e.target.value === '') {
      setName(props.name)
    } else {
      setName(e.target.value)
    }
  }

  const exercisePictureChange = (e) => {
    setFile(e.target.files[0])
    setPicture(URL.createObjectURL(e.target.files[0]))
  }

  const weightChange = (e) => {
    if (e.target.value === '') {
      setWeight(props.weight)
    } else {
      setWeight(Number(e.target.value))
    }
  }

  const setsChange = (e) => {
    if (e.target.value === '') {
      setSets(props.sets)
    } else {
      setSets(Number(e.target.value)) 
    }
  }

  const repsChange = (e) => {
    if (e.target.value === '') {
      setReps(props.reps)
    } else {
      setReps(Number(e.target.value))
    }
  }

  const editExercise = (exerciseID, name, picture, categories, weight, sets, reps) => {
    let isValidAndName = validateFormatInputs(name, picture, categories, weight, sets, reps)

    if (isValidAndName.isValid) {
      setSavingMessage('Saving...')

      if (file !== null) {
        // Upload exercise image to DB
        const imageRef = ref(storage, `exercisePictures/${exerciseID}`)
        uploadBytes(imageRef, file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            picture = url
          }).then(() => {
            props.editExercise(exerciseID, isValidAndName.name, picture, weight, categories, sets, reps, isValidAndName.isExerciseInfoChanged, isValidAndName.isExerciseHistoryChanged)
          })
        })
      } else {
        props.editExercise(exerciseID, isValidAndName.name, picture, categories, weight, sets, reps, isValidAndName.isExerciseInfoChanged, isValidAndName.isExerciseHistoryChanged)
      }
    }
  }

  const validateFormatInputs = (name, picture, categories, weight, sets, reps) => {
    setErrorMessage('')
    let isExerciseInfoChanged = false
    let isExerciseHistoryChanged = false
    
    // Verfiy the name is less than 30 characters, and is capitalized properly
    if (name.length > 30) {
      setErrorMessage('Exercise name is too long')
      return {'isValid': false}
    }

    // Get rid of space at end if it is there
    let newName = name.trim() 
    const nameSplit = newName.split(' ')
    for (let i = 0; i < nameSplit.length; i++) {
      nameSplit[i] = nameSplit[i][0].toUpperCase() + nameSplit[i].substr(1)
    }
    name = nameSplit.join(' ')
    

    // Verify that the weight is a number
    var isNumber = /^\d+$/
    if (!isNumber.test(weight)) {
      setErrorMessage('Invalid weight')
      return {'isValid': false}
    }

    // Verify that the sets are a number
    if (!isNumber.test(sets)) {
      setErrorMessage('Invalid sets')
      return {'isValid': false}
    }

    // Verify that the reps are a number
    if (!isNumber.test(reps)) {
      setErrorMessage('Invalid reps')
      return {'isValid': false}
    }

    // Check if exercise info has changed
    if (name !== props.name || picture !== props.picture || categories !== props.categories) {
      isExerciseInfoChanged = true
    }

    // Check if exercise history has changed
    if (weight !== props.weight || sets !== props.sets || reps !== props.reps) {
      isExerciseHistoryChanged = true
    }

    return {isValid: true, 'name': name, 'isExerciseInfoChanged': isExerciseInfoChanged, 'isExerciseHistoryChanged': isExerciseHistoryChanged}
  }

  return (
    <div className="edit-exercise-wrapper">
      <div className="edit-exercise-delete" onClick={() => props.deleteExercise(props.exerciseid, props.picture)} ><i className="fa-solid fa-trash"></i></div>
      <div className="edit-exercise-top-row">
        <div className="edit-exercise-img-container">
          <div className="edit-exercise-img-overlay"></div>
          <img className="edit-exercise-img" src={picture} alt='Profile' />
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
      <div className="edit-exercise-category-container">
        <SelectOrAddCategory setCategories={setCategories} categories={categories} sets={sets} />
      </div>
      <div className="edit-exercise-btns-container">
        <div className="edit-exercise-btn">
          <ButtonNoFill value={'Cancel'} onClick={() => props.setIsEditingExercise(false)} color={'red'} />
        </div>
        <div className="edit-exercise-btn">
          <ButtonFill value={'Save'} onClick={() => editExercise(props.exerciseid, name, picture, categories, weight, sets, reps)} />
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