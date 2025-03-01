import React from 'react'
import Footer from '../../components/Footer/Footer'
import Navbar from '../../components/Navbar/Navbar'
import ProfileHero from '../../components/ProfileHero/ProfileHero'
import TabNavigation from '../../components/TabNavigation/TabNavigation'


export const Profile = () => {
  return (
    <div>
        <Navbar/>
        <ProfileHero/>
        
        <TabNavigation/>
        <Footer/>

    </div>
  )
}

export default Profile