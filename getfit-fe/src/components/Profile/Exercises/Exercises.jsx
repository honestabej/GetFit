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
  const sortOptions = [<span>A-Z</span>, <span>Recently Added</span>, <span>Recently Updated</span>] // TODO: Add "<span>Recently Completed</span>" to this array after completed feature is added

  useEffect(() => {
    // Get all of user's exercises
    axios.get("http://localhost:3001/exercises/get-all?userID="+props.userid).then(res => {
      setExercises(res.data)
      setCurrentCategory('All')
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
    categories = formatCategories(categories)
    
    axios.post("http://localhost:3001/exercise/create", {
      "userID": props.userid,
      "exerciseID": exerciseID,
      "name": name,
      "picture": picture,
      "categories": categories,
      "weight": weight,
      "reps": reps, 
      "sets": sets
    }, {
      "content-type": "application/json"
    }).then(() => {
      axios.get("http://localhost:3001/exercises/get-all?userID="+props.userid).then(res => {
        setExercises(res.data)
        setCurrentCategory('All')
        setIsAddingExercise(false)
      }).then(() => {
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
      })
    })
  }

  // Edit an exercise
  const editExerciseClicked = (exerciseID, name, picture, categories, weight, sets, reps) => {
    setEditingPopup(<LargePopup popup={'EditExercise'} setIsEditingExercise={setIsEditingExercise} editExercise={editExercise} deleteExercise={deleteExercise} exerciseid={exerciseID} name={name} picture={picture} categories={categories} weight={weight} sets={sets} reps={reps} />)
    setIsEditingExercise(true)
  }

  const editExercise = (exerciseID, name, picture, categories, weight, sets, reps, isExerciseInfoChanged, isExerciseHistoryChanged) => {
    categories = formatCategories(categories)
    
    if (isExerciseInfoChanged) {
      axios.put("http://localhost:3001/exercise/update-info", {
        "exerciseID": exerciseID, 
        "name": name,
        "picture": picture,
        "categories": categories
      }, {
        "content-type": "application/json"
      }).then(() => {
        axios.get("http://localhost:3001/exercises/get-all?userID="+props.userid).then(res => {
          setExercises(res.data)
          setCurrentCategory('All')
        }).then(() => {
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
        axios.get("http://localhost:3001/exercises/get-all?userID="+props.userid).then(res => {
          setExercises(res.data)
          setCurrentCategory('All')
        }).then(() => {
          axios.get("http://localhost:3001/exercises/get-categories?userID="+props.userid).then(res => {
            let retCategories = [<span>All</span>] // Set default array
            if(res.data.length > 0) {
              for (let i = 0; i < res.data.length; i++) {
                retCategories.push(<span>{res.data[i]}</span>) // Put the categories in the span tag
              }
            }
            setCategories(retCategories)
          })
        })
      })
    }
    setIsEditingExercise(false)
  }

  // Format the categories array for postgres
  const formatCategories = (categories) => {
    let temp = '{'
    for (let i = 0; i < categories.length; i++) {
      temp += '"' +categories[i] + '"'
      if (i !== categories.length-1) {
        temp += ', '
      } 
    }
    temp += '}'
    return temp
  }

  // Delete an exercise
  const deleteExercise = (exerciseID, picture) => {
    axios.delete("http://localhost:3001/exercise/delete?exerciseID="+exerciseID).then ( res => {
      if (picture !== 'https://firebasestorage.googleapis.com/v0/b/getfit-5d057.appspot.com/o/exercisePictures%2FDefault_Exercise.png?alt=media&token=3d89bc09-dfa0-4c5b-871f-a1a254e44ca7') {
        const imageRef = ref(storage, `exercisePictures/${exerciseID}`)
        deleteObject(imageRef).catch(err => {console.log("Could not delete from firebase")})
      }
      axios.get("http://localhost:3001/exercises/get-categories?userID="+props.userid).then(res => {
        let retCategories = [<span>All</span>] // Set default array
        if(res.data.length > 0) {
          for (let i = 0; i < res.data.length; i++) {
            retCategories.push(<span>{res.data[i]}</span>) // Put the categories in the span tag
          }
        }
        setCategories(retCategories)

        // If the deleted exercise was the last of its category, reset current category to all and get all, if not stay in the current category
        if (res.data.includes(currentCategory)) {
          axios.get("http://localhost:3001/exercises/get-category?userID="+props.userid+"&category="+currentCategory).then(res => {
            setExercises(res.data)
          })
        } else {
          axios.get("http://localhost:3001/exercises/get-all?userID="+props.userid).then(res => {
            setExercises(res.data)
            setCurrentCategory('All')
          })
        }
      })
    })
    setIsEditingExercise(false)
  }

  // Display only exercises from selected category
  const displayCategory = (category) => {
    if (category !== 'All') {
      axios.get("http://localhost:3001/exercises/get-category?userID="+props.userid+"&category="+category).then(res => {
        setExercises(res.data)
      })
    } else {
      axios.get("http://localhost:3001/exercises/get-all?userID="+props.userid).then(res => {
        setExercises(res.data)
        setCurrentCategory('All')
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
    } 
    // TODO: Implement recently completed sorting after completed feature is added
    // else if (method === 'Recently Completed') {
    //   console.log('Sorting Recently Completed')
    // }
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
              <div className="exercise" key={exercise.exerciseid} onClick={() => editExerciseClicked(exercise.exerciseid, exercise.name, exercise.picture, exercise.categories, exercise.weight, exercise.sets, exercise.reps)}>
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