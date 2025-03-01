import React from "react";
import {BrowserRouter,Routes,Route} from "react-router-dom";
import Home from "./assets/pages/Home/Home";
import Login from "./assets/pages/AuthPages/Login/Login";
import Signup from "./assets/pages/AuthPages/Signup/Signup";
import GuideValidationForm from "./assets/pages/GuideValidation/GuideValidationForm";
import AboutUs from "./assets/pages/AboutUs/AboutUs";
import HireGuide from "./assets/pages/Hire Guide/HireGuide";
import Profile from "./assets/pages/Profile/profile";
function App(){
  return (
    <>
      <BrowserRouter>
        <Routes>
        <Route path ="/home" element={<Home/>}/>
        <Route path ="/login" element={<Login/>}/>
        <Route path ="/aboutus" element={<AboutUs/>}/>
        <Route path ="/signup" element={<Signup/>}/>
        <Route path ="/hireguide" element={<HireGuide/>}/>
        <Route path ="/profile" element={<Profile/>}/>
        <Route path="/guide-validation" element={<GuideValidationForm />}/>

        </Routes>
      </BrowserRouter>
    </>
  )

}
export default App
