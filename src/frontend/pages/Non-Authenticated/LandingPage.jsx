import React, { useEffect } from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';
import { Sparkles, Twitter, Linkedin } from 'lucide-react';

// A small, reusable animated component for the initial fade-in
const MotionBox = ({ children, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Decorative shape component for the background
const FloatingShape = ({ className, initialX, initialY, duration, travelDistance }) => (
  <motion.div
    className={`absolute -z-10 ${className}`}
    style={{ x: initialX, y: initialY }}
    animate={{
      x: [initialX, initialX + travelDistance, initialX],
      y: [initialY, initialY - travelDistance, initialY],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      repeatType: 'mirror',
      ease: 'easeInOut',
    }}
  />
);

// The main "Coming Soon" page component
const ComingSoonPage = () => {
  // --- PARALLAX MOUSE EFFECT LOGIC ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Create transformed values for parallax effect.
  const parallaxX = useTransform(mouseX, (value) => (value - window.innerWidth / 2) / -40);
  const parallaxY = useTransform(mouseY, (value) => (value - window.innerHeight / 2) / -40);
  
  // A more exaggerated effect for background elements
  const bgParallaxX = useTransform(mouseX, (value) => (value - window.innerWidth / 2) / 20);
  const bgParallaxY = useTransform(mouseY, (value) => (value - window.innerHeight / 2) / 20);

  const socialLinks = [
    { icon: <Twitter className="h-5 w-5" />, href: "#" },
    { icon: <Linkedin className="h-5 w-5" />, href: "#" },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-background text-foreground overflow-hidden">
      
      {/* Animated Background & Parallax Shapes */}
      <motion.div style={{ x: bgParallaxX, y: bgParallaxY }} className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-neutral-900/50 to-background" />
        <FloatingShape
          className="w-64 h-64 bg-primary/10 rounded-full filter blur-3xl"
          initialX="10vw" initialY="20vh" duration={25} travelDistance={50}
        />
        <FloatingShape
          className="w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl"
          initialX="70vw" initialY="60vh" duration={30} travelDistance={-40}
        />
         <FloatingShape
          // --- CHANGE: Geometric shape is now purple ---
          className="hidden md:block w-48 h-48 border-2 border-purple-500/20 rounded-xl"
          initialX="80vw" initialY="15vh" duration={35} travelDistance={30}
        />
      </motion.div>
      
      {/* --- NEW: Faded text in the background --- */}
      <motion.div
        style={{ x: bgParallaxX, y: bgParallaxY }}
        className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none"
      >
        <h2 className="text-[20vw] lg:text-[15rem] font-black text-neutral-500/5 dark:text-neutral-400/5 whitespace-nowrap">
          COMING SOON
        </h2>
      </motion.div>


      {/* Main Content with Parallax Effect */}
      <motion.main
        style={{ x: parallaxX, y: parallaxY }}
        className="container flex flex-col items-center justify-center text-center px-4 z-10"
      >
        {/* Logo and Brand Name */}
        <MotionBox delay={0}>
          <div className="flex items-center justify-center mb-6">
            <Sparkles className="h-10 w-10 mr-3 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">StudiumHub</h1>
          </div>
        </MotionBox>

        {/* Main Headline */}
        <MotionBox delay={0.2}>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 leading-tight">
            A New Chapter in <br /> <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Education</span> is Coming
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-6">
            We're crafting an experience to revolutionize teaching and learning. <br/> Get ready for something truly special.
          </p>
        </MotionBox>
      </motion.main>

      {/* Footer (Stays static, not affected by parallax) */}
      <footer className="absolute bottom-0 py-6 w-full z-20">
        <div className="container flex flex-col sm:flex-row justify-between items-center text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} StudiumHub. All rights reserved.</p>
          {/* <div className="flex space-x-4 mt-4 sm:mt-0">
            {socialLinks.map((link, index) => (
              <a key={index} href={link.href} className="hover:text-primary transition-colors" aria-label={`Follow us on ${link.href}`}>
                {link.icon}
              </a>
            ))}
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default ComingSoonPage;