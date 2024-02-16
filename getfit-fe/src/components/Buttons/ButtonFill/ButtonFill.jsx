import './ButtonFill.scss'
import React from 'react'

const ButtonFill = (prop) => {
  return (
    <div className={"button-fill bf-"+prop.color}>
      <input type="submit" value={prop.value} onClick={prop.onClick} />
    </div>
  )
}

export default ButtonFill