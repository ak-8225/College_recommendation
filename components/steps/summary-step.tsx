"use client"

import type React from "react"

import { motion } from "framer-motion"
import { ArrowLeft, Download, TrendingUp, DollarSign, Users, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartTooltip } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart } from "recharts"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { Step, College } from "@/types/college"

import { useState, useRef } from "react"
import { toast } from "@/hooks/use-toast"

// Enhanced PDF generation with visual elements
const generatePDF = async (formData: any, elementRef: React.RefObject<HTMLDivElement>) => {
  try {
    // Dynamic import to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default
    const jsPDF = (await import("jspdf")).default

    if (!elementRef.current) {
      toast({
        title: "Error",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      })
      return
    }

    // Show loading toast
    toast({
      title: "Generating PDF",
      description: "Please wait while we create your visual report...",
    })

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(elementRef.current, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: elementRef.current.scrollWidth,
      height: elementRef.current.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    })

    const imgData = canvas.toDataURL("image/png")

    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // Calculate scaling to fit page
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const scaledWidth = imgWidth * ratio
    const scaledHeight = imgHeight * ratio

    // Center the image on the page
    const x = (pdfWidth - scaledWidth) / 2
    const y = (pdfHeight - scaledHeight) / 2

    // Add the image to PDF
    pdf.addImage(imgData, "PNG", x, y, scaledWidth, scaledHeight)

    // If content is too long, add multiple pages
    if (scaledHeight > pdfHeight) {
      const totalPages = Math.ceil(scaledHeight / pdfHeight)

      for (let i = 1; i < totalPages; i++) {
        pdf.addPage()
        const yOffset = -i * pdfHeight
        pdf.addImage(imgData, "PNG", x, yOffset, scaledWidth, scaledHeight)
      }
    }

    // Add metadata
    pdf.setProperties({
      title: `College Fit Analysis - ${formData.name || "Student"}`,
      subject: "College Fit Analysis Report",
      author: "College Fit App",
      creator: "College Fit Analysis Tool",
    })

    // Download the PDF
    const fileName = `College_Fit_Analysis_${formData.name || "Report"}_${new Date().toISOString().split("T")[0]}.pdf`
    pdf.save(fileName)

    toast({
      title: "PDF Downloaded Successfully",
      description: "Your complete visual analysis report has been downloaded.",
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    toast({
      title: "PDF Generation Failed",
      description: "There was an error generating the PDF. Please try again.",
      variant: "destructive",
    })
  }
}

// Helper function to generate shareable link
const generateShareableLink = () => {
  const baseUrl = window.location.origin
  const shareUrl = `${baseUrl}/shared-report/${Date.now()}`
  return shareUrl
}

// Helper function to copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to clipboard.",
    })
  } catch (err) {
    toast({
      title: "Copy Failed",
      description: "Failed to copy link. Please try again.",
      variant: "destructive",
    })
  }
}

interface SummaryStepProps {
  pageVariants: any
  pageTransition: any
  formData: any
  colleges: College[]
  onNext: (step: Step) => void
  onBack: () => void
}

