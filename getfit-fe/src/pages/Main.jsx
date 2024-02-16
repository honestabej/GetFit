import React, { useState } from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home/Home'
import SignUp from './SignUp/SignUp'
import SignIn from './SignIn/SignIn'
import Profile from './Profile/Profile'
import Test from './Test/Test'

const Main = () => {
  const[email, setEmail] = useState('')
  axios.defaults.withCredentials = true;

  return (
    <>
    <Router> 
      <Routes>
        <Route exact path='/' element={<Home setEmail={setEmail} />} />
        <Route exact path='/signup' element={<SignUp email={email} />} />
        <Route exact path='/signin' element={<SignIn />} />
        <Route exact path='/profile' element={<Profile />} />
        <Route exact path='/test' element={<Test email={email} />} />
      </Routes>
    </Router>
    </>
  );
}

export default Main;