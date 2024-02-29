import './Category.scss'
import React from 'react'

const Category = (props) => {
  return (
    <div className="category-wrapper">
      <div className="category">{props.category}</div><i className="fa-solid fa-trash" onClick={() => props.deleteCategory(props.category)}></i>
    </div>
  )
}

export default Category