import './Dropdown.scss'
import React from 'react'

const Dropdown = (props) => {

  const clicked = (item) => {
    if (props.type === 'categories') {
      props.setIsCategoriesOpen(false)
      props.setCurrentCategory(item)
    } else if (props.type === 'sort') {
      props.setIsSortOpen(false)
      props.setCurrentSort(item)
    }
  }

  return (
    <div className={"dropdown "+props.type}>
      {props.inArray.map(item => { 
        return <div className="dropdown-item" onClick={() => clicked(item)} key={item}>{item}</div>
      })}
    </div>
  )
}

export default Dropdown