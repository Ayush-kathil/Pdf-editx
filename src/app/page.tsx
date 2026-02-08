'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, FileDown, Github, Linkedin, Globe, ArrowRight, Image as ImageIcon, Layers, Scissors, Images, RotateCw, Camera } from 'lucide-react';

const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: springTransition
  },
};

export default function LandingPage() {
  const [showIntro, setShowIntro] = React.useState(true);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    const funnyMessages = [
        "Convincing the pixels to cooperate... 🤔",
        "Feeding the server hamsters... 🐹",
        "Untangling the interwebs... 🕸️",
        "Polishing the PDFs... ✨",
        "Summoning the document wizard... 🧙‍♂️",
        "Asking the files nicely to open... 🥺"
    ];
    setMessage(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);

    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-page selection:bg-txt-primary/20">
      
      <AnimatePresence mode="wait">
        {showIntro && (
            <motion.div
                key="intro"
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-page text-txt-primary overflow-hidden"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
            >
                 <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center space-y-8 px-4"
                 >
                    {/* Bouncing Plane Animation */}
                    <div className="relative">
                        <motion.div
                            animate={{ 
                                y: [-15, 15, -15],
                                rotate: [0, 5, -5, 0],
                            }}
                            transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="100" 
                                height="100" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                className="text-txt-primary drop-shadow-2xl md:w-[120px] md:h-[120px]"
                            >
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        </motion.div>
                        
                        {/* Sparkles / Confetti - Themed colors if possible, or keep emoji for fun */}
                        <motion.div 
                            className="absolute -top-8 -right-8 text-3xl md:text-4xl"
                            animate={{ scale: [1, 1.5, 1], rotate: [0, 90, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            ✨
                        </motion.div>
                        <motion.div 
                            className="absolute -bottom-4 -left-8 text-3xl md:text-4xl"
                            animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        >
                            🎉
                        </motion.div>
                    </div>

                    <motion.h2 
                        className="text-xl md:text-3xl font-bold text-center max-w-lg leading-relaxed font-sans text-txt-secondary"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        {message}
                    </motion.h2>
                 </motion.div>

                 {/* Clouds / Decoration - Subtle background elements matching theme */}
                 <div className="absolute inset-0 pointer-events-none">
                     <motion.div 
                        className="absolute top-20 left-[-10%] w-48 h-48 bg-element/30 rounded-full blur-[80px]"
                        animate={{ x: [0, 50, 0] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                     />
                     <motion.div 
                        className="absolute bottom-40 right-[-10%] w-64 h-64 bg-element/30 rounded-full blur-[80px]"
                        animate={{ x: [0, -50, 0] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                     />
                 </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] bg-element/20 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {!showIntro && (
      <motion.div 
        className="w-full max-w-5xl flex flex-col items-center z-10 pt-20"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
          {/* Header */}
          <motion.header variants={fadeInUp} className="mb-16 text-center space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold text-txt-primary tracking-tighter leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-tr from-txt-primary to-txt-secondary">
                PDF Editx
              </span>
            </h1>
            <p className="text-xl text-txt-secondary max-w-xl mx-auto leading-relaxed font-normal">
              Essential utilities for your documents<br/>
              <span className="text-txt-primary font-medium">Welcome to PDF Editx</span>
            </p>
             <div className="pt-2">
                <a 
                    href="https://myaadhaar.uidai.gov.in/genricDownloadAadhaar/en" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-txt-tertiary hover:text-txt-primary transition-colors border-b border-border-main hover:border-txt-primary pb-0.5"
                >
                    <span>e-Aadhaar Download</span>
                    <span className="text-[10px]">↗</span>
                </a>
            </div>
          </motion.header>

          {/* Tools Grid */}
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl"
          >
            {/* Tool 1: Unlocker */}
            <Link href="/unlock" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    whileTap={{ scale: 0.98 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                         <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <ShieldCheck className="w-8 h-8 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">Unlock PDF</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Remove password protection securely. No uploads.</p>
                         </div>
                    
                         <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                         </div>
                    </div>
                </motion.div>
            </Link>

             {/* Tool 2: Compressor */}
             <Link href="/compress" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                         <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <FileDown className="w-8 h-8 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">Compress PDF</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Reduce file size locally. <br/>Efficient and fast.</p>
                         </div>

                         <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                         </div>
                    </div>
                </motion.div>
            </Link>

             {/* Tool 3: Image Compressor */}
             <Link href="/image-compress" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <ImageIcon className="w-8 h-8 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">Compress Image</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Optimize photos to target size. <br/>JPG, PNG, WebP.</p>
                        </div>
                        
                        <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </motion.div>
            </Link>

             {/* Tool 4: Merge PDF */}
             <Link href="/merge-pdf" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Layers className="w-8 h-8 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">Merge PDF</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Combine multiple PDFs into one document.</p>
                        </div>
                        
                        <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </motion.div>
            </Link>

             {/* Tool 5: Split PDF */}
             <Link href="/split-pdf" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Scissors className="w-8 h-8 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">Split PDF</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Extract ranges or pages from a PDF.</p>
                        </div>
                        
                        <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </motion.div>
            </Link>

             {/* Tool 6: Image to PDF */}
             <Link href="/image-to-pdf" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Images className="w-8 h-8 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">Image to PDF</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Convert photos to PDF. <br/>With quality control.</p>
                        </div>
                        
                        <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </motion.div>
            </Link>

             {/* Tool 7: Rotate PDF */}
             <Link href="/rotate-pdf" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <RotateCw className="w-8 h-8 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">Rotate PDF</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Fix page orientation. <br/>All pages at once.</p>
                        </div>
                        
                        <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </motion.div>
            </Link>

             {/* Tool 8: HEIC to JPG */}
             <Link href="/heic-to-jpg" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <Camera className="w-8 h-8 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">HEIC to JPG</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Convert HEIC photos. <br/>Bulk conversion supported.</p>
                        </div>
                        
                        <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </motion.div>
            </Link>

             {/* Tool 9: MOV to MP4 */}
             <Link href="/mov-to-mp4" className="group">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -10 }}
                    className="min-h-[340px] h-auto rounded-[2.5rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-txt-primary"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-16 h-16 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl">🎬</span>
                            </div>
                            <h2 className="text-2xl font-bold text-txt-primary mb-2">MOV to MP4</h2>
                            <p className="text-txt-secondary text-base leading-relaxed">Convert video files. <br/>Drag & Drop.</p>
                        </div>
                        
                        <div className="flex items-center text-txt-primary font-semibold text-sm mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                </motion.div>
            </Link>

          </motion.div>

          {/* Footer / Credits */}
          <motion.footer variants={fadeInUp} className="mt-20 flex flex-col items-center space-y-8 pb-10">
             
             {/* Developer About Button */}
             <a 
                href="https://ayushgupta3.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 px-5 py-2.5 rounded-full bg-card hover:bg-txt-primary border border-border-main transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105"
             >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse group-hover:bg-bg-page" />
                <span className="text-sm font-medium text-txt-secondary group-hover:text-bg-page transition-colors">Developer</span>
                <span className="text-sm font-bold text-txt-primary group-hover:text-bg-page transition-colors">Ayush Gupta</span>
             </a>

             <div className="flex items-center justify-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
                <a href="https://github.com/Ayush-kathil" target="_blank" rel="noopener noreferrer" className="text-txt-tertiary hover:text-txt-primary transition-colors">
                    <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/ayushkathil" target="_blank" rel="noopener noreferrer" className="text-txt-tertiary hover:text-[#0077b5] transition-colors">
                    <Linkedin className="w-5 h-5" />
                </a>
             </div>
          </motion.footer>

      </motion.div>
      )}
    </main>
  );
}
