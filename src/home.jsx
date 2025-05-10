import React from "react";
import  Button  from "./components/ui/button";
import  SignInButton  from "@clerk/clerk-react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Category from "./components/Category";
function Home() {
  return (
    <div>
      {/*Header*/}
      <Header />
      {/*Hero*/}
      <Hero />
      {/*Categories*/}
      <Category />
    </div>
  );
}

export default Home;
