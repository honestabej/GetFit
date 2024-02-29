import './Exercises.scss'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { storage } from './../../../Firebase'
import { ref, deleteObject } from 'firebase/storage'
import AddButton from './../../Buttons/AddButton/AddButton'
import LargePopup from '../../LargePopup/LargePopup'
import Exercise from './Exercise/Exercise'
import Dropdown from '../../Dropdown/Dropdown'

function compareStrings(a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();

  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function Exercises(props) {
  const [exercises, setExercises] = useState([])
  const [editingPopup, setEditingPopup] = useState(<></>)
  const [isEditingExercise, setIsEditingExercise] = useState(false)
  const [isAddingExercise, setIsAddingExercise] = useState(false)
  const [categories, setCategories] = useState([<span>All</span>])
  const [currentCategory, setCurrentCategory] = useState('All')
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)
  const sortOptions = [<span>A-Z</span>, <span>Recently Added</span>, <span>Recently Updated</span>, <span>Recently Completed</span>]

  useEffect(() => {
    // Get all of user's exercises
    axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
      setExercises(res.data)
    })

    // Get all of user's categories
    axios.get("http://localhost:3001/exercises/get-categories?userID="+props.userid).then(res => {
      let retCategories = [<span>All</span>] // Set default array
      if(res.data.length > 0) {
        for (let i = 0; i < res.data.length; i++) {
          res.data[i] = <span>{res.data[i]}</span> // Put the categories in the span tag
        }
        retCategories = retCategories.concat(res.data) // Merge the default and get results arrays
      }
      setCategories(retCategories)
    })
  }, [setExercises, setCategories, props.userid])

  // Add an exercise
  const saveExercise = (exerciseID, name, picture, categories, weight, sets, reps) => {
    axios.post("http://localhost:3001/exercise/create", {
      "userID": props.userid,
      "exerciseID": exerciseID,
      "name": name,
      "picture": picture,
      "weight": weight,
      "reps": reps, 
      "sets": sets
    }, {
      "content-type": "application/json"
    }).then(() => {
      axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
        setExercises(res.data)
        setIsAddingExercise(false)
      })
    })
  }

  // Edit an exercise
  const editExerciseClicked = (exerciseID, name, picture, weight, sets, reps) => {
    setEditingPopup(<LargePopup popup={'EditExercise'} setIsEditingExercise={setIsEditingExercise} editExercise={editExercise} deleteExercise={deleteExercise} categories={categories} exerciseid={exerciseID} name={name} picture={picture} weight={weight} sets={sets} reps={reps} />)
    setIsEditingExercise(true)
  }

  const editExercise = (exerciseID, name, picture, weight, sets, reps, isExerciseInfoChanged, isExerciseHistoryChanged) => {
    if (isExerciseInfoChanged) {
      axios.put("http://localhost:3001/exercise/update-info", {
        "exerciseID": exerciseID, 
        "name": name,
        "picture": picture
      }, {
        "content-type": "application/json"
      }).then(() => {
        axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
          setExercises(res.data)
        })
      })
    }

    if (isExerciseHistoryChanged) {
      axios.post("http://localhost:3001/exercise/update-history", {
        "exerciseID": exerciseID,
        "weight": weight,
        "reps": reps, 
        "sets": sets
      }, {
        "content-type": "application/json"
      }).then(() => {
        axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
          setExercises(res.data)
        })
      })
    }
    setIsEditingExercise(false)
  }

  // Delete an exercise
  const deleteExercise = (exerciseID) => {
    axios.delete("http://localhost:3001/exercise/delete?exerciseID="+exerciseID).then ( res => {
      const imageRef = ref(storage, `exercisePictures/${exerciseID}`)
      deleteObject(imageRef) // TODO dont do this if image was defualt
      axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
        setExercises(res.data)
      })
    })
    setIsEditingExercise(false)
  }

  // Display only exercises from selected category
  const displayCategory = (category) => {
    if (category !== 'All') {
      axios.get("http://localhost:3001/exercise/get-category?userID="+props.userid+"&category="+category).then(res => {
        setExercises(res.data)
      })
    } else {
      axios.get("http://localhost:3001/exercise/get-all?userID="+props.userid).then(res => {
        setExercises(res.data)
      })
    }
  }

  // Sort the exercises based on the sorting method
  const sortExercises = (method) => {
    if (method === 'A-Z') {
      exercises.sort(function(a, b) {
        return compareStrings(a.name, b.name);
      })
    } else if (method === 'Recently Added') {
      console.log('Sorting Recently Added')
    } else if (method === 'Recently Updated') {
      console.log('Sorting Recently Updated')
    } else if (method === 'Recently Completed') {
      console.log('Sorting Recently Completed')
    }
  }

  return (
    <div className="exercises-wrapper">
      {isEditingExercise ? editingPopup : <></> }
      {isAddingExercise ? <LargePopup popup={'AddExercise'} setIsAddingExercise={setIsAddingExercise} saveExercise={saveExercise} categories={categories} /> : <></>}
      <div className="exercises-top-container">
        <div className="categories-container">
          Category: <span onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}>{currentCategory} <i className="fa-solid fa-angle-down"></i></span>
        </div>
        <div className="sort-container" onClick={() => setIsSortOpen(!isSortOpen)}>
          Sort <i className="fa-solid fa-sort"></i>
        </div>
      </div>
      {isCategoriesOpen ? <Dropdown type={'categories'} inArray={categories} setIsCategoriesOpen={setIsCategoriesOpen} setCurrentCategory={setCurrentCategory} displayCategory={displayCategory} /> : <></> }
      {isSortOpen ? <Dropdown type={'sort'} inArray={sortOptions} setIsSortOpen={setIsSortOpen} sortExercises={sortExercises} /> : <></> }
      <div className="exercises-container">
        {exercises ? 
          exercises.map(exercise => {
            return (
              <div className="exercise" key={exercise.exerciseid} onClick={() => editExerciseClicked(exercise.exerciseid, exercise.name, exercise.picture, exercise.weight, exercise.sets, exercise.reps)}>
                <Exercise exerciseid={exercise.exerciseid} name={exercise.name} picture={exercise.picture} weight={exercise.weight} sets={exercise.sets} reps={exercise.reps} />
              </div>
            )
          })
        :
          <>Loading...</>
        }
      </div>
      <AddButton onClick={() => setIsAddingExercise(true)} />
    </div>
  )
}

export default Exercises