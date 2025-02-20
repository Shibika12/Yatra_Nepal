import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Home from "./assets/pages/Home/Home";
import Login from "./assets/pages/Login/Login";
import Signup from "./assets/pages/Signup/Signup";
import GuideValidationForm from "./assets/pages/GuideValidation/GuideValidationForm";
function App(){
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path ="/home" element={<Home/>}/>
        <Route path ="/login" element={<Login/>}/>
        <Route path ="/signup" element={<Signup/>}/>
        <Route path="/guide-validation" element={<GuideValidationForm />}/>
        </Routes>
      </BrowserRouter>
    </>
  )

}
export default App