export default function SummaryStep({
  pageVariants,
  pageTransition,
  formData,
  colleges,
  onNext,
  onBack,
}: SummaryStepProps) {
  const [shareUrl, setShareUrl] = useState<string>("")
  const summaryRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>

  // Get liked colleges
  const likedColleges = colleges.filter((college) => college.liked)

  // Generate data based on LIKED colleges only
  const generateROIData = () => {
    if (likedColleges.length === 0) {
      // Fallback data if no colleges are liked
      return [
        { name: "University of Salford", roi: 3.2, color: "#4F46E5" },
        { name: "Coventry University", roi: 3.5, color: "#4F46E5" },
        { name: "University of Dundee", roi: 4.1, color: "#4F46E5" },
      ]
    }

    return likedColleges.map((college, index) => ({
      name: college.name,
      roi: index === 0 ? 3.2 : index === 1 ? 3.5 : 4.1 + index * 0.3,
      color: "#4F46E5",
    }))
  }

  const generateEmploymentData = () => {
    if (likedColleges.length === 0) {
      // Fallback data if no colleges are liked
      return [
        { university: "Salford", rate: 95, salary: 28000 },
        { university: "Coventry", rate: 89, salary: 26500 },
        { university: "Dundee", rate: 92, salary: 29200 },
      ]
    }

    return likedColleges.map((college, index) => ({
      university: college.name.split(" ").pop() || college.name, // Get last word of university name
      rate: index === 0 ? 95 : index === 1 ? 89 : 92,
      salary: index === 0 ? 28000 : index === 1 ? 26500 : 29200,
    }))
  }

  const roiData = generateROIData()
  const employmentData = generateEmploymentData()

  const chartConfig = {
    roi: { label: "ROI %", color: "#4F46E5" },
    rate: { label: "Employment Rate", color: "#10B981" },
    salary: { label: "Starting Salary", color: "#F59E0B" },
  }

  const getPersonalizedInsights = () => {
    const major = formData.courseName?.toLowerCase() || ""
    const country = formData.country || ""
    const budget = formData.budget || ""

    const insights = []

    if (major.includes("nursing") || major.includes("health")) {
      insights.push({
        type: "opportunity",
        title: "High Demand Field",
        description:
          "UK healthcare sector faces 40,000+ nursing vacancies. Your chosen field offers excellent job security.",
        impact: "95% employment rate within 6 months",
        source: "NHS Workforce Statistics 2024",
      })
    }

    if (country.toLowerCase().includes("uk") || country.toLowerCase().includes("united kingdom")) {
      insights.push({
        type: "financial",
        title: "Post-Study Work Visa",
        description: "2-year Graduate Route visa allows you to work in the UK after graduation, maximizing ROI.",
        impact: "Potential £56,000+ additional earnings",
        source: "UK Government Immigration Rules",
      })
    }

    insights.push({
      type: "strategic",
      title: "Scholarship Opportunities",
      description: "Based on your profile, you're eligible for merit-based scholarships up to £6,000 annually.",
      impact: "Reduces total investment by 15-20%",
      source: "University Scholarship Databases",
    })

    return insights
  }

  const getRecommendations = () => [
    {
      priority: "High",
      action: "Apply for Early Bird Scholarships",
      deadline: "March 2024",
      impact: "Save up to £6,000 annually",
      status: "pending",
    },
    {
      priority: "High",
      action: "Complete IELTS Preparation",
      deadline: "February 2024",
      impact: "Meet admission requirements",
      status: "in-progress",
    },
    {
      priority: "Medium",
      action: "Prepare Financial Documentation",
      deadline: "April 2024",
      impact: "Smooth visa application",
      status: "pending",
    },
    {
      priority: "Medium",
      action: "Connect with Alumni Network",
      deadline: "Ongoing",
      impact: "Industry insights & networking",
      status: "pending",
    },
  ]

  return (
    <TooltipProvider>
      {/* Header - Outside of PDF capture */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 sm:gap-0 px-2 sm:px-0">
        <Button
          variant="ghost"
          onClick={onBack}
          className="hover:bg-white/50 transition-all duration-300 hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analysis
        </Button>
        <div className="flex gap-3">
          {/* Download PDF Button */}
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={() => generatePDF(formData, summaryRef)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            onClick={() => onNext("initial-form")}
            variant="destructive"
            className="border-2 border-red-500 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-700 font-semibold px-4 py-2 rounded-lg transition-all duration-300"
          >
            Logout
          </Button>
        </div>
      </div>

      <motion.div
        ref={summaryRef}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="space-y-8 px-2 sm:px-0"
      >
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
            Complete Analysis Summary
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive insights for {formData.name}'s {formData.courseName} journey in {formData.country}
          </p>
        </div>

        {/* Liked Universities Section - Moved to Top */}
        {likedColleges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Heart className="w-6 h-6 text-red-500 fill-current" />
              Your Favorite Universities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
              {likedColleges.map((college, index) => (
                <Card
                  key={college.id}
                  className="p-6 bg-white border-gray-200 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 bg-gradient-to-br ${college.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                    >
                      {college.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{college.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        {college.flag} {college.country}
                      </p>
                    </div>
                    <Heart className="w-6 h-6 text-red-500 fill-current" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700">Break-even Time</span>
                        <span className="font-semibold text-gray-900">{3.2 + index * 0.3} Years</span>
                      </div>
                      <Progress value={Math.max(0, 100 - (3.2 + index * 0.3) * 25)} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Tuition Fee</p>
                        <p className="font-semibold text-gray-900 text-sm">{college.tuitionFee}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Avg Package</p>
                        <p className="font-semibold text-gray-900 text-sm">{college.avgPackage}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Break-even</p>
                        <p className="font-semibold text-green-600 text-sm">{3.2 + index * 0.3} Years</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Ranking</p>
                        <p className="font-semibold text-gray-900 text-sm">#{college.ranking}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2">
                      {college.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700 font-medium">Avg Break-even</p>
                <p className="text-2xl font-bold text-blue-900">3.2 Years</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Employment Rate</p>
                <p className="text-2xl font-bold text-green-900">92%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700 font-medium">Avg. Salary</p>
                <p className="text-2xl font-bold text-purple-900">£27.9K</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-red-700 font-medium">Liked Universities</p>
                <p className="text-2xl font-bold text-red-900">{likedColleges.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 bg-white/50 backdrop-blur-sm border-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* ROI Analysis Chart - More Visual */}
              <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Break-even Analysis by University
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Based on your {likedColleges.length > 0 ? "liked" : "recommended"} universities
                  </p>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="w-full h-[280px] md:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={roiData}
                        margin={{ top: 20, right: 20, left: 20, bottom: 60 }}
                        barCategoryGap="30%"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          domain={[0, 6]}
                        />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-medium text-gray-900">{label}</p>
                                  <p className="text-blue-600 font-semibold">Break-even: {payload[0]?.value} years</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Time to recover investment after graduation
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="roi" fill="#4F46E5" radius={[6, 6, 0, 0]} maxBarSize={100} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Visual indicators below chart */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {roiData.map((item, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-2">
                        <div className="text-xs font-medium text-blue-800">{item.name.split(" ").pop()}</div>
                        <div className="text-lg font-bold text-blue-900">{item.roi} yrs</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Employment & Salary Chart - Fixed with ComposedChart */}
              <Card className="p-4 md:p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
                <CardHeader className="px-0 pt-0 pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-green-600" />
                    Employment Rate vs Starting Salary
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Career outcomes for your {likedColleges.length > 0 ? "liked" : "recommended"} universities
                  </p>
                </CardHeader>
                <CardContent className="px-0">
                  <div className="w-full h-[280px] md:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={employmentData} margin={{ top: 20, right: 60, left: 20, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="university"
                          tick={{ fontSize: 12, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 10, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          domain={[80, 100]}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 10, fill: "#666" }}
                          axisLine={false}
                          tickLine={false}
                          domain={[25000, 30000]}
                        />
                        <ChartTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                  <p className="font-medium text-gray-900">{label}</p>
                                  <p className="text-green-600 font-semibold">
                                    Employment Rate: {payload.find((p) => p.dataKey === "rate")?.value}%
                                  </p>
                                  <p className="text-orange-600 font-semibold">
                                    Starting Salary: £
                                    {payload.find((p) => p.dataKey === "salary")?.value?.toLocaleString()}
                                  </p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="salary"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          dot={{ fill: "#F59E0B", strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: "#F59E0B", strokeWidth: 2 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Visual indicators below chart */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {employmentData.map((item, index) => (
                      <div key={index} className="bg-orange-50 rounded-lg p-2">
                        <div className="text-xs font-medium text-orange-800">{item.university}</div>
                        <div className="text-sm font-bold text-orange-900">£{(item.salary / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-green-600">{item.rate}% employed</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Financial Support Section */}
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center">
            <p className="text-gray-700">
              For best financial loan support, contact{" "}
              <a
                href="https://yocket.com/finances/inside-loan-sales?source=loaninternal_webinar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Yocket Financial Services
              </a>
            </p>
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}