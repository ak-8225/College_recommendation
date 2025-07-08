"use client"

import { motion } from "framer-motion"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Step } from "@/types/college"

interface AnalysisStepProps {
  pageVariants: any
  pageTransition: any
  formData: any
  onNext: (step: Step) => void
  onBack: () => void
}

export default function AnalysisStep({ pageVariants, pageTransition, formData, onNext, onBack }: AnalysisStepProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="space-y-10"
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-white/50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => onNext("summary")}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300"
        >
          View Complete Summary
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
          Career Analysis for {formData.name}
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive insights based on your {formData.courseName} path in {formData.country}
        </p>
      </div>

      {/* ROI Analysis Card */}
      <Card className="p-6 bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-500">
        <CardHeader className="px-0 pt-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Your Investment Analysis
          </CardTitle>
          <p className="text-gray-600 text-base">
            Based on your budget of {formData.budget} for {formData.courseName}
          </p>
        </CardHeader>
        <CardContent className="px-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <h3 className="font-bold text-blue-800 mb-1 text-sm">Total Investment</h3>
              <p className="text-xl font-bold text-blue-900">{formData.budget}</p>
              <p className="text-xs text-blue-700">Including tuition & living costs</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
              <h3 className="font-bold text-green-800 mb-1 text-sm">Expected ROI</h3>
              <p className="text-xl font-bold text-green-900">250%</p>
              <p className="text-xs text-green-700">Over 5 years post-graduation</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
              <h3 className="font-bold text-purple-800 mb-1 text-sm">Break-even Time</h3>
              <p className="text-xl font-bold text-purple-900">2.5 years</p>
              <p className="text-xs text-purple-700">After course completion</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
