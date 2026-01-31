import Subnavbar from '@/container/Subnavbar';
import HeaderNav from '@/container/HeaderNav';
import CategorySlider from './CategorySlider';
import React from 'react';

const Navbar = () => {
  return (
    <div>
      <Subnavbar />
      <CategorySlider />
      <HeaderNav />
    </div>
  );
};

export default Navbar;
