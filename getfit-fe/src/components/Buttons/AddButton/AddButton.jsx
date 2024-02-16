import './AddButton.scss'
import React from 'react'

const AddButton = (prop) => {
  return (
    <div className="add-button">
      <button onClick={prop.onClick}><i className="fa-solid fa-plus"></i></button>
    </div>
  )
}

export default AddButton