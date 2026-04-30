//"use client"

import Image from "next/image";
import Link from "next/link";
  //import { useEffect, useRef, useState } from "react";
  import TrustedCompanies from "@/components/landingPage/section2";
import Section3 from "@/components/landingPage/section3";
import Section4 from "@/components/landingPage/section4";
import TestimonialSlider from "@/components/landingPage/testimonialSlider";
import BlogSection from "@/components/landingPage/blogsection";
import FinalSection from "@/components/landingPage/finalsection";
import Section1 from "@/components/landingPage/section1";



export default function Home() {




  return (
    <div className="w-full fc ">
      <div className="w-full fc flex-col max-w-full">


        {/*   section 1   */}

        
        <Section1/>


        <TrustedCompanies/>


        <Section3/>


        <Section4/>


        <TestimonialSlider/>


        <BlogSection/>


        <FinalSection/>


      </div>

    </div>
  );
}
