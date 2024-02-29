import './SelectOrAddCategory.scss'
import React, { useState, useRef, useEffect } from 'react'
import Dropdown from '../Dropdown/Dropdown'
import Category from './Category/Category'
import AddCategory from './AddCategory/AddCategory'

const SelectOrAddCategory = (props) => {
  
  const [isOpen, setIsOpen] = useState(false) 
  const [dropDown, setDropdown] = useState([])
  const categories = useRef(JSON.parse(JSON.stringify(props.categories))) // want just the value not pass by reference

  useEffect(() => {
    const deleteCategory = (category) => {
      categories.current = categories.current.filter(function(item) { return item !== category })
      props.setCategories(categories.current)
      configureDropdown()
    }
  
    const addCategory = (category) => {
      // TODO capitalization
      if (category !== '') {

        let newCategory = category.trim() 
        const categorySplit = newCategory.split(' ')
        for (let i = 0; i < categorySplit.length; i++) {
          categorySplit[i] = categorySplit[i][0].toUpperCase() + categorySplit[i].substr(1)
        }
        category = categorySplit.join(' ')

        categories.current.push(category)
        props.setCategories(categories.current) 
        configureDropdown()
      }
    }

    const configureDropdown = () => {
      let temp = []
      categories.current.map(category => {
        temp.push(<Category category={category} deleteCategory={deleteCategory} />)
        return <></>
      })
      temp.push(<AddCategory addCategory={addCategory} />)
      setDropdown(temp)
    }

    configureDropdown()
  }, [props])

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