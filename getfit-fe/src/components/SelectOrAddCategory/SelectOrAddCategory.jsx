import './SelectOrAddCategory.scss'
import React, { useState, useRef, useEffect } from 'react'
import Dropdown from '../Dropdown/Dropdown'
import Category from './Category/Category'
import AddCategory from './AddCategory/AddCategory'

const SelectOrAddCategory = (props) => {
  const categoryAdding = useRef('') 
  const [isOpen, setIsOpen] = useState(false) 
  const [dropDown, setDropdown] = useState([])
  const categories = useRef(props.categories)

  useEffect(() => {
    if (!props.isNew) {
      let temp = []
      props.categories.map(category => {
        temp.push(<Category category={category} deleteCategory={deleteCategory} />)
        return <></>
      })
      temp.push(<AddCategory categoryAdding={categoryAdding} addCategory={addCategory} />)
      setDropdown(temp)
    } else {
      categories.current = []
      setDropdown([<AddCategory categoryAdding={categoryAdding} addCategory={addCategory} />])
    }
  }, [props.isNew, props.categories])

  const deleteCategory = (category) => {
    categories.current = categories.current.filter(function(item) { return item !== category })
    props.setCategories(categories.current)
    configureDropdown()
  }

  const addCategory = (category) => {
    categories.current.push(category)
    props.setCategories(categories.current)
    configureDropdown()
  }

  const configureDropdown = () => {
    let temp = []
    categories.current.map(category => {
      temp.push(<Category category={category} deleteCategory={deleteCategory} />)
      return <></>
    })
    temp.push(<AddCategory categoryAdding={categoryAdding} addCategory={addCategory} />)
    setDropdown(temp)
  }

  return (
    <div className="select-or-add-category-wrapper">
      <div className="select-or-add-category-container" onClick={() => setIsOpen(!isOpen)}>
        <div className="select-or-add-category-label">Categories</div>
        <i className="fa-solid fa-angle-down"></i>
      </div>
      {isOpen ? <Dropdown type={'exercise'} inArray={dropDown} /> : <></> }
    </div>
  )
}

export default SelectOrAddCategory