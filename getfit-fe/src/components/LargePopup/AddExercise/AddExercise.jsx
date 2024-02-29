import './AddExercise.scss'
import React, { useState } from 'react'
import { v4 } from 'uuid'
import { storage } from '../../../Firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import LabelInput from '../../Inputs/LineInput/LabelInput'
import DefaultPicture from './.././../../images/Default_Exercise.png'
import ButtonFill from '../../Buttons/ButtonFill/ButtonFill'
import ButtonNoFill from '../../Buttons/ButtonNoFill/ButtonNoFill'
import SelectOrAddCategory from '../../SelectOrAddCategory/SelectOrAddCategory'

const AddExercise = (props) => {
  const [name, setName] = useState()
  const [picture, setPicture] = useState(DefaultPicture)
  const [weight, setWeight] = useState()
  const [sets, setSets] = useState()
  const [reps, setReps] = useState()
  const [categories, setCategories] = useState([])
  const [file, setFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [saveMessage, setSaveMessage] = useState('')

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

  const saveExercise = (name, weight, sets, reps) => {
    let isValidAndName = validateFormatInputs(name, weight, sets, reps)

    // Ensure inputs are correctly formatted
    if (isValidAndName[0]) {
      setSaveMessage('Saving...')
      var exerciseID = v4()
      var pictureUrl = 'https://firebasestorage.googleapis.com/v0/b/getfit-5d057.appspot.com/o/exercisePictures%2FDefault_Exercise.png?alt=media&token=3d89bc09-dfa0-4c5b-871f-a1a254e44ca7'
      // If file was changed, upload selected phot to firebase and get the url before posting to DB
      if (file !== null) {
        const imageRef = ref(storage, `exercisePictures/${exerciseID}`)
        uploadBytes(imageRef, file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            pictureUrl = url
          }).then(() => {
            // Save the new userInfo after the image has uploaded and url has been retrieved
            props.saveExercise(exerciseID, isValidAndName[1], pictureUrl, categories, weight, sets, reps)
          })
        })
      } else {
        // Save the new userInfo after the image has uploaded
        props.saveExercise(exerciseID, isValidAndName[1], pictureUrl, categories, weight, sets, reps)
      }
    }
  }

  const validateFormatInputs = (name, weight, sets, reps) => {
    // Reset error message
    setErrorMessage('')

    // Validate that name isnt too long, and then capitalize it properly
    if(name !== undefined) {
      if (name.length > 50) {
        setErrorMessage('Name is too long')
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

    var isNumber = /^\d+$/

    // Validate that weight contains only numbers
    if (weight !== undefined) {
      if (!isNumber.test(weight)) {
        setErrorMessage('Invalid weight')
        return false
      }
    }

    // Verify that sets contains only numbers
    if (sets !== undefined) {
      if (!isNumber.test(sets)) {
        setErrorMessage('Invalid sets')
        return false
      }
    }

    // Verify that reps contains only numbers
    if (reps !== undefined) {
      if (!isNumber.test(reps)) {
        setErrorMessage('Invalid reps')
        return false
      }
    }    

    return [true, name]
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
      <div className="add-exercise-category-container">
        <SelectOrAddCategory setCategories={setCategories} categories={categories} />
      </div>
      <div className="add-exercise-btns-container">
        <div className="add-exercise-btn">
          <ButtonNoFill value={'Cancel'} onClick={() => props.setIsAddingExercise(false)} color={'red'} />
        </div>
        <div className="add-exercise-btn">
          <ButtonFill value={'Save'} onClick={() => saveExercise(name, weight, sets, reps)} />
        </div>
      </div>
      <div className="add-exercise-message error">
        {errorMessage}
      </div>
      <div className="add-exercise-message saving">
        {saveMessage}
      </div>
    </div>
  )
}

export default AddExercise