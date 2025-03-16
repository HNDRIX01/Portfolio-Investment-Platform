import StockCharts from "@/components/stock-charts"

export default function StockChartsPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Stock Performance Dashboard</h1>
      <StockCharts />
    </div>
  )
}

