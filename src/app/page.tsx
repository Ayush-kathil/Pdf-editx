'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, FileDown, Github, Linkedin, Globe, ArrowRight, Image as ImageIcon } from 'lucide-react';

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
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-page selection:bg-txt-primary/20">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] bg-element/20 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

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
              <span className="text-txt-primary font-medium">Client-side only. Zero data collected.</span>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl"
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
                    className="min-h-[380px] h-auto rounded-[2.5rem] bg-card hover:bg-element border border-border-main p-8 md:p-10 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                         <div>
                            <div className="w-20 h-20 bg-element border border-border-strong rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                                <ShieldCheck className="w-10 h-10 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-3xl font-bold text-txt-primary mb-3">Unlock PDF</h2>
                            <p className="text-txt-secondary text-lg leading-relaxed">Remove password protection securely. No uploads.</p>
                         </div>
                    
                         <div className="flex items-center text-txt-primary font-semibold text-base mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
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
                    className="min-h-[380px] h-auto rounded-[2.5rem] bg-card hover:bg-element border border-border-main p-8 md:p-10 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                         <div>
                            <div className="w-20 h-20 bg-element border border-border-strong rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                                <FileDown className="w-10 h-10 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-3xl font-bold text-txt-primary mb-3">Compress PDF</h2>
                            <p className="text-txt-secondary text-lg leading-relaxed">Reduce file size locally. <br/>Efficient and fast.</p>
                         </div>

                         <div className="flex items-center text-txt-primary font-semibold text-base mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
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
                    className="min-h-[380px] h-auto rounded-[2.5rem] bg-card hover:bg-element border border-border-main p-8 md:p-10 flex flex-col justify-between transition-all duration-500 relative overflow-hidden shadow-xl hover:shadow-2xl"
                >
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="w-20 h-20 bg-element border border-border-strong rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                                <ImageIcon className="w-10 h-10 text-txt-primary stroke-[1.5]" />
                            </div>
                            <h2 className="text-3xl font-bold text-txt-primary mb-3">Compress Image</h2>
                            <p className="text-txt-secondary text-lg leading-relaxed">Optimize photos to target size. <br/>JPG, PNG, WebP.</p>
                        </div>
                        
                        <div className="flex items-center text-txt-primary font-semibold text-base mt-4">
                            <span>Open Tool</span>
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
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
                className="group flex items-center space-x-2 px-5 py-2.5 rounded-full bg-element hover:bg-txt-primary border border-border-main transition-all duration-300 shadow-sm hover:shadow-md"
             >
                <span className="text-sm font-medium text-txt-secondary group-hover:text-bg-page">Developer</span>
                <div className="w-1 h-1 rounded-full bg-txt-tertiary group-hover:bg-bg-page/50" />
                <span className="text-sm font-bold text-txt-primary group-hover:text-bg-page">Ayush Gupta</span>
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
    </main>
  );
}
