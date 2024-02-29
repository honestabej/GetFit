import './AddCategory.scss'
import React from 'react'

const AddCategory = (props) => {
  const categoryChange = (e) => {
    props.categoryAdding.current = e.target.value
  }

  return (
    <div className="add-category">
      <input type="text" placeholder='Add Category' onChange={categoryChange} /><i className="fa-solid fa-plus" onClick={() => props.addCategory(props.categoryAdding.current)}></i>
    </div>
  )
}

export default AddCategory