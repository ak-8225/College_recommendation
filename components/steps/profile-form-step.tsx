"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  User,
  CheckCircle,
  BookOpen,
  MapPin,
  Award,
  DollarSign,
  Calendar,
  Users,
  Building2,
  Mail,
  Phone,
  GraduationCap,
  Globe,
  Clock,
  Briefcase,
  FileText,
  CreditCard,
  Home,
  Target,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { Step, UserProfile } from "@/types/college"

interface ProfileFormStepProps {
  pageVariants: any
  pageTransition: any
  formData: any
  multipleEntries: UserProfile[]
  onNext: (step: Step) => void
  onBack: () => void
}

export default function ProfileFormStep({
  pageVariants,
  pageTransition,
  formData,
  multipleEntries,
  onNext,
  onBack,
}: ProfileFormStepProps) {
  const profileSections = [
    {
      title: "Personal Information",
      icon: User,
      color: "from-blue-500 to-blue-600",
      fields: [
        { label: "Full Name", value: formData.name, icon: User },
        { label: "Email Address", value: formData.email, icon: Mail },
        { label: "Phone Number", value: formData.phoneNumber, icon: Phone },
        { label: "Current State", value: formData.currentResidenceState, icon: Home },
        { label: "Current City", value: formData.currentResidenceCity, icon: MapPin },
      ],
    },
    {
      title: "Academic Profile",
      icon: GraduationCap,
      color: "from-purple-500 to-purple-600",
      fields: [
        { label: "Preferred Course", value: formData.courseName, icon: BookOpen },
        { label: "Target Country", value: formData.country, icon: Globe },
        { label: "IELTS Band Required", value: formData.ieltsBand, icon: Award },
        { label: "Course Duration (months)", value: formData.courseDuration, icon: Clock },
        { label: "Preferred Intake", value: formData.preferredIntake, icon: Calendar },
      ],
    },
    {
      title: "Professional Background",
      icon: Briefcase,
      color: "from-green-500 to-green-600",
      fields: [
        { label: "Work Experience", value: formData.workExperience, icon: Briefcase },
        { label: "Gap Years", value: formData.gapYears, icon: Calendar },
        { label: "Preparation Stage", value: formData.preparationStage, icon: Target },
        { label: "Passport Status", value: formData.passportStatus, icon: FileText },
      ],
    },
    {
      title: "Financial Planning",
      icon: DollarSign,
      color: "from-orange-500 to-orange-600",
      fields: [
        { label: "Budget Range", value: formData.budget, icon: DollarSign },
        { label: "Family Income", value: formData.familyIncome, icon: TrendingUp },
        { label: "Finance Mode", value: formData.financeMode, icon: CreditCard },
        { label: "Student Finance", value: formData.studentFinance, icon: Building2 },
      ],
    },
    {
      title: "Preferences & Priorities",
      icon: Target,
      color: "from-pink-500 to-pink-600",
      fields: [
        { label: "Most Important Criteria", value: formData.mostImportantCriteria, icon: Target },
        { label: "Second Important Criteria", value: formData.secondImportantCriteria, icon: Award },
        { label: "Campus Preference", value: formData.campus, icon: Building2 },
        { label: "Category", value: formData.category, icon: BookOpen },
      ],
    },
    {
      title: "Counseling Progress",
      icon: Users,
      color: "from-indigo-500 to-indigo-600",
      fields: [
        { label: "Counseling Stage", value: formData.counselingStage, icon: Target },
        { label: "Assigned Counsellor", value: formData.assignedCounsellor, icon: Users },
        { label: "Welcome Call Status", value: formData.welcomeCallDone, icon: Phone },
      ],
    },
  ]

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-8 hover:bg-white/50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
            Profile Analysis Complete
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
            Your comprehensive counseling profile has been successfully retrieved and analyzed
          </p>
        </div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 mb-8"
        >
          <div className="flex items-center text-green-700">
            <CheckCircle className="w-5 h-5 mr-2" />
            <div>
              <span className="font-semibold text-base block">
                Profile Successfully Retrieved! Welcome back, {formData.name}!
              </span>
              <p className="text-green-600 text-sm mt-1">
                {multipleEntries.length > 1
                  ? `Found ${multipleEntries.length} university recommendations in your profile.`
                  : "Your complete counseling profile has been loaded and is ready for analysis."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profileSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + sectionIndex * 0.1, duration: 0.5 }}
            >
              <Card className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={`w-8 h-8 bg-gradient-to-br ${section.color} rounded-lg flex items-center justify-center shadow-lg`}
                  >
                    <section.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                </div>

                <div className="space-y-3">
                  {section.fields.map((field, fieldIndex) => (
                    <motion.div
                      key={field.label}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + sectionIndex * 0.1 + fieldIndex * 0.05, duration: 0.3 }}
                      className="group"
                    >
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center">
                        <field.icon className="w-3 h-3 mr-1 text-gray-500" />
                        {field.label}
                      </label>
                      <div className="relative">
                        <Input
                          value={field.value || "Not specified"}
                          disabled
                          className={`bg-gradient-to-r from-gray-50 to-blue-50 h-9 rounded-lg border text-sm transition-all duration-300 ${
                            field.value
                              ? "border-green-200 text-gray-900 font-medium"
                              : "border-gray-200 text-gray-500 italic"
                          }`}
                        />
                        {field.value && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center pt-6"
        >
          <Button
            onClick={() => onNext("results")}
            className="w-full max-w-md h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <Target className="w-4 h-4 mr-2" />
            Continue to College Recommendations →
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
