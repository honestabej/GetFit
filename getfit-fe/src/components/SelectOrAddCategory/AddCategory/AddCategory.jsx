import './AddCategory.scss'
import React, { useRef } from 'react'

const AddCategory = (props) => {
  const categoryAdding = useRef('') 

  const categoryChange = (e) => {
    if (e.target.value === '') {
      categoryAdding.current = ''
    } else {
      categoryAdding.current = e.target.value
    }
  }

  return (
    <div className="add-category">
      <input type="text" placeholder='Add Category' onChange={categoryChange} /><i className="fa-solid fa-plus" onClick={() => props.addCategory(categoryAdding.current)}></i>
    </div>
  )
}

export default AddCategory