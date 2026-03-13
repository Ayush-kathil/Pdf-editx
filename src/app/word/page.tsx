import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, FileDown, ArrowRight } from 'lucide-react';

const springTransition = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
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

export default function WordSuitePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-page">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <motion.div 
        className="w-full max-w-4xl flex flex-col items-center z-10 pt-20"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
          <div className="w-full mb-12 flex justify-start">
             <Link href="/" className="inline-flex items-center text-txt-secondary hover:text-txt-primary transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span>Back to Tools</span>
             </Link>
          </div>

          <header className="mb-16 text-center space-y-6">
            <div className="inline-flex items-center justify-center mb-2">
               <div className="p-4 bg-card rounded-[2rem] border border-border-main shadow-2xl backdrop-blur-xl">
                 <FileText className="w-10 h-10 text-blue-500 stroke-[1.5]" />
               </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-txt-primary tracking-tighter">
              Word Suite
            </h1>
            <p className="text-xl text-txt-secondary max-w-xl mx-auto">
              Convert between PDF and Microsoft Word formats.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
             <Link href="/pdf-to-word" className="group">
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="h-full rounded-[2rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-blue-500/50"
                >
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <FileDown className="w-7 h-7 text-txt-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-txt-primary mb-2">PDF to Word</h2>
                        <p className="text-txt-secondary text-base">Extract text from your PDF into an editable Word document.</p>
                    </div>
                </motion.div>
            </Link>

            <Link href="/word-to-pdf" className="group">
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="h-full rounded-[2rem] bg-card border border-border-main p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden shadow-xl hover:shadow-2xl hover:border-blue-500/50"
                >
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-element border border-border-strong rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <FileText className="w-7 h-7 text-txt-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-txt-primary mb-2">Word to PDF</h2>
                        <p className="text-txt-secondary text-base">Securely convert your Word documents into fixed PDF format.</p>
                    </div>
                </motion.div>
            </Link>
          </div>
      </motion.div>
    </main>
  );
}
