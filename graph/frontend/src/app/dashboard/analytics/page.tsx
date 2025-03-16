"use client"

import { useEffect, useState } from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  BarChart3,
  Briefcase,
  TrendingUp,
  Loader2,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface PortfolioHistory {
  date: string
  value: number
}

interface PortfolioData {
  id: string
  name: string
  history: PortfolioHistory[]
}

interface AnalyticsData {
  total_gain: number
  total_value: number
  weekly_growth: number
  active_portfolios: number
  portfolios: PortfolioData[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm font-bold text-burgundy">${payload[0].value.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPortfolioIndex, setCurrentPortfolioIndex] = useState<number>(0)

  useEffect(() => {
    // Since the access token is stored in an HttpOnly cookie,
    // we send the request with credentials so the cookie is included.
    fetch("http://localhost:8000/api/analytics/", {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in first.")
        }
        if (!response.ok) throw new Error("Network response was not ok")
        return response.json()
      })
      .then((data: AnalyticsData) => {
        setAnalytics(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Handlers for navigation buttons
  const nextPortfolio = () => {
    if (!analytics) return
    setCurrentPortfolioIndex((prevIndex) => (prevIndex + 1) % analytics.portfolios.length)
  }

  const prevPortfolio = () => {
    if (!analytics) return
    setCurrentPortfolioIndex((prevIndex) =>
      prevIndex === 0 ? analytics.portfolios.length - 1 : prevIndex - 1
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-burgundy animate-spin mb-4" />
        <h3 className="text-xl font-medium text-gray-700">Loading analytics data...</h3>
        <p className="text-gray-500 mt-2">Please wait while we fetch your portfolio information</p>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="bg-red-50 border-l-4 border-burgundy p-6 rounded-lg max-w-2xl w-full">
          <h3 className="text-xl font-medium text-red-700 mb-2">Unable to load analytics</h3>
          <p className="text-red-600">{error || "No data available. Please try again later."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-burgundy hover:bg-burgundy/90 text-white rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const portfolios = analytics.portfolios
  const currentPortfolio = portfolios[currentPortfolioIndex]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your investment performance and portfolio metrics
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Gain"
            value={`$${analytics.total_gain.toFixed(2)}`}
            icon={<DollarSign />}
            trend={analytics.total_gain >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Portfolio Value"
            value={`$${analytics.total_value.toFixed(2)}`}
            icon={<BarChart3 />}
          />
          <StatCard
            title="Active Portfolios"
            value={analytics.active_portfolios.toString()}
            icon={<Briefcase />}
          />
          <StatCard
            title="Weekly Growth"
            value={`${analytics.weekly_growth.toFixed(2)}%`}
            icon={<TrendingUp />}
            trend={analytics.weekly_growth >= 0 ? "up" : "down"}
          />
        </div>

        {/* Portfolio Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-burgundy/20 overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{currentPortfolio.name}</h2>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">
                  Portfolio {currentPortfolioIndex + 1} of {portfolios.length}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={prevPortfolio}
                    className="p-2 rounded-full hover:bg-burgundy/10 text-burgundy transition-colors"
                    aria-label="Previous portfolio"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextPortfolio}
                    className="p-2 rounded-full hover:bg-burgundy/10 text-burgundy transition-colors"
                    aria-label="Next portfolio"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <PortfolioChart data={currentPortfolio.history} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: string
  icon: React.ReactNode
  trend?: "up" | "down"
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-burgundy/20 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-burgundy/10 rounded-lg text-burgundy">{icon}</div>
        {trend && (
          <div className={`flex items-center ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {trend === "up" ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function PortfolioChart({ data }: { data: PortfolioHistory[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-gray-50 rounded-lg border border-dashed border-burgundy/30">
        <BarChart3 className="h-12 w-12 text-burgundy/40 mb-2" />
        <p className="text-gray-600 text-center">
          No historical data available for this portfolio.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B0020" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8B0020" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Portfolio Value"
            stroke="#8B0020"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "white" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#8B0020" }}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
