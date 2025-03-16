"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface StockChartProps {
  data: any[]
  dataKey: string
  color: string
}

export default function StockChart({ data, dataKey, color }: StockChartProps) {
  return (
    <ChartContainer
      config={{
        [dataKey]: {
          label: dataKey,
          color: color,
        },
      }}
      className="h-[200px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="Date"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toFixed(2)}`} />
          <Line type="monotone" dataKey={dataKey} strokeWidth={2} dot={false} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

