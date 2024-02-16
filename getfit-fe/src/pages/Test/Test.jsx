import './Test.scss'
import React from 'react'
import Header from '../../components/Header/Header'
import Footer from '../../components/Footer/Footer'

function Test(props) {

  return (
    <div className="test-wrapper">
      <Header/>
      <div className="test-component-wrapper">
        {props.email}
      </div>
      <Footer/>
    </div>
  )
}
 
export default Test 