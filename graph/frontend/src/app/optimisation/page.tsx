"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Briefcase,
  Building2,
  Hammer,
  Home,
  Pill,
  Landmark,
  Car,
  ShoppingBag,
  Package,
  CreditCard,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  Shield,
  Leaf,
  TrendingDown,
  LineChart,
  Wallet,
  Info,
  Percent,
  DollarSign,
  PieChart,
  ChevronRight,
  Calendar,
  BarChart4,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"

// Define an interface for your stock objects
export interface Stock {
  id: string
  name: string
  sector: string
  currentPrice: string
  prediction: string
  trend: "positive" | "negative" | "neutral"
  weight: string
  historicalData: number[]
  peRatio: number
  dividendYield: string
  marketCap: string
  volume: string
  yearHigh: string
  yearLow: string
  analystRating: string
  riskScore: number
  esgScore: string
  description: string
}

// Full industries list
const industries = [
  {
    id: "agro",
    name: "Industries Agro-alimentaires",
    icon: <Briefcase className="h-6 w-6" />,
    color: "bg-amber-100",
    iconColor: "text-amber-600",
    description: "Entreprises de transformation des aliments et boissons",
  },
  {
    id: "construction",
    name: "Matériaux de Construction",
    icon: <Building2 className="h-6 w-6" />,
    color: "bg-gray-100",
    iconColor: "text-gray-600",
    description: "Production de ciment, acier, et autres matériaux de construction",
  },
  {
    id: "infrastructure",
    name: "Infrastructures et Travaux Publics",
    icon: <Hammer className="h-6 w-6" />,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    description: "Construction de routes, ponts et infrastructures publiques",
  },
  {
    id: "realestate",
    name: "Immobilier",
    icon: <Home className="h-6 w-6" />,
    color: "bg-green-100",
    iconColor: "text-green-600",
    description: "Investissement et développement immobilier",
  },
  {
    id: "pharma",
    name: "Industries Pharmaceutiques",
    icon: <Pill className="h-6 w-6" />,
    color: "bg-red-100",
    iconColor: "text-red-600",
    description: "Développement et production de médicaments",
  },
  {
    id: "banking",
    name: "Bancaire",
    icon: <Landmark className="h-6 w-6" />,
    color: "bg-indigo-100",
    iconColor: "text-indigo-600",
    description: "Services bancaires et financiers",
  },
  {
    id: "assurances",
    name: "Assurances",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-violet-100",
    iconColor: "text-violet-600",
    description: "Services d'assurance et gestion des risques",
  },
  {
    id: "auto",
    name: "Distribution Automobile",
    icon: <Car className="h-6 w-6" />,
    color: "bg-blue-100",
    iconColor: "text-blue-600",
    description: "Vente et distribution de véhicules",
  },
  {
    id: "consumer",
    name: "Biens de Consommation",
    icon: <ShoppingBag className="h-6 w-6" />,
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    description: "Production de biens pour les consommateurs",
  },
  {
    id: "misc",
    name: "Divers",
    icon: <Package className="h-6 w-6" />,
    color: "bg-yellow-100",
    iconColor: "text-yellow-600",
    description: "Secteurs diversifiés et variés",
  },
  {
    id: "leasing",
    name: "Leasing",
    icon: <CreditCard className="h-6 w-6" />,
    color: "bg-cyan-100",
    iconColor: "text-cyan-600",
    description: "Services de crédit-bail et location",
  },
  {
    id: "investment",
    name: "Sociétés d'Investissements",
    icon: <BarChart3 className="h-6 w-6" />,
    color: "bg-emerald-100",
    iconColor: "text-emerald-600",
    description: "Gestion de portefeuilles et investissements",
  },
  {
    id: "distribution",
    name: "Distribution Générale",
    icon: <ShoppingCart className="h-6 w-6" />,
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    description: "Commerce de détail et distribution",
  },
]

