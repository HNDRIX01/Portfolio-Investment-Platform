"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Globe,
  Lock,
  Menu,
  TrendingUp,
  X,
  PieChart,
  LineChart,
  DollarSign,
  Briefcase,
  Shield,
  BarChart2,
  Smartphone,
  Users,
  MapPin
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";


// Import the Logout component
import Logout from "@/components/Logout";

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link className="flex items-center justify-center" href="#">
            <Image
              src="/ATB.png"
              alt="ATB Logo"
              width={120}
              height={50}
              className="h-12 w-auto"
            />
          </Link>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          <nav className="hidden md:flex gap-6 items-center">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/optimisation">
              Optimisation de Portefeuille
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/market">
              Marché
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#fonctionnalites">
              Fonctionnalités
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
              À propos
            </Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
              Contact
            </Link>
            {/* Replace login button with Logout */}
            <Logout />
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link className="text-sm font-medium py-2 hover:text-primary" href="/optimisation">
                Optimisation de Portefeuille
              </Link>
              <Link className="text-sm font-medium py-2 hover:text-primary" href="/market">
                Marché
              </Link>
              <Link className="text-sm font-medium py-2 hover:text-primary" href="#fonctionnalites">
                Fonctionnalités
              </Link>
              <Link className="text-sm font-medium py-2 hover:text-primary" href="#">
                À propos
              </Link>
              <Link className="text-sm font-medium py-2 hover:text-primary" href="#">
                Contact
              </Link>
              {/* Mobile menu: replace login with Logout */}
              <Logout />
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1 pt-20">
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-gray-50 opacity-70"></div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-primary/5"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute top-32 -left-16 w-72 h-72 rounded-full bg-primary/5"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 10,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />

              {/* Additional decorative elements */}
              <motion.div
                className="absolute top-1/4 right-1/4 w-20 h-20 rounded-full bg-blue-400/10"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 7,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute bottom-1/3 left-1/3 w-16 h-16 rounded-full bg-primary/10"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />

              {/* Abstract shapes */}
              <motion.div
                className="absolute top-1/2 right-1/3 w-24 h-6 rounded-full bg-blue-300/20 rotate-45"
                animate={{
                  rotate: [45, 60, 45],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 12,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
              <motion.div
                className="absolute bottom-1/4 left-1/4 w-32 h-4 rounded-full bg-primary/10 -rotate-12"
                animate={{
                  rotate: [-12, -25, -12],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 15,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            </div>

            <div className="container relative z-10 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
              <motion.div
                className="flex flex-col space-y-8 text-center max-w-3xl mx-auto"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={container}
              >
                <motion.div variants={item} className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                    Gestion de Portefeuille Intelligente
                  </h1>
                  <p className="text-gray-600 md:text-xl">
                    Suivez, analysez et optimisez vos investissements avec notre plateforme alimentée par l'IA.
                  </p>
                </motion.div>

                
                
              </motion.div>

              {/* Hero illustration - now below the title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative mt-12 max-w-2xl mx-auto"
              >
                <div className="relative">
                  {/* Main dashboard illustration */}
                  <div className="relative z-10 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="aspect-[4/2] bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
                      <div className="h-full rounded-lg bg-white shadow-sm p-3 md:p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary"></div>
                            <div className="text-xs md:text-sm font-medium">Tableau de bord</div>
                          </div>
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-300"></div>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-300"></div>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gray-300"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-3">
                          <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                            <div className="text-[10px] md:text-xs text-gray-500 mb-1">Valeur totale</div>
                            <div className="text-sm md:text-lg font-bold text-primary">25,430 DT</div>
                            <div className="text-[10px] md:text-xs text-green-500 flex items-center mt-1">
                              <ArrowRight className="h-2 w-2 md:h-3 md:w-3 rotate-45" />
                              +5.2%
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2 md:p-3">
                            <div className="text-[10px] md:text-xs text-gray-500 mb-1">Rendement</div>
                            <div className="text-sm md:text-lg font-bold text-gray-800">+12.7%</div>
                            <div className="text-[10px] md:text-xs text-gray-500 mt-1">Annualisé</div>
                          </div>
                        </div>

                        <div className="flex-12 bg-gray-50 rounded-lg p-2 md:p-3 mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-[10px] md:text-xs font-medium">Performance</div>
                            <div className="text-[10px] md:text-xs text-gray-500">Derniers 6 mois</div>
                          </div>
                          <div className="h-5 md:h-12 flex items-end gap-0.5 md:gap-1">
                            <div className="h-3 md:h-6 w-full bg-primary/10 rounded-sm"></div>
                            <div className="h-4 md:h-8 w-full bg-primary/20 rounded-sm"></div>
                            <div className="h-2.5 md:h-5 w-full bg-primary/10 rounded-sm"></div>
                            <div className="h-5 md:h-10 w-full bg-primary/30 rounded-sm"></div>
                            <div className="h-6 md:h-12 w-full bg-primary/40 rounded-sm"></div>
                            <div className="h-8 md:h-16 w-full bg-primary rounded-sm"></div>
                          </div>
                        </div>

                        <div className="flex gap-1 md:gap-2">
                          <div className="flex-1 bg-primary/5 rounded-lg p-1 md:p-2 flex items-center justify-center">
                            <PieChart className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                          </div>
                          <div className="flex-1 bg-primary/5 rounded-lg p-1 md:p-2 flex items-center justify-center">
                            <BarChart2 className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                          </div>
                          <div className="flex-1 bg-primary/5 rounded-lg p-1 md:p-2 flex items-center justify-center">
                            <LineChart className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                          </div>
                          <div className="flex-1 bg-primary/5 rounded-lg p-1 md:p-2 flex items-center justify-center">
                            <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 md:-top-6 md:-right-6 bg-white rounded-lg shadow-lg p-2 md:p-3 z-20"
                    animate={floatingAnimation}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-[10px] md:text-xs font-medium">Dividende</div>
                        <div className="text-[10px] md:text-xs text-green-600">+2.4%</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-3 -left-3 md:-bottom-4 md:-left-4 bg-white rounded-lg shadow-lg p-2 md:p-3 z-20"
                    animate={{
                      y: [0, 5, 0],
                      transition: {
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Briefcase className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-[10px] md:text-xs font-medium">Portefeuille</div>
                        <div className="text-[10px] md:text-xs text-blue-600">Diversifié</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute top-1/2 -right-6 md:-right-10 bg-white rounded-full shadow-lg p-2 md:p-3 z-20"
                    animate={{
                      x: [0, -3, 0],
                      transition: {
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <Smartphone className="h-3 w-3 md:h-5 md:w-5 text-primary" />
                  </motion.div>
                </div>
              </motion.div>

              
            </div>
          </section>

          <section id="fonctionnalites" className="w-full py-20 md:py-32 bg-gray-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              {/*<svg
                className="absolute -top-24 -right-24 text-primary/5 w-64 h-64"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M42.7,-73.4C55.9,-67.1,67.7,-57.2,75.9,-44.6C84.1,-32,88.7,-16,88.9,0.1C89.1,16.2,84.9,32.4,76.4,45.9C67.9,59.4,55,70.2,40.5,76.6C26,83,13,85,0.2,84.7C-12.6,84.4,-25.2,81.8,-38.3,76.5C-51.4,71.2,-65,63.2,-74.9,51.5C-84.8,39.8,-91,24.4,-92.8,8.3C-94.6,-7.8,-92,-24.5,-84.2,-38.1C-76.4,-51.7,-63.4,-62.1,-49.1,-67.8C-34.8,-73.5,-19.4,-74.5,-3.2,-69.5C13,-64.5,29.5,-79.7,42.7,-73.4Z"
                  transform="translate(100 100)"
                />
              </svg>*/}
              <svg
                className="absolute -bottom-16 -left-16 text-blue-500/5 w-48 h-48"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="currentColor"
                  d="M47.5,-73.8C59.3,-68.5,65.4,-51.5,70.9,-35.5C76.4,-19.5,81.3,-4.4,79.9,10.3C78.5,25,70.8,39.3,60.1,49.6C49.4,59.9,35.7,66.1,21.1,71.7C6.5,77.3,-9,82.3,-23.3,79.9C-37.5,77.5,-50.5,67.7,-60.9,55.3C-71.3,42.9,-79.1,27.9,-81.8,11.7C-84.5,-4.5,-82.1,-21.9,-74.3,-36.2C-66.5,-50.5,-53.3,-61.7,-39.2,-65.8C-25.1,-69.9,-10,-67,-2.8,-62.2C4.5,-57.4,9,-57.7,19.9,-63.5C30.8,-69.3,48.1,-80.7,47.5,-73.8Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>

            <div className="container px-4 md:px-6 max-w-7xl mx-auto relative z-10">
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                variants={container}
                className="text-center mb-16"
              >
                <motion.h2 variants={item} className="text-3xl font-bold tracking-tighter md:text-4xl mb-4">
                  Fonctionnalités Principales
                </motion.h2>
                <motion.p variants={item} className="mx-auto max-w-[700px] text-gray-500 md:text-lg">
                  Notre plateforme offre des outils puissants pour gérer vos investissements
                </motion.p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1, delay: 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="h-full relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full"></div>

                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <BarChart3 className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>Suivi en Temps Réel</CardTitle>
                      <CardDescription>
                        Visualisez l'évolution de votre portefeuille en temps réel avec des graphiques interactifs.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Mises à jour instantanées des cours
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Notifications personnalisables
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Tableaux de bord personnalisés
                        </li>
                      </ul>

                      {/* Illustration */}
                      <div className="mt-6 bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs font-medium">CAC 40</div>
                          <div className="text-xs text-green-600">+1.2%</div>
                        </div>
                        <div className="h-10 flex items-end space-x-1">
                          {[3, 5, 4, 6, 5, 7, 8, 7, 9, 8, 10, 9, 11, 10, 12].map((height, i) => (
                            <div
                              key={i}
                              className={`h-${height} w-full ${i > 7 ? "bg-green-500" : "bg-primary/40"} rounded-sm`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Link href="/dashboard/analytics">
                  <Card className="h-full relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full"></div>

                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>Analyse de Performance</CardTitle>
                      <CardDescription>
                        Obtenez des insights détaillés sur les performances de vos actifs et de votre portefeuille global.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Rapports détaillés et exportables
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Comparaison avec les indices de référence
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Analyse des risques et de la volatilité
                        </li>
                      </ul>

                      {/* Illustration */}
                      <div className="mt-6 bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="text-xs font-medium">Répartition</div>
                          <div className="text-xs text-gray-500">Par secteur</div>
                        </div>
                        <div className="flex h-10 items-stretch w-full">
                          <div className="w-3/12 bg-primary rounded-l-sm"></div>
                          <div className="w-2/12 bg-blue-400"></div>
                          <div className="w-4/12 bg-green-400"></div>
                          <div className="w-2/12 bg-yellow-400"></div>
                          <div className="w-1/12 bg-purple-400 rounded-r-sm"></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <div>Finance</div>
                          <div>Tech</div>
                          <div>Énergie</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1, delay: 0.3 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                >
                  <Card className="h-full relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full"></div>

                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>Recommandations IA</CardTitle>
                      <CardDescription>
                        Recevez des recommandations d'investissement personnalisées basées sur l'intelligence
                        artificielle.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-500">
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Suggestions adaptées à votre profil de risque
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Détection des opportunités de marché
                        </li>
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></div>
                          Optimisation de l'allocation d'actifs
                        </li>
                      </ul>

                      {/* Illustration */}
                      <div className="mt-6 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <PieChart className="h-3 w-3 text-primary" />
                          </div>
                          <div className="text-xs font-medium">Recommandation IA</div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border border-green-100">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <div className="text-xs">Achat recommandé: Renewable Energy Group</div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border border-red-100 mt-1">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <div className="text-xs">Vente suggérée: Tech Corp Holdings</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="w-full py-20 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
            </div>

            <div className="container relative z-10 px-4 md:px-6">
              <div className="grid gap-12 lg:grid-cols-2 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl mb-6">
                    Technologie de pointe pour vos investissements
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Notre plateforme combine l'expertise financière avec les dernières avancées en intelligence
                    artificielle pour vous offrir une expérience d'investissement optimale.
                  </p>

                  <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin  className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Marché national</h3>
                      <p className="text-sm text-gray-500">
                        Profitez d'opportunités d'investissement sur le marché local avec une interface simplifiée.
                      </p>
                    </div>
                  </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Lock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Sécurité renforcée</h3>
                        <p className="text-sm text-gray-500">
                          Protection de vos données et de vos actifs avec les normes de sécurité les plus strictes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Analyses avancées</h3>
                        <p className="text-sm text-gray-500">
                          Outils d'analyse technique et fondamentale pour des décisions éclairées
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.7 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {/* Main illustration */}
                  <div className="relative z-10 bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
                      <div className="w-full h-full bg-white rounded-xl shadow-sm p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                            <div className="text-sm font-medium">Analyse de marché</div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                          </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
                            <div className="text-xs text-gray-500 mb-1">Tendances</div>
                            <div className="flex-1 flex items-end space-x-1">
                            {[6, 10, 8, 12, 10, 14, 16, 14, 18, 16].map((height, i) => (
                              <div
                                key={i}
                                className={`w-full rounded-sm ${i > 5 ? "bg-green-500" : "bg-primary/40"}`}
                                style={{ height: `${height * 4}px` }} // Multiply for taller columns
                              ></div>
                            ))}

                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 flex flex-col">
                            <div className="text-xs text-gray-500 mb-1">Répartition</div>
                            <div className="flex-1 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full border-[12px] border-primary relative">
                              <div className="absolute inset-0 border-[12px] border-transparent border-t-blue-400 rounded-full"></div>
                              <div className="absolute inset-0 border-[12px] border-transparent border-r-green-400 rounded-full"></div>
                            </div>

                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-2">
                          <div className="bg-primary/5 rounded-lg p-2 flex items-center justify-center">
                            <BarChart2 className="h-4 w-4 text-primary" />
                          </div>
                          <div className="bg-primary/5 rounded-lg p-2 flex items-center justify-center">
                            <LineChart className="h-4 w-4 text-primary" />
                          </div>
                          <div className="bg-primary/5 rounded-lg p-2 flex items-center justify-center">
                            <PieChart className="h-4 w-4 text-primary" />
                          </div>
                          <div className="bg-primary/5 rounded-lg p-2 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-3 z-20"
                    animate={floatingAnimation}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs font-medium">Marché</div>
                        <div className="text-xs text-blue-600">Tunisien</div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-3 z-20"
                    animate={{
                      y: [0, 8, 0],
                      transition: {
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Shield className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs font-medium">Sécurité</div>
                        <div className="text-xs text-green-600">Avancée</div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full"></div>
                  <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/5 rounded-full"></div>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="w-full py-20 md:py-32 bg-primary text-white">
            <div className="container px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="flex flex-col items-center justify-center space-y-8 text-center"
              >
                <div className="space-y-4 max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">
                    Prêt à optimiser vos investissements ?
                  </h2>
                  <p className="text-white/80 md:text-xl">
                    Rejoignez notre plateforme dès aujourd'hui et prenez le contrôle de votre avenir financier.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 group">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Contacter un conseiller
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          <section className="w-full py-16 md:py-24 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(176,30,62,0.01)_1px,transparent_1px),linear-gradient(0deg,rgba(176,30,62,0.01)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <div className="container px-4 md:px-6 max-w-7xl mx-auto relative z-10">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.7 }}
                viewport={{ once: true }}
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
              >
                <div className="text-center relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <Users className="h-32 w-32 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">+500K</div>
                  <p className="text-gray-500">Utilisateurs actifs</p>
                </div>
                <div className="text-center relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <DollarSign className="h-32 w-32 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">€2.5B</div>
                  <p className="text-gray-500">Actifs sous gestion</p>
                </div>
                <div className="text-center relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <Globe className="h-32 w-32 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">+50</div>
                  <p className="text-gray-500">Stocks accessibles</p>
                </div>
                <div className="text-center relative">
                  <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <Smartphone className="h-32 w-32 text-primary" />
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <p className="text-gray-500">Support client</p>
                </div>
              </motion.div>
            </div>
          </section>
          
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div>
              <Image
                src="/ATB.png"
                alt="ATB Logo"
                width={120}
                height={50}
                className="h-12 w-auto mb-4 brightness-200"
              />
              <p className="text-gray-400 text-sm mt-4">
                La plateforme de gestion de portefeuille innovante de l'Arab Tunisian Bank.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Liens rapides</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Tarification
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Marchés Tunisiens
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Légal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>9, rue Hédi Nouira - 1001 Tunis</li>
                <li>+216 71 351 155</li>
                <li>contact@atb.com.tn</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400 text-sm">
            <p>© 2024 Arab Tunisian Bank. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
