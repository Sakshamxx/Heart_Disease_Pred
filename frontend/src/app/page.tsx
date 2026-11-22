import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Assessment } from "@/components/sections/Assessment";
import { Disclaimer } from "@/components/sections/Disclaimer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { ModelInfo } from "@/components/sections/ModelInfo";
import { TechStack } from "@/components/sections/TechStack";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Assessment />
        <ModelInfo />
        <TechStack />
        <Disclaimer />
      </main>
      <Footer />
    </>
  );
}