export default function OptimisationPage() {
  // ----------------------------------------------------------------------
  // STEP / STATE
  // ----------------------------------------------------------------------
  const [step, setStep] = useState<number>(1)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [riskTolerance, setRiskTolerance] = useState<number[]>([5])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [includeRSE, setIncludeRSE] = useState<boolean>(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [isStockDialogOpen, setIsStockDialogOpen] = useState<boolean>(false)
  const [stockWeight, setStockWeight] = useState<number[]>([20])
  const [selectedPortfolioTab, setSelectedPortfolioTab] = useState<string>("conservative")
  const [expandedPortfolioId, setExpandedPortfolioId] = useState<number | null>(null)
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000)

  // NEW: For saving the chosen portfolio
  const [selectedPortfolioChoice, setSelectedPortfolioChoice] = useState<number | null>(null)
  const [portfolioName, setPortfolioName] = useState<string>("")
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false)

  // ----------------------------------------------------------------------
  // RECOMMENDED PORTFOLIOS STATE
  // ----------------------------------------------------------------------
  const [recommendedPortfolios, setRecommendedPortfolios] = useState<any[]>([
    {
      id: 1,
      key: "conservative",
      name: "Premier Portefeuille",
      description: "Faible risque, stabilité et préservation du capital",
      expectedReturn: "5.2%",
      riskLevel: "Faible",
      initialValue: "10,000DT",
      estimatedValue: "10,520DT",
      volatility: "Faible (6.5%)",
      icon: <TrendingDown className="h-6 w-6 text-blue-600" />,
      color: "bg-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-600",
      stocks: [] as Stock[],
    },
    {
      id: 2,
      key: "balanced",
      name: "Deuxième Portefeuille",
      description: "Équilibre entre croissance et stabilité",
      expectedReturn: "8.4%",
      riskLevel: "Modéré",
      initialValue: "10,000DT",
      estimatedValue: "10,840DT",
      volatility: "Modérée (12.3%)",
      icon: <LineChart className="h-6 w-6 text-green-600" />,
      color: "bg-green-100",
      borderColor: "border-green-200",
      textColor: "text-green-600",
      stocks: [] as Stock[],
    },
    {
      id: 3,
      key: "dynamic",
      name: "Troisième Portefeuille",
      description: "Croissance agressive avec une volatilité plus élevée",
      expectedReturn: "12.7%",
      riskLevel: "Élevé",
      initialValue: "10,000DT",
      estimatedValue: "11,270DT",
      volatility: "Élevée (18.5%)",
      icon: <TrendingUp className="h-6 w-6 text-red-600" />,
      color: "bg-red-100",
      borderColor: "border-red-200",
      textColor: "text-red-600",
      stocks: [] as Stock[],
    },
  ])

  // ----------------------------------------------------------------------
  // TOGGLE INDUSTRY
  // ----------------------------------------------------------------------
  const toggleIndustry = (id: string): void => {
    if (selectedIndustries.includes(id)) {
      setSelectedIndustries(selectedIndustries.filter((ind) => ind !== id))
    } else {
      setSelectedIndustries([...selectedIndustries, id])
    }
  }

  // ----------------------------------------------------------------------
  // TOGGLE SELECT ALL
  // ----------------------------------------------------------------------
  const toggleSelectAll = (): void => {
    if (selectedIndustries.length === industries.length) {
      setSelectedIndustries([])
    } else {
      setSelectedIndustries(industries.map((industry) => industry.id))
    }
  }

  // ----------------------------------------------------------------------
  // INVESTMENT AMOUNT CHANGE
  // ----------------------------------------------------------------------
  const handleInvestmentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "")
    if (rawValue === "") {
      setInvestmentAmount(0)
      updatePortfolioProjections(0)
    } else {
      const value = Number.parseInt(rawValue)
      if (!isNaN(value)) {
        setInvestmentAmount(value)
        updatePortfolioProjections(value)
      }
    }
  }

  // ----------------------------------------------------------------------
  // UPDATE PORTFOLIO PROJECTIONS
  // ----------------------------------------------------------------------
  const updatePortfolioProjections = (amount: number): void => {
    const updatedPortfolios = recommendedPortfolios.map((portfolio) => {
      let returnRate = 1
      if (portfolio.key === "conservative") returnRate = 1.052
      else if (portfolio.key === "balanced") returnRate = 1.084
      else if (portfolio.key === "dynamic") returnRate = 1.127

      return {
        ...portfolio,
        initialValue: `${amount.toLocaleString()}DT`,
        estimatedValue: portfolio.estimatedValue
          ? `${Number(portfolio.estimatedValue).toLocaleString()}DT`
          : `${Math.round(amount * (1 + returnRate)).toLocaleString()}DT`,
      }
    })
    setRecommendedPortfolios(updatedPortfolios)
  }

  // ----------------------------------------------------------------------
  // CONVERT WEIGHTS -> STOCK ARRAY
  // ----------------------------------------------------------------------
  const convertWeightsToStocks = (weightsObj: { [ticker: string]: number }): Stock[] => {
    return Object.entries(weightsObj).map(([ticker, weight]) => ({
      id: ticker,
      name: ticker,
      sector: "N/A",
      currentPrice: "N/A",
      prediction: "N/A",
      trend: "neutral",
      weight: `${(weight * 100).toFixed(1)}%`,
      historicalData: [],
      peRatio: 0,
      dividendYield: "0%",
      marketCap: "N/A",
      volume: "N/A",
      yearHigh: "N/A",
      yearLow: "N/A",
      analystRating: "N/A",
      riskScore: 0,
      esgScore: "N/A",
      description: "",
    }))
  }

  // ----------------------------------------------------------------------
  // TRANSFORM PORTFOLIO FROM BACKEND
  // ----------------------------------------------------------------------
  const transformPortfolio = (blend: any, key: string, id: number) => {
    const annualReturn = blend.annual_return
    const vol = blend.volatility
    const expectedReturn = `${(annualReturn * 100).toFixed(1)}%`
    const riskLevel = vol < 0.07 ? "Faible" : vol < 0.12 ? "Modéré" : "Élevé"
    const initialValue = `${investmentAmount.toLocaleString()}DT`
    const estimatedValue = blend.estimatedValue
      ? `${Number(blend.estimatedValue).toLocaleString()}DT`
      : `${Math.round(investmentAmount * (1 + annualReturn)).toLocaleString()}DT`
    const volatilityText =
      riskLevel === "Faible"
        ? `Faible (${(vol * 100).toFixed(1)}%)`
        : riskLevel === "Modéré"
        ? `Modérée (${(vol * 100).toFixed(1)}%)`
        : `Élevée (${(vol * 100).toFixed(1)}%)`
    return {
      id,
      key,
      name:
        key === "conservative"
          ? "Premier Portefeuille"
          : key === "balanced"
          ? "Deuxième Portefeuille"
          : "Troisième Portefeuille",
      description:
        key === "conservative"
          ? "Faible risque, stabilité et préservation du capital"
          : key === "balanced"
          ? "Équilibre entre croissance et stabilité"
          : "Croissance agressive avec une volatilité plus élevée",
      expectedReturn,
      riskLevel,
      initialValue,
      estimatedValue,
      volatility: volatilityText,
      icon:
        key === "conservative" ? (
          <TrendingDown className="h-6 w-6 text-blue-600" />
        ) : key === "balanced" ? (
          <LineChart className="h-6 w-6 text-green-600" />
        ) : (
          <TrendingUp className="h-6 w-6 text-red-600" />
        ),
      color:
        key === "conservative"
          ? "bg-blue-100"
          : key === "balanced"
          ? "bg-green-100"
          : "bg-red-100",
      borderColor:
        key === "conservative"
          ? "border-blue-200"
          : key === "balanced"
          ? "border-green-200"
          : "border-red-200",
      textColor:
        key === "conservative"
          ? "text-blue-600"
          : key === "balanced"
          ? "text-green-600"
          : "text-red-600",
      stocks: convertWeightsToStocks(blend.weights),
    }
  }

  // ----------------------------------------------------------------------
  // HANDLE NEXT (API CALL)
  // ----------------------------------------------------------------------
  const handleNext = async () => {
    if (step === 1 && selectedIndustries.length > 0) {
      setStep(2)
    } else if (step === 2) {
      setIsSubmitting(true)
      try {
        const selectedSectorNames = selectedIndustries.map((id) => {
          const industry = industries.find((ind) => ind.id === id)
          return industry ? industry.name : id
        })

        const response = await fetch(
          "http://localhost:8000/recommendations/get-companies/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sectors: selectedSectorNames,
              risk_amount: riskTolerance[0] / 10,
              investment_amount: investmentAmount,
            }),
          }
        )
        const data = await response.json()
        console.log("API result:", data)
        const { blend1, blend2, blend3 } = data.blended_portfolios

        const newPortfolios = [
          transformPortfolio(blend1, "conservative", 1),
          transformPortfolio(blend2, "balanced", 2),
          transformPortfolio(blend3, "dynamic", 3),
        ]
        setRecommendedPortfolios(newPortfolios)
        setIsComplete(true)
      } catch (error) {
        console.error("Error fetching portfolios:", error)
      }
      setIsSubmitting(false)
    }
  }

  // ----------------------------------------------------------------------
  // HANDLE BACK
  // ----------------------------------------------------------------------
  const handleBack = () => {
    if (step === 2) setStep(1)
  }

  // ----------------------------------------------------------------------
  // OPEN STOCK DETAILS
  // ----------------------------------------------------------------------
  const openStockDetails = (stock: Stock) => {
    setSelectedStock(stock)
    setStockWeight([Number.parseFloat(stock.weight)])
    setIsStockDialogOpen(true)
  }

  // ----------------------------------------------------------------------
  // UPDATE STOCK WEIGHT
  // ----------------------------------------------------------------------
  const updateStockWeight = () => {
    if (!selectedStock) return
    const portfolioIndex = recommendedPortfolios.findIndex((portfolio) =>
      portfolio.stocks.some((s: Stock) => s.id === selectedStock.id)
    )
    if (portfolioIndex === -1) return
    const updatedPortfolios = [...recommendedPortfolios]
    const stockIndex = updatedPortfolios[portfolioIndex].stocks.findIndex(
      (s: Stock) => s.id === selectedStock.id
    )
    updatedPortfolios[portfolioIndex].stocks[stockIndex] = {
      ...updatedPortfolios[portfolioIndex].stocks[stockIndex],
      weight: `${stockWeight[0].toFixed(1)}%`,
    }
    setRecommendedPortfolios(updatedPortfolios)
    setIsStockDialogOpen(false)
  }

  // ----------------------------------------------------------------------
  // GET STOCK COLOR
  // ----------------------------------------------------------------------
  const getStockColor = (stockName: string, portfolioKey: string): string => {
    const colors = [
      "#3B82F6", // blue-500
      "#10B981", // emerald-500
      "#F59E0B", // amber-500
      "#8B5CF6", // violet-500
      "#EC4899", // pink-500
      "#06B6D4", // cyan-500
      "#F97316", // orange-500
      "#6366F1", // indigo-500
      "#EF4444", // red-500
      "#14B8A6", // teal-500
    ]
    let hash = 0
    const combined = portfolioKey + stockName
    for (let i = 0; i < combined.length; i++) {
      hash = combined.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  // ----------------------------------------------------------------------
  // TOGGLE EXPAND/COLLAPSE
  // ----------------------------------------------------------------------
  const toggleExpandPortfolio = (id: number) => {
    setExpandedPortfolioId(expandedPortfolioId === id ? null : id)
  }

  // ----------------------------------------------------------------------
  // NEW: WHEN USER CLICKS "SÉLECTIONNER CE PORTEFEUILLE"
  // ----------------------------------------------------------------------
  const handleSelectPortfolio = (portfolioId: number) => {
    // store the chosen "portfolio_choice" number (1, 2, or 3)
    setSelectedPortfolioChoice(portfolioId)
    // reset any old name
    setPortfolioName("")
    // open dialog
    setIsSaveDialogOpen(true)
  }

  // ----------------------------------------------------------------------
  // NEW: CALL DJANGO's "save-generated-portfolio" ENDPOINT
  // ----------------------------------------------------------------------
  const handleSavePortfolio = async () => {
    if (!selectedPortfolioChoice) return
    try {
      const response = await fetch(
        "http://localhost:8000/recommendations/save-generated-portfolio/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            portfolio_choice: selectedPortfolioChoice,
            portfolio_name: portfolioName || "Mon Portefeuille",
          }),
          credentials: "include", // if you need cookie-based auth
        }
      )
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Save portfolio error:", errorData)
        alert("Erreur lors de l'enregistrement du portefeuille: " + (errorData.error || response.statusText))
        return
      }

      const data = await response.json()
      console.log("Portfolio saved:", data)
      alert(`Portefeuille enregistré avec succès !\nID: ${data.portfolio_id}`)

      // close dialog
      setIsSaveDialogOpen(false)
      setSelectedPortfolioChoice(null)
      setPortfolioName("")
    } catch (error) {
      console.error("Error saving portfolio:", error)
      alert("Erreur lors de l'enregistrement du portefeuille.")
    }
  }

  // ----------------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Optimisation de Portefeuille
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Créez un portefeuille optimisé en fonction de vos préférences et de votre profil d'investisseur
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/home/investor">
                <Button variant="outline" size="sm" className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
              style={{ width: isComplete ? "100%" : step === 1 ? "50%" : "75%" }}
            ></div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm font-medium text-primary">
              Sélection des secteurs
            </div>
            <div
              className={`text-sm font-medium ${
                step >= 2 ? "text-primary" : "text-gray-400"
              }`}
            >
              Préférences d'investissement
            </div>
            <div
              className={`text-sm font-medium ${
                isComplete ? "text-primary" : "text-gray-400"
              }`}
            >
              Résultats
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Étape 1: Sélectionnez les secteurs d'activité
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Choisissez les secteurs dans lesquels vous souhaitez investir. Vous pouvez en sélectionner plusieurs.
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="mb-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox rounded text-primary"
                        checked={selectedIndustries.length === industries.length}
                        onChange={toggleSelectAll}
                      />
                      <span className="ml-2 text-sm text-gray-700">Sélectionner tout</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                    {industries.map((industry) => (
                      <Card
                        key={industry.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md border",
                          selectedIndustries.includes(industry.id)
                            ? "ring-2 ring-primary ring-offset-2 border-primary/20"
                            : "border-gray-200"
                        )}
                        onClick={() => toggleIndustry(industry.id)}
                      >
                        <div className="p-5 flex items-start space-x-4">
                          <div className={cn("p-3 rounded-full", industry.color)}>
                            <div className={industry.iconColor}>{industry.icon}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">
                                {industry.name}
                              </h3>
                              {selectedIndustries.includes(industry.id) && (
                                <Check className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              {industry.description}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {selectedIndustries.length === 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-700">
                        Veuillez sélectionner au moins un secteur pour continuer.
                      </p>
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 sm:px-8 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <div className="text-sm text-gray-500">
                    {selectedIndustries.length} secteur(s) sélectionné(s)
                  </div>
                  <Button
                    onClick={handleNext}
                    disabled={selectedIndustries.length === 0}
                    className="flex items-center"
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Étape 2: Préférences d'investissement
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Précisez vos objectifs de rendement et votre profil de risque pour affiner votre portefeuille.
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="p-6 border border-primary/20 shadow-sm">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            Tolérance au risque
                          </h3>
                          <p className="text-sm text-gray-500">
                            Définissez votre niveau de confort face aux fluctuations de marché
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Niveau de risque</span>
                          <div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                            {riskTolerance[0]}/10
                          </div>
                        </div>
                        <Slider
                          value={riskTolerance}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={setRiskTolerance}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Faible</span>
                          <span>Modéré</span>
                          <span>Élevé</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                        <p>
                          <span className="font-medium">Niveau actuel: </span>
                          {riskTolerance[0] <= 3
                            ? "Conservateur"
                            : riskTolerance[0] <= 7
                            ? "Équilibré"
                            : "Dynamique"}
                        </p>
                        <p className="mt-1">
                          {riskTolerance[0] <= 3
                            ? "Priorité à la préservation du capital avec des rendements modestes."
                            : riskTolerance[0] <= 7
                            ? "Équilibre entre croissance et stabilité avec une volatilité modérée."
                            : "Recherche de croissance maximale avec une volatilité plus élevée."}
                        </p>
                      </div>
                    </Card>
                    <Card className="p-6 border border-primary/20 shadow-sm">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <DollarSign className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            Montant à investir
                          </h3>
                          <p className="text-sm text-gray-500">
                            Définissez le capital que vous souhaitez investir
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Montant</span>
                          <div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                            {investmentAmount.toLocaleString()}DT
                          </div>
                        </div>
                        <div className="relative mt-4">
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={
                                investmentAmount === 0 ? "" : investmentAmount.toString()
                              }
                              onChange={handleInvestmentAmountChange}
                              className="w-full p-3 border border-gray-300 rounded-md text-lg font-medium text-center"
                              placeholder="Montant en DT"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-gray-500">DT</span>
                            </div>
                          </div>
                          <div className="text-center mt-2 text-sm text-gray-500">
                            {investmentAmount > 0 &&
                              `${investmentAmount.toLocaleString()}DT`}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <button
                            className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() =>
                              handleInvestmentAmountChange({
                                target: { value: "5000" },
                              } as React.ChangeEvent<HTMLInputElement>)
                            }
                          >
                            5 000DT
                          </button>
                          <button
                            className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() =>
                              handleInvestmentAmountChange({
                                target: { value: "10000" },
                              } as React.ChangeEvent<HTMLInputElement>)
                            }
                          >
                            10 000DT
                          </button>
                          <button
                            className="px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() =>
                              handleInvestmentAmountChange({
                                target: { value: "50000" },
                              } as React.ChangeEvent<HTMLInputElement>)
                            }
                          >
                            50 000DT
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                        <p>
                          <span className="font-medium">Impact: </span>
                          Le montant investi affectera directement les projections de rendement de votre portefeuille.
                        </p>
                      </div>
                    </Card>
                    <Card className="p-6 border border-primary/20 shadow-sm">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <Leaf className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            Investissement Durable
                          </h3>
                          <p className="text-sm text-gray-500">
                            Privilégiez les entreprises engagées dans des pratiques responsables
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-medium text-gray-900">Critères ESG</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Environnementaux, Sociaux et de Gouvernance
                            </p>
                          </div>
                          <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={includeRSE}
                                onChange={() => setIncludeRSE(!includeRSE)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              <span className="ms-3 text-sm font-medium text-gray-500">
                                {includeRSE ? "Activé" : "Désactivé"}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
                        <p>
                          <span className="font-medium">Impact: </span>
                          {includeRSE
                            ? "Votre portefeuille sera composé d'entreprises ayant un impact positif sur l'environnement et la société."
                            : "Aucune restriction ESG ne sera appliquée à votre portefeuille."}
                        </p>
                      </div>
                    </Card>
                  </div>
                  <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-100">
                    <h3 className="font-medium text-blue-800 flex items-center">
                      <Info className="mr-2 h-5 w-5 text-blue-600" />
                      Comprendre l'impact de vos choix
                    </h3>
                    <p className="mt-2 text-sm text-blue-600">
                      Un score de risque plus élevé peut offrir de meilleurs rendements potentiels, 
                      mais avec une volatilité accrue. L'investissement durable peut influencer la 
                      composition de votre portefeuille en favorisant les entreprises avec de bonnes pratiques ESG.
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 sm:px-8 bg-gray-50 border-t border-gray-200 flex justify-between">
                  <Button variant="outline" onClick={handleBack} className="flex items-center">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button onClick={handleNext} disabled={isSubmitting} className="flex items-center">
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Optimisation en cours...
                      </>
                    ) : (
                      <>
                        Optimiser mon portefeuille
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {isComplete && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-8 sm:p-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Portefeuilles optimisés
                    </h2>
                    <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
                      Voici trois portefeuilles personnalisés créés en fonction de vos 
                      préférences et de votre profil d'investisseur.
                    </p>
                  </div>
                  <div className="mb-8">
                    <Tabs
                      defaultValue="conservative"
                      value={selectedPortfolioTab}
                      onValueChange={setSelectedPortfolioTab}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-3 w-full mb-6">
                        <TabsTrigger
                          value="conservative"
                          className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                        >
                          <div className="h-4 w-4 mr-2 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                          Premier Portefeuille
                        </TabsTrigger>
                        <TabsTrigger
                          value="balanced"
                          className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
                        >
                          <div className="h-4 w-4 mr-2 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                            2
                          </div>
                          Deuxième Portefeuille
                        </TabsTrigger>
                        <TabsTrigger
                          value="dynamic"
                          className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
                        >
                          <div className="h-4 w-4 mr-2 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                            3
                          </div>
                          Troisième Portefeuille
                        </TabsTrigger>
                      </TabsList>

                      {recommendedPortfolios.map((portfolio) => (
                        <TabsContent key={portfolio.key} value={portfolio.key} className="mt-0">
                          <Card className={cn("border rounded-xl shadow-md overflow-hidden", portfolio.borderColor)}>
                            <CardHeader className={cn("pb-3", portfolio.color)}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 rounded-full bg-white shadow-sm">
                                    {portfolio.icon}
                                  </div>
                                  <div>
                                    <CardTitle className="text-xl">{portfolio.name}</CardTitle>
                                    <CardDescription>
                                      {portfolio.description}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className={cn("text-2xl font-bold", portfolio.textColor)}>
                                  {portfolio.expectedReturn}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                  <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-lg bg-gray-50 space-y-1">
                                      <div className="flex items-center text-sm text-gray-500">
                                        <Target className="h-4 w-4 mr-2 text-gray-400" />
                                        Niveau de risque
                                      </div>
                                      <div className="text-lg font-semibold text-gray-900">
                                        {portfolio.riskLevel}
                                      </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-gray-50 space-y-1">
                                      <div className="flex items-center text-sm text-gray-500">
                                        <BarChart4 className="h-4 w-4 mr-2 text-gray-400" />
                                        Volatilité
                                      </div>
                                      <div className="text-lg font-semibold text-gray-900">
                                        {portfolio.volatility}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-4 rounded-lg bg-gray-50 space-y-2 mb-6">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                      Projection à 1 an
                                    </div>
                                    <div className="flex justify-between items-end">
                                      <div>
                                        <p className="text-xs text-gray-500">Investissement</p>
                                        <p className="text-sm font-medium">
                                          {portfolio.initialValue}
                                        </p>
                                      </div>
                                      <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />
                                      <div>
                                        <p className="text-xs text-gray-500">Valeur estimée</p>
                                        <p className="text-lg font-bold text-primary">
                                          {portfolio.estimatedValue}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                                      <Wallet className="mr-2 h-4 w-4 text-primary" />
                                      Composition détaillée
                                    </h4>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                                      {portfolio.stocks.map((stock: Stock, index: number) => (
                                        <div
                                          key={index}
                                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                                          onClick={() => openStockDetails(stock)}
                                        >
                                          <div className="flex justify-between items-center mb-1">
                                            <h5 className="font-medium text-gray-900">{stock.name}</h5>
                                            <span className="text-sm font-medium px-2 py-1 bg-white rounded-full shadow-sm">
                                              {stock.weight}
                                            </span>
                                          </div>
                                          <div className="flex justify-between text-xs text-gray-500">
                                            <span>{stock.sector}</span>
                                            <span className="font-medium">{stock.currentPrice}</span>
                                          </div>
                                          <div className="flex justify-between items-center mt-2">
                                            <div className="flex items-center text-xs text-gray-500">
                                              <Clock className="h-3 w-3 mr-1" />
                                              <span>Prédiction 12 mois</span>
                                            </div>
                                            <span
                                              className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-full",
                                                stock.trend === "positive"
                                                  ? "bg-green-100 text-green-700"
                                                  : stock.trend === "negative"
                                                  ? "bg-red-100 text-red-700"
                                                  : "bg-blue-100 text-blue-700"
                                              )}
                                            >
                                              {stock.prediction}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-700 mb-4 flex items-center">
                                    <PieChart className="mr-2 h-4 w-4 text-primary" />
                                    Répartition du portefeuille
                                  </h4>
                                  <div className="h-[350px] w-full bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <RechartsPieChart>
                                        <Pie
                                          data={portfolio.stocks.map((stock: Stock) => ({
                                            name: stock.name,
                                            value: parseFloat(stock.weight),
                                            fill: getStockColor(stock.name, portfolio.key),
                                          }))}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius={80}
                                          outerRadius={120}
                                          paddingAngle={2}
                                          dataKey="value"
                                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                          labelLine={false}
                                        >
                                          {portfolio.stocks.map((stock: Stock, index: number) => (
                                            <Cell
                                              key={`cell-${index}`}
                                              fill={getStockColor(stock.name, portfolio.key)}
                                              stroke="white"
                                              strokeWidth={2}
                                            />
                                          ))}
                                        </Pie>
                                        <Tooltip
                                          formatter={(value) => `${value}%`}
                                          labelFormatter={(name) => `${name}`}
                                          contentStyle={{
                                            borderRadius: "8px",
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                            border: "none",
                                            padding: "8px 12px",
                                          }}
                                        />
                                      </RechartsPieChart>
                                    </ResponsiveContainer>
                                  </div>
                                  <div className="mt-4 grid grid-cols-2 gap-2">
                                    {portfolio.stocks.map((stock: Stock, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center text-sm"
                                      >
                                        <div
                                          className="w-3 h-3 rounded-full mr-2"
                                          style={{
                                            backgroundColor: getStockColor(stock.name, portfolio.key),
                                          }}
                                        />
                                        <span className="truncate text-gray-600">{stock.name}</span>
                                        <span className="ml-1 text-gray-500 font-medium">{stock.weight}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50 border-t flex justify-center items-center py-6">
                              <Button
                                className="w-full"
                                onClick={() => handleSelectPortfolio(portfolio.id)}
                              >
                                <Sparkles className="mr-2 h-4 w-4" />
                                Sélectionner ce portefeuille
                              </Button>
                            </CardFooter>
                          </Card>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                  <div className="mt-12">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Comparaison des portefeuilles
                    </h3>
                    <div className="space-y-4">
                      {recommendedPortfolios.map((portfolio) => (
                        <Card
                          key={portfolio.id}
                          className={cn(
                            "border transition-all duration-300",
                            expandedPortfolioId === portfolio.id
                              ? portfolio.borderColor
                              : "border-gray-200"
                          )}
                        >
                          <div
                            className="p-4 flex items-center justify-between cursor-pointer"
                            onClick={() => toggleExpandPortfolio(portfolio.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={cn("p-2 rounded-full", portfolio.color)}>
                                {portfolio.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  {portfolio.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {portfolio.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Rendement estimé</p>
                                <p className={cn("text-lg font-bold", portfolio.textColor)}>
                                  {portfolio.expectedReturn}
                                </p>
                              </div>
                              <div>
                                {expandedPortfolioId === portfolio.id ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          {expandedPortfolioId === portfolio.id && (
                            <div className="p-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-500">Niveau de risque</p>
                                  <p className="text-lg font-semibold">{portfolio.riskLevel}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-500">Volatilité</p>
                                  <p className="text-lg font-semibold">{portfolio.volatility}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-sm text-gray-500">Valeur estimée (1 an)</p>
                                  <p className="text-lg font-semibold">{portfolio.estimatedValue}</p>
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  className={cn("mr-2", portfolio.textColor)}
                                  onClick={() => setSelectedPortfolioTab(portfolio.key)}
                                >
                                  Voir les détails
                                </Button>
                                {/* 
                                  Another "Sélectionner" button in expanded view
                                */}
                                <Button onClick={() => handleSelectPortfolio(portfolio.id)}>
                                  Sélectionner
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div className="text-center mt-10">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        setStep(1)
                        setIsComplete(false)
                      }}
                    >
                      Recommencer
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialog for stock details */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-xl">
          {selectedStock && (
            <>
              <DialogHeader className="p-6 border-b">
                <DialogTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl font-bold">{selectedStock.name}</span>
                    <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {selectedStock.sector}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {selectedStock.currentPrice}
                  </span>
                </DialogTitle>
                <DialogDescription>
                  <div className="flex items-center mt-2">
                    <span
                      className={cn(
                        "text-sm font-medium px-3 py-1 rounded-full mr-3",
                        selectedStock.trend === "positive"
                          ? "bg-green-100 text-green-700"
                          : selectedStock.trend === "negative"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      )}
                    >
                      {selectedStock.prediction}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Prédiction à 12 mois
                    </span>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-3 rounded-none border-b p-0 h-12">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Aperçu
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Détails
                  </TabsTrigger>
                  <TabsTrigger
                    value="adjust"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                  >
                    Ajuster
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="overview"
                  className="p-6 focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        À propos
                      </h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {selectedStock.description}
                      </p>
                      <h4 className="text-sm font-medium text-gray-500 mt-6 mb-3">
                        Indicateurs clés
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <DollarSign className="h-4 w-4 text-primary mr-1" />
                            <span className="text-xs text-gray-500">P/E Ratio</span>
                          </div>
                          <p className="text-lg font-medium">{selectedStock.peRatio}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Percent className="h-4 w-4 text-primary mr-1" />
                            <span className="text-xs text-gray-500">Dividende</span>
                          </div>
                          <p className="text-lg font-medium">{selectedStock.dividendYield}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <BarChart3 className="h-4 w-4 text-primary mr-1" />
                            <span className="text-xs text-gray-500">Cap. Marché</span>
                          </div>
                          <p className="text-lg font-medium">{selectedStock.marketCap}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Leaf className="h-4 w-4 text-primary mr-1" />
                            <span className="text-xs text-gray-500">Score ESG</span>
                          </div>
                          <p className="text-lg font-medium">{selectedStock.esgScore}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        Évolution du cours
                      </h4>
                      <div className="h-48 bg-gray-50 rounded-lg p-4 flex items-end">
                        {selectedStock.historicalData.map((price: number, i: number) => (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center justify-end"
                          >
                            <div
                              className={cn(
                                "w-6 rounded-t-md",
                                i === selectedStock.historicalData.length - 1
                                  ? "bg-primary"
                                  : "bg-primary/60"
                              )}
                              style={{
                                height: `${(price / Math.max(...selectedStock.historicalData)) *
                                  100}px`,
                              }}
                            ></div>
                            <span className="text-xs text-gray-500 mt-2">
                              {i === 0
                                ? "6m"
                                : i === selectedStock.historicalData.length - 1
                                ? "Auj."
                                : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                      <h4 className="text-sm font-medium text-gray-500 mt-6 mb-3">
                        Analyse
                      </h4>
                      <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Recommandation</span>
                          <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                            {selectedStock.analystRating}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Niveau de risque</span>
                            <span className="text-sm font-medium">
                              {selectedStock.riskScore}/10
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full",
                                selectedStock.riskScore < 3
                                  ? "bg-green-500"
                                  : selectedStock.riskScore < 5
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              )}
                              style={{
                                width: `${(selectedStock.riskScore / 10) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="details"
                  className="p-6 focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-4">
                        Données de marché
                      </h4>
                      <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-500">Cours actuel</span>
                          <span className="text-sm font-medium">
                            {selectedStock.currentPrice}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-500">Volume</span>
                          <span className="text-sm font-medium">{selectedStock.volume}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-500">Plus haut (52 sem.)</span>
                          <span className="text-sm font-medium">{selectedStock.yearHigh}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-500">Plus bas (52 sem.)</span>
                          <span className="text-sm font-medium">{selectedStock.yearLow}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-500">Capitalisation</span>
                          <span className="text-sm font-medium">{selectedStock.marketCap}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-4">
                        Indicateurs financiers
                      </h4>
                      <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-500">P/E Ratio</span>
                          <span className="text-sm font-medium">{selectedStock.peRatio}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-500">Rendement du dividende</span>
                          <span className="text-sm font-medium">
                            {selectedStock.dividendYield}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-500">Score ESG</span>
                          <span className="text-sm font-medium">{selectedStock.esgScore}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-500">Recommandation</span>
                          <span className="text-sm font-medium">
                            {selectedStock.analystRating}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-500">
                            Prédiction à 12 mois
                          </span>
                          <span
                            className={cn(
                              "text-sm font-medium",
                              selectedStock.trend === "positive"
                                ? "text-green-600"
                                : selectedStock.trend === "negative"
                                ? "text-red-600"
                                : "text-blue-600"
                            )}
                          >
                            {selectedStock.prediction}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="adjust"
                  className="p-6 focus-visible:outline-none focus-visible:ring-0"
                >
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-gray-700 mb-6">
                      Ajuster la pondération dans le portefeuille
                    </h4>
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-gray-500">Pondération actuelle</span>
                        <div className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-full text-sm">
                          {stockWeight[0].toFixed(1)}%
                        </div>
                      </div>
                      <Slider
                        value={stockWeight}
                        min={5}
                        max={50}
                        step={5}
                        onValueChange={setStockWeight}
                        className="py-4"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>5%</span>
                        <span>25%</span>
                        <span>50%</span>
                      </div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700 mb-6">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-blue-500" />
                        <p>
                          Ajuster la pondération de cette action modifiera la composition 
                          globale de votre portefeuille. Les autres actions seront ajustées proportionnellement.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={updateStockWeight}>
                        Appliquer les changements
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* NEW DIALOG FOR SAVING THE PORTFOLIO */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer ce portefeuille</DialogTitle>
            <DialogDescription>
              Donnez un nom à votre nouveau portefeuille.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Nom du portefeuille
            </label>
            <input
              type="text"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Ex: Mon Portefeuille Dynamique"
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePortfolio}>
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
