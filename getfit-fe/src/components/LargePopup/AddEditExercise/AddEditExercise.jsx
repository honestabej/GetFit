import './AddEditExercise.scss'
import React, { useState } from 'react'
import { v4 } from 'uuid'
import { storage } from '../../../Firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import LabelInput from '../../Inputs/LineInput/LabelInput'
import ButtonFill from '../../Buttons/ButtonFill/ButtonFill'
import ButtonNoFill from '../../Buttons/ButtonNoFill/ButtonNoFill'
import SelectOrAddCategory from '../../SelectOrAddCategory/SelectOrAddCategory'

const AddEditExercise = (props) => {
  const [name, setName] = useState(props.name)
  const [picture, setPicture] = useState(props.picture)
  const [categories, setCategories] = useState(props.categories)
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [messageClass, setMessageClass] = useState('')

  const nameChange = (e) => {
    setName(e.target.value)
  }

  const exercisePictureChange = (e) => {
    setFile(e.target.files[0])
    setPicture(URL.createObjectURL(e.target.files[0]))
  }

  // Save new exercise
  const saveExercise = () => {
    let isValidAndName = formatName(name)

    // Ensure inputs are correctly formatted
    if (isValidAndName[0]) {
      setMessage('Saving...')
      setMessageClass('saving')
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
            props.saveExercise(exerciseID, isValidAndName[1], pictureUrl, categories)
          })
        })
      } else {
        // Save the new userInfo after the image has uploaded
        props.saveExercise(exerciseID, isValidAndName[1], pictureUrl, categories)
      }
    }
  }

  // Edit an exercise
  const editExercise = () => {
    let isValidAndName = formatName(name)

    // Ensure inputs are correctly formatted
    if (isValidAndName[0]) {
      setMessage('Saving...')
      setMessageClass('saving')
      let pictureUrl = props.picture

      if (file !== null) {
        // Upload exercise image to DB
        const imageRef = ref(storage, `exercisePictures/${props.exerciseid}`)
        uploadBytes(imageRef, file).then((snapshot) => {
          getDownloadURL(snapshot.ref).then((url) => {
            pictureUrl = url
          }).then(() => {
            props.editExercise(props.exerciseid, isValidAndName[1], pictureUrl, categories)
          })
        })
      } else {
        props.editExercise(props.exerciseid, isValidAndName[1], pictureUrl, categories)
      }
    }
  }

  const formatName = (name) => {
    // Reset error message
    setMessage('')
    setMessageClass('')

    // Validate that name isnt too long, and then capitalize it properly
    if(name !== undefined) {
      if (name.length > 50) {
        setMessage('Name is too long')
        setMessageClass('error')
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

    return [true, name]
  }

  return (
    <div className="add-edit-exercise-wrapper">
      {props.type === 'add' ? <></> : <div className="add-edit-exercise-delete" onClick={() => props.deleteExercise(props.exerciseid, props.picture)} ><i className="fa-solid fa-trash"></i></div>}
      <div className="add-edit-exercise-top-row">
        <div className="add-edit-exercise-img-container">
          <div className="add-edit-exercise-img-overlay"></div>
          <img className="add-edit-exercise-img" src={picture} alt='Profile' />
          <div className="add-edit-exercise-img-icon">
            <label htmlFor="file-upload"> <i className="fa-solid fa-pen-to-square"></i> </label>
            <input type="file" id="file-upload" accept="image/*" onChange={exercisePictureChange} />
          </div>
        </div>
        <div className="add-edit-inputs-container">
          <div className={"add-edit-exercise-name-input "+props.type}>
            <LabelInput placeholder={props.name} label={''} onChange={nameChange} />
          </div>
          <div className="add-edit-exercise-category-container">
            <SelectOrAddCategory setCategories={setCategories} categories={categories} />
          </div>
        </div>
      </div>
      <div className="add-edit-exercise-btns-container">
        <div className="add-edit-exercise-btn">
          <ButtonNoFill value={'Cancel'} onClick={() => props.setIsPopupOpen(false)} color={'red'} />
        </div>
        <div className="add-edit-exercise-btn">
          {props.type === 'add' ? <ButtonFill value={'Save'} onClick={() => saveExercise()} /> : <ButtonFill value={'Save'} onClick={() => editExercise()} />}
        </div>
      </div>
      <div className={"add-edit-exercise-message "+messageClass}>
        {message}
      </div>
    </div>
  )
}

export default AddEditExercise