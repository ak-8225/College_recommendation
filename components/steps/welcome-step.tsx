"use client"

import { motion } from "framer-motion"
import { GraduationCap, Target, TrendingUp, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Step } from "@/types/college"

interface WelcomeStepProps {
  pageVariants: any
  pageTransition: any
  onNext: (step: Step) => void
}

export default function WelcomeStep({ pageVariants, pageTransition, onNext }: WelcomeStepProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-8 px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative"
      >
        <img
          src="/logo.png"
          alt="Leap Scholar Logo"
          className="object-contain mb-6 hover:scale-105 transition-all duration-300 w-[125] h-28"
        />
        
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-4 max-w-3xl"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Leap!</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Decide Your College. Discover Your Future.
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="space-y-6"
      >
        <Button
          onClick={() => onNext("initial-form")}
          size="lg"
          className="bg-[#443eff] hover:bg-[#3730d9] text-white px-8 py-3 text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
        >
          <GraduationCap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          Start College Fit Analysis
        </Button>

        <p className="text-gray-500 max-w-xl mx-auto text-base">
          Join <span className="font-semibold text-[#443eff]">50,000+</span> students who found their perfect academic
          and career path
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mt-12"
      >
        {[
          { icon: Target, title: "Personalized Matching", desc: "AI-powered college recommendations" },
          { icon: TrendingUp, title: "Career Insights", desc: "Future salary & growth projections" },
          { icon: Globe, title: "Global Opportunities", desc: "Worldwide job market analysis" },
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/20"
          >
            <feature.icon className="w-6 h-6 text-[#443eff] mb-2 mx-auto" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">{feature.title}</h3>
            <p className="text-xs text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
