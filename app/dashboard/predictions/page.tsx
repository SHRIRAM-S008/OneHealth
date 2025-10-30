"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertTriangle, TrendingUp } from "lucide-react"

interface Prediction {
  disease: string
  currentCases: number
  predictedCases7d: number
  predictedCases14d: number
  riskLevel: "low" | "medium" | "high" | "critical"
  trend: "stable" | "increasing" | "decreasing"
  confidence: number
}

interface TrendData {
  date: string
  cases: number
  predicted: number
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get user's organization
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .single()

      if (!userRole) return

      // Fetch cases from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: cases } = await supabase
        .from("disease_cases")
        .select("*")
        .eq("organization_id", userRole.organization_id)
        .gte("created_at", thirtyDaysAgo.toISOString())

      if (!cases) return

      // Group cases by disease and date
      const diseaseMap = new Map<string, { dates: Map<string, number>; total: number }>()

      cases.forEach((c) => {
        if (!diseaseMap.has(c.disease_name)) {
          diseaseMap.set(c.disease_name, { dates: new Map(), total: 0 })
        }

        const disease = diseaseMap.get(c.disease_name)!
        const date = new Date(c.created_at).toISOString().split("T")[0]
        disease.dates.set(date, (disease.dates.get(date) || 0) + 1)
        disease.total++
      })

      // Generate predictions
      const predictionsArray: Prediction[] = []

      diseaseMap.forEach((data, disease) => {
        const dates = Array.from(data.dates.entries()).sort((a, b) => a[0].localeCompare(b[0]))

        // Simple trend analysis
        const recentCases = dates.slice(-7).reduce((sum, [, count]) => sum + count, 0)
        const previousCases = dates.slice(-14, -7).reduce((sum, [, count]) => sum + count, 0)

        const trend = recentCases > previousCases ? "increasing" : recentCases < previousCases ? "decreasing" : "stable"

        // Calculate growth rate
        const growthRate = previousCases > 0 ? (recentCases - previousCases) / previousCases : 0

        // Predict next 7 and 14 days
        const avgDailyGrowth = growthRate / 7
        const predicted7d = Math.round(recentCases * (1 + avgDailyGrowth * 7))
        const predicted14d = Math.round(recentCases * (1 + avgDailyGrowth * 14))

        // Determine risk level
        let riskLevel: "low" | "medium" | "high" | "critical" = "low"
        if (predicted14d > recentCases * 2) riskLevel = "critical"
        else if (predicted14d > recentCases * 1.5) riskLevel = "high"
        else if (predicted14d > recentCases * 1.2) riskLevel = "medium"

        // Confidence based on data points
        const confidence = Math.min(95, 50 + dates.length * 3)

        predictionsArray.push({
          disease,
          currentCases: recentCases,
          predictedCases7d: predicted7d,
          predictedCases14d: predicted14d,
          riskLevel,
          trend,
          confidence,
        })
      })

      setPredictions(predictionsArray.sort((a, b) => b.currentCases - a.currentCases))

