import React from "react";
import  {Button } from "./components/ui/button";
import  {SignInButton } from "@clerk/clerk-react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Category from "./components/Category";
import MostSearchVehicle from "./components/MostSearchVehicle";
import Footer from "./components/Footer";
import InfoSection from "./components/InfoSection";
function Home() {
  return (
    <div>
      {/*Header*/}
      <Header />
      {/*Hero*/}
      <Hero />
      {/*Categories*/}
      <Category />
      {/*Most Search Vehicle*/}
      <MostSearchVehicle/>
      {/*Info Section*/}
      <InfoSection/>
      {/*Footer*/}
      <Footer/>
    </div>
  );
}

export default Home;
