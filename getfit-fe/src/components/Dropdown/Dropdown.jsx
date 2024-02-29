import './Dropdown.scss'
import React from 'react'

const Dropdown = (props) => {

  const clicked = (item) => {
    if (props.type === 'categories') {
      props.setIsCategoriesOpen(false)
      props.setCurrentCategory(item)
      props.displayCategory(item)
    } else if (props.type === 'sort') {
      props.setIsSortOpen(false)
      props.sortExercises(item)
    }
  }

  return (
    <div className={"dropdown "+props.type}>
      {props.inArray.map((item, i = 0) => { 
        return <div className="dropdown-item" onClick={() => clicked(item)} key={i}>{item}</div>
      })}
    </div>
  )
}

export default Dropdown