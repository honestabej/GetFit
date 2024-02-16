import './ButtonNoFill.scss'
import React from 'react'

const ButtonNoFill = (prop) => {
  return (
    <div className={"button-no-fill bnf-"+prop.color}>
      <input type="submit" value={prop.value} onClick={prop.onClick} />
    </div>
  )
}

export default ButtonNoFill