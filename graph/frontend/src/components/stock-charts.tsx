"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import StockChart from "@/components/stock-chart"

interface StockData {
  Date: string
  AAPL: number
  AMZN: number
  GOOG: number
  MSFT: number
}

const stocks = [
  { symbol: "AAPL", name: "Apple Inc.", color: "hsl(var(--chart-1))" },
  { symbol: "AMZN", name: "Amazon.com Inc.", color: "hsl(var(--chart-2))" },
  { symbol: "GOOG", name: "Alphabet Inc.", color: "hsl(var(--chart-3))" },
  { symbol: "MSFT", name: "Microsoft Corporation", color: "hsl(var(--chart-4))" },
]

export default function StockCharts() {
  const [data, setData] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get("/api/stocks/")
      .then((response) => {
        setData(response.data)
      })
      .catch((error) => {
        console.error("Error fetching stock data:", error)
        setError("Failed to load stock data")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stocks.map((stock) => (
          <Card key={stock.symbol}>
            <CardHeader>
              <CardTitle>{stock.name}</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {stocks.map((stock) => (
        <Card key={stock.symbol}>
          <CardHeader>
            <CardTitle>{stock.name}</CardTitle>
            <CardDescription>Stock price over time</CardDescription>
          </CardHeader>
          <CardContent>
            <StockChart data={data} dataKey={stock.symbol} color={stock.color} />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

