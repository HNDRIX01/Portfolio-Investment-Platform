"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Grid,
  List,
  ArrowUp,
  ArrowDown,
  Star,
  BarChart2,
  Clock,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Asset type definition
type Asset = {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  sparkline: number[]; // Array of historical price points
  description?: string;
  category: "stocks" | "crypto" | "commodities" | "indices";
};

export default function MarketPage() {
  // Local UI states
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Asset;
    direction: "asc" | "desc";
  }>({ key: "marketCap", direction: "desc" });

  // Data states for assets loaded from backend
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch asset data dynamically from the backend endpoint.
  useEffect(() => {
    // Note: updated URL to "/api/stocks/" to match your URL config.
    fetch("/api/stocks/")
      .then((response) => response.json())
      .then((data: any[]) => {
        if (data.length < 2) {
          setError("Insufficient data received.");
          setLoading(false);
          return;
        }

        // Assume the CSV data is an array of rows where:
        // - The first key is "Date"
        // - Remaining keys represent asset tickers (e.g., "AAPL", "AMZN", etc.)
        const lastRow = data[data.length - 1];
        const previousRow = data[data.length - 2];

        // Get all asset ticker keys (exclude the "Date" column)
        const assetKeys = Object.keys(lastRow).filter((key) => key !== "Date");

        // Build the assets array dynamically
        const assetsData: Asset[] = assetKeys.map((key) => {
          const currentPrice = parseFloat(lastRow[key]);
          const previousPrice = parseFloat(previousRow[key]);
          const change = currentPrice - previousPrice;
          const changePercent =
            previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
          const sparkline = data
            .map((row) => parseFloat(row[key]))
            .filter((value) => !isNaN(value));

          // Use dynamic defaults:
          // - Use the ticker as the asset name.
          // - Set logo to a placeholder until you add real logos.
          return {
            id: key.toLowerCase(),
            name: key,
            symbol: key,
            logo: "/placeholder.svg",
            price: currentPrice,
            change,
            changePercent,
            marketCap: 0,
            volume: 0,
            sparkline,
            description: "",
            category: "stocks",
          } as Asset;
        });

        setAssets(assetsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching asset data.");
        setLoading(false);
      });
  }, []);

  // Filter assets based on category and search query.
  const filteredAssets = assets.filter((asset) => {
    const matchesCategory =
      activeCategory === "all" || asset.category === activeCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  // Utility to format numbers
  const formatNumber = (num: number, isCurrency = true) => {
    const formatter = new Intl.NumberFormat("fr-FR", {
      style: isCurrency ? "currency" : "decimal",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(num);
  };

  // Format market capitalization
  const formatMarketCap = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)} T€`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} Md€`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} M€`;
    return `${num.toFixed(2)} €`;
  };

  // A mini sparkline chart component using SVG.
  const SparklineChart = ({
    data,
    change,
  }: {
    data: number[];
    change: number;
  }) => {
    if (data.length === 0) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <svg
        className="w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={change >= 0 ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  };

  // Categories for the tabs
  const categories = [
    { id: "all", name: "Tous les actifs" },
    { id: "stocks", name: "Actions" },
    { id: "crypto", name: "Cryptomonnaies" },
    { id: "commodities", name: "Matières premières" },
    { id: "indices", name: "Indices" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Marché</h1>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un actif..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-50">
                <button
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    viewMode === "grid"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-100"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    viewMode === "list"
                      ? "bg-white shadow-sm"
                      : "hover:bg-gray-100"
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          {/* Categories */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  activeCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              // Grid view
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {sortedAssets.map((asset) => (
                  <Card
                    key={asset.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10">
                            <Image
                              src={asset.logo}
                              alt={asset.name}
                              fill
                              className="rounded-full"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {asset.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {asset.symbol}
                            </p>
                          </div>
                        </div>
                        <button className="text-gray-400 hover:text-primary">
                          <Star className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatNumber(asset.price)}
                          </span>
                          <span
                            className={cn(
                              "flex items-center text-sm font-medium",
                              asset.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            )}
                          >
                            {asset.change >= 0 ? (
                              <ArrowUp className="h-4 w-4 mr-1" />
                            ) : (
                              <ArrowDown className="h-4 w-4 mr-1" />
                            )}
                            {asset.changePercent.toFixed(2)}%
                          </span>
                        </div>

                        <div className="mt-4 h-16">
                          <SparklineChart
                            data={asset.sparkline}
                            change={asset.change}
                          />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Cap. boursière</p>
                            <p className="font-medium text-gray-900">
                              {formatMarketCap(asset.marketCap)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Volume (24h)</p>
                            <p className="font-medium text-gray-900">
                              {formatMarketCap(asset.volume)}
                            </p>
                          </div>
                        </div>

                        <Button className="w-full mt-6">Acheter</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </motion.div>
            ) : (
              // List view
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg shadow-sm border"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actif
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            className="flex items-center gap-1"
                            onClick={() =>
                              setSortConfig({
                                key: "price",
                                direction:
                                  sortConfig.key === "price" &&
                                  sortConfig.direction === "desc"
                                    ? "asc"
                                    : "desc",
                              })
                            }
                          >
                            Prix
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            className="flex items-center gap-1"
                            onClick={() =>
                              setSortConfig({
                                key: "changePercent",
                                direction:
                                  sortConfig.key === "changePercent" &&
                                  sortConfig.direction === "desc"
                                    ? "asc"
                                    : "desc",
                              })
                            }
                          >
                            Variation
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <button
                            className="flex items-center gap-1"
                            onClick={() =>
                              setSortConfig({
                                key: "marketCap",
                                direction:
                                  sortConfig.key === "marketCap" &&
                                  sortConfig.direction === "desc"
                                    ? "asc"
                                    : "desc",
                              })
                            }
                          >
                            Cap. boursière
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Volume (24h)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Graphique
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedAssets.map((asset) => (
                        <tr
                          key={asset.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedAsset(asset)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="relative w-8 h-8">
                                <Image
                                  src={asset.logo}
                                  alt={asset.name}
                                  fill
                                  className="rounded-full"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {asset.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {asset.symbol}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {formatNumber(asset.price)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={cn(
                                "flex items-center font-medium",
                                asset.change >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              )}
                            >
                              {asset.change >= 0 ? (
                                <ArrowUp className="h-4 w-4 mr-1" />
                              ) : (
                                <ArrowDown className="h-4 w-4 mr-1" />
                              )}
                              {asset.changePercent.toFixed(2)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatMarketCap(asset.marketCap)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatMarketCap(asset.volume)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-24 h-8">
                              <SparklineChart
                                data={asset.sparkline}
                                change={asset.change}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button size="sm">Acheter</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Asset details modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                      <Image
                        src={selectedAsset.logo}
                        alt={selectedAsset.name}
                        fill
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedAsset.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedAsset.symbol}
                      </p>
                    </div>
                  </div>
                  <button
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setSelectedAsset(null)}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatNumber(selectedAsset.price)}
                        </span>
                        <span
                          className={cn(
                            "flex items-center text-lg font-medium",
                            selectedAsset.change >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {selectedAsset.change >= 0 ? (
                            <ArrowUp className="h-5 w-5 mr-1" />
                          ) : (
                            <ArrowDown className="h-5 w-5 mr-1" />
                          )}
                          {selectedAsset.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Dernière mise à jour il y a 1 minute
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <BarChart2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Capitalisation boursière
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatMarketCap(selectedAsset.marketCap)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Volume (24h)</p>
                          <p className="font-medium text-gray-900">
                            {formatMarketCap(selectedAsset.volume)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Variation (24h)
                          </p>
                          <p
                            className={cn(
                              "font-medium",
                              selectedAsset.change >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            )}
                          >
                            {selectedAsset.change >= 0 ? "+" : ""}
                            {formatNumber(selectedAsset.change)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button size="lg" className="w-full">
                        Acheter {selectedAsset.symbol}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        À propos de {selectedAsset.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedAsset.description}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Performance historique
                      </h3>
                      <div className="h-48">
                        <SparklineChart
                          data={selectedAsset.sparkline}
                          change={selectedAsset.change}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
