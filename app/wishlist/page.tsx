import Footer from '@/components/Footer'
import HeroSubscribe from '@/components/HeroSubscribe'
import Navbar from '@/components/Navbar'
import WishlistPage from '@/components/WishList'
import React from 'react'

const page = () => {
  return (
    <div>
        {/* <Navbar/> */}
        <WishlistPage/>
        <HeroSubscribe/>
        {/* <Footer/> */}
    </div>
  )
}

export default page