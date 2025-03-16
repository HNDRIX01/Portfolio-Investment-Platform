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
  Percent,
  TrendingUp,
  Shield,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

// Updated industries list matching the Excel file sectors:
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
  const [step, setStep] = useState(1)
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [dividendRange, setDividendRange] = useState([0])
  const [riskTolerance, setRiskTolerance] = useState([5])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [dividendEnabled, setDividendEnabled] = useState(false)
  const [recommendedCompanies, setRecommendedCompanies] = useState<any[]>([])

  const toggleIndustry = (id: string) => {
    if (selectedIndustries.includes(id)) {
      setSelectedIndustries(selectedIndustries.filter((ind) => ind !== id))
    } else {
      setSelectedIndustries([...selectedIndustries, id])
    }
  }

  const toggleSelectAll = () => {
    if (selectedIndustries.length === industries.length) {
      setSelectedIndustries([])
    } else {
      setSelectedIndustries(industries.map((industry) => industry.id))
    }
  }

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
        const response = await fetch("http://localhost:8000/recommendations/get-companies/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sectors: selectedSectorNames }),
        })
        const data = await response.json()
        console.log("Companies matching selected sectors:", data.companies)
        setRecommendedCompanies(data.companies || [])
        setIsComplete(true)
      } catch (error) {
        console.error("Error fetching companies:", error)
      }
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Optimisation de Portefeuille</h1>
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
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
              style={{ width: isComplete ? "100%" : step === 1 ? "50%" : "75%" }}
            ></div>
          </div>
          <div className="flex justify-between">
            <div className="text-sm font-medium text-primary">Sélection des secteurs</div>
            <div className={`text-sm font-medium ${step >= 2 ? "text-primary" : "text-gray-400"}`}>
              Préférences d'investissement
            </div>
            <div className={`text-sm font-medium ${isComplete ? "text-primary" : "text-gray-400"}`}>
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
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Étape 1: Sélectionnez les secteurs d'activité
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Choisissez les secteurs dans lesquels vous souhaitez investir. Vous pouvez en sélectionner plusieurs.
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  {/* Select All Checkbox */}
                  <div className="mb-4">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        checked={selectedIndustries.length === industries.length}
                        onChange={toggleSelectAll}
                      />
                      <span className="ml-2 text-sm text-gray-700">Sélectionner tout</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {industries.map((industry) => (
                      <Card
                        key={industry.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedIndustries.includes(industry.id) ? "ring-2 ring-primary ring-offset-2" : ""
                        )}
                        onClick={() => toggleIndustry(industry.id)}
                      >
                        <div className="p-5 flex items-start space-x-4">
                          <div className={cn("p-3 rounded-full", industry.color)}>
                            <div className={industry.iconColor}>{industry.icon}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">{industry.name}</h3>
                              {selectedIndustries.includes(industry.id) && <Check className="h-5 w-5 text-primary" />}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">{industry.description}</p>
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
                  <div className="text-sm text-gray-500">{selectedIndustries.length} secteur(s) sélectionné(s)</div>
                  <Button onClick={handleNext} disabled={selectedIndustries.length === 0} className="flex items-center">
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
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">Étape 2: Préférences d'investissement</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Précisez vos objectifs de rendement et votre profil de risque pour affiner votre portefeuille.
                  </p>
                </div>
                <div className="p-6 sm:p-8 space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center">
                          <Percent className="mr-2 h-4 w-4 text-primary" />
                          Rendement en dividendes
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Indiquez si vous souhaitez prioriser les actions versant des dividendes.
                        </p>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={dividendEnabled}
                            onChange={() => setDividendEnabled(!dividendEnabled)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          <span className="ms-3 text-sm font-medium text-gray-500">
                            {dividendEnabled ? "Activé" : "Désactivé"}
                          </span>
                        </label>
                      </div>
                    </div>
                    {dividendEnabled && (
                      <div className="mt-4 px-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">Rendement minimum souhaité</span>
                          <div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                            {dividendRange[0]}%
                          </div>
                        </div>
                        <Slider
                          value={dividendRange}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={setDividendRange}
                          disabled={!dividendEnabled}
                          className={!dividendEnabled ? "opacity-50" : ""}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900 flex items-center">
                          <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                          Tolérance au risque
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Évaluez votre niveau de confort face aux fluctuations de marché.
                        </p>
                      </div>
                      <div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                        {riskTolerance[0]}/10
                      </div>
                    </div>
                    <div className="px-4">
                      <Slider value={riskTolerance} min={1} max={10} step={1} onValueChange={setRiskTolerance} />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Faible</span>
                        <span>Modéré</span>
                        <span>Élevé</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
                    <h3 className="font-medium text-blue-800 flex items-center">
                      <Shield className="mr-2 h-5 w-5 text-blue-600" />
                      Comprendre le profil de risque
                    </h3>
                    <p className="mt-2 text-sm text-blue-600">
                      Un score de risque plus élevé peut offrir de meilleurs rendements potentiels, mais avec une
                      volatilité accrue. Un score plus bas privilégie la stabilité et la préservation du capital.
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
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
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
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 sm:p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Portefeuille optimisé avec succès !</h2>
                  <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
                    Votre portefeuille personnalisé a été créé en fonction de vos préférences et de votre profil
                    d'investisseur.
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <Card className="text-center p-5 bg-gray-50">
                      <h3 className="text-sm text-gray-500 mb-2">Rendement estimé</h3>
                      <p className="text-2xl font-bold text-primary">8.4%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {dividendEnabled ? `Dont ${dividendRange[0]}% en dividendes` : "Croissance du capital"}
                      </p>
                    </Card>
                    <Card className="text-center p-5 bg-gray-50">
                      <h3 className="text-sm text-gray-500 mb-2">Niveau de risque</h3>
                      <p className="text-2xl font-bold text-primary">Modéré</p>
                      <p className="text-xs text-gray-500 mt-1">Volatilité contrôlée</p>
                    </Card>
                    <Card className="text-center p-5 bg-gray-50">
                      <h3 className="text-sm text-gray-500 mb-2">Diversification</h3>
                      <p className="text-2xl font-bold text-primary">{selectedIndustries.length}</p>
                      <p className="text-xs text-gray-500 mt-1">Secteurs</p>
                    </Card>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Entreprises recommandées :</h3>
                    {recommendedCompanies.length > 0 ? (
                      <div className="space-y-4">
                        {recommendedCompanies.map((company, index) => (
                          <div key={index} className="p-4 border rounded-md">
                            <h4 className="font-bold">{company.Name || company.name}</h4>
                            <p className="text-sm text-gray-500">Secteur: {company.Sector}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucune entreprise trouvée pour les secteurs sélectionnés.</p>
                    )}
                  </div>
                  <div className="mt-8">
                    <Button size="lg" className="mr-4">
                      Voir le portefeuille détaillé
                    </Button>
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
    </div>
  )
}
