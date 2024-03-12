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
  const [popup, setPopup] = useState(<></>)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
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

  // Open appropriate popup
  const openPopup = (type, exerciseID, name, picture, categories) => {
    if (type === 'add') {
      setPopup(<LargePopup popup={'Exercise'} type={type} setIsPopupOpen={setIsPopupOpen} saveExercise={saveExercise} exerciseid={''} name={'Exercise'} picture={'https://firebasestorage.googleapis.com/v0/b/getfit-5d057.appspot.com/o/exercisePictures%2FDefault_Exercise.png?alt=media&token=3d89bc09-dfa0-4c5b-871f-a1a254e44ca7'} categories={categories} />)
      setIsPopupOpen(true)
    } else if (type === 'edit') {
      setPopup(<LargePopup popup={'Exercise'} type={type} setIsPopupOpen={setIsPopupOpen} editExercise={editExercise} deleteExercise={deleteExercise} exerciseid={exerciseID} name={name} picture={picture} categories={categories} />)
      setIsPopupOpen(true)
    }
  }

  // Save new exercise
  const saveExercise = (exerciseID, name, picture, categories) => {
    categories = formatCategories(categories)
    
    axios.post("http://localhost:3001/exercise/create", {
      "userID": props.userid,
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
        setIsPopupOpen(false)
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
  const editExercise = (exerciseID, name, picture, categories) => {
    console.log('editing '+exerciseID)
    categories = formatCategories(categories)
    
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
        setIsPopupOpen(false)
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

  // Format the categories array for postgres
  const formatCategories = (categories) => {
    console.log(categories)
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
        deleteObject(imageRef)
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
    setIsPopupOpen(false)
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
      exercises.sort(function(a, b){
        return new Date(a.createddate) < new Date(b.createddate) ? 1 : -1
      })
    } else if (method === 'Recently Updated') {
      exercises.sort(function(a, b){
        return new Date(a.changedate) < new Date(b.changedate) ? 1 : -1
      })
    } 
    // TODO: Implement recently completed sorting after completed feature is added
    // else if (method === 'Recently Completed') {

    // }
  }

  return (
    <div className="exercises-wrapper">
      {isPopupOpen ? popup : <></> }
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
              <div className="exercise" key={exercise.exerciseid} onClick={() => openPopup('edit', exercise.exerciseid, exercise.name, exercise.picture, exercise.categories)}>
                <Exercise exerciseid={exercise.exerciseid} name={exercise.name} picture={exercise.picture} weight={exercise.weight} sets={exercise.sets} reps={exercise.reps} />
              </div>
            )
          })
        :
          <>Loading...</>
        }
      </div>
      <AddButton onClick={() => openPopup('add', 0, '', '', [])} />
    </div>
  )
}

export default Exercises