      // Generate trend data for first disease
      if (predictionsArray.length > 0) {
        setSelectedDisease(predictionsArray[0].disease)
        generateTrendData(predictionsArray[0].disease, cases)
      }
    } catch (error) {
      console.error("Error loading predictions:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateTrendData = (disease: string, cases: any[]) => {
    const diseaseCases = cases.filter((c) => c.disease_name === disease)
    const dateMap = new Map<string, number>()

    diseaseCases.forEach((c) => {
      const date = new Date(c.created_at).toISOString().split("T")[0]
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    })

    const dates = Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)

    // Generate predictions
    const trend: TrendData[] = []
    let cumulativeCases = 0

    dates.forEach(([date, count]) => {
      cumulativeCases += count
      trend.push({
        date,
        cases: cumulativeCases,
        predicted: cumulativeCases,
      })
    })

    // Add future predictions
    const lastCases = cumulativeCases
    const avgGrowth = dates.length > 1 ? (cumulativeCases - (dates[0][1] || 0)) / dates.length : 0

    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + i)
      trend.push({
        date: futureDate.toISOString().split("T")[0],
        cases: lastCases,
        predicted: Math.round(lastCases + avgGrowth * i),
      })
    }

    setTrendData(trend)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-800"
      case "high":
        return "bg-orange-50 border-orange-200 text-orange-800"
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      default:
        return "bg-green-50 border-green-200 text-green-800"
    }
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  if (loading) return <div className="text-center py-8">Loading predictions...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Outbreak Predictions</h1>
        <p className="text-muted-foreground">AI-powered forecasting for disease trends</p>
      </div>

      {/* Trend Chart */}
      {selectedDisease && trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>14-Day Forecast: {selectedDisease}</CardTitle>
            <CardDescription>Historical data and predicted trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cases" stroke="#3b82f6" name="Actual Cases" />
                <Line type="monotone" dataKey="predicted" stroke="#ef4444" strokeDasharray="5 5" name="Predicted" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Predictions List */}
      <Card>
        <CardHeader>
          <CardTitle>Disease Predictions</CardTitle>
          <CardDescription>7 and 14-day case forecasts by disease</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {predictions.length === 0 ? (
              <p className="text-muted-foreground">
                No predictions available. Add more case data to generate forecasts.
              </p>
            ) : (
              predictions.map((pred) => (
                <div
                  key={pred.disease}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${getRiskColor(pred.riskLevel)} ${selectedDisease === pred.disease ? "ring-2 ring-primary" : ""}`}
                  onClick={() => {
                    setSelectedDisease(pred.disease)
                    // Regenerate trend data
                    const supabase = createClient()
                    supabase.auth.getUser().then(({ data: { user } }) => {
                      if (user) {
                        supabase
                          .from("user_roles")
                          .select("organization_id")
                          .eq("user_id", user.id)
                          .single()
                          .then(({ data: userRole }) => {
                            if (userRole) {
                              const thirtyDaysAgo = new Date()
                              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                              supabase
                                .from("disease_cases")
                                .select("*")
                                .eq("organization_id", userRole.organization_id)
                                .gte("created_at", thirtyDaysAgo.toISOString())
                                .then(({ data: cases }) => {
                                  if (cases) generateTrendData(pred.disease, cases)
                                })
                            }
                          })
                      }
                    })
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{pred.disease}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskBadgeColor(pred.riskLevel)}`}>
                          {pred.riskLevel.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">Confidence: {pred.confidence}%</span>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Current (7d)</p>
                          <p className="font-semibold">{pred.currentCases} cases</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Predicted (7d)</p>
                          <p className="font-semibold">{pred.predictedCases7d} cases</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Predicted (14d)</p>
                          <p className="font-semibold">{pred.predictedCases14d} cases</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Trend</p>
                          <p className="font-semibold flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {pred.trend}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {pred.riskLevel !== "low" && (
                    <div className="mt-3 flex items-start gap-2 p-2 bg-white bg-opacity-50 rounded">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-xs">
                        {pred.riskLevel === "critical"
                          ? "Critical risk: Immediate action recommended"
                          : pred.riskLevel === "high"
                            ? "High risk: Close monitoring required"
                            : "Medium risk: Increased surveillance recommended"}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Methodology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>Data Analysis:</strong> Predictions are based on historical case data from the last 30 days,
            analyzing trends and growth patterns.
          </p>
          <p>
            <strong>Growth Rate Calculation:</strong> The system calculates the growth rate by comparing recent cases
            (last 7 days) with previous cases (7-14 days ago).
          </p>
          <p>
            <strong>Risk Assessment:</strong> Risk levels are determined based on predicted case growth over 14 days.
            Critical risk indicates potential doubling of cases.
          </p>
          <p>
            <strong>Confidence Score:</strong> Confidence increases with more data points. Predictions with limited data
            have lower confidence scores.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
