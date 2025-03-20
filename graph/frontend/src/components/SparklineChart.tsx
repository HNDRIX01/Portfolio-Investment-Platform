"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface SparklineChartProps {
  data: number[];
  change: number;
}

export default function SparklineChart({ data, change }: SparklineChartProps) {
  // Transform your `data` array into something ApexCharts can consume:
  const chartData = useMemo(
    () => data.map((price, index) => ({ x: index, y: price })),
    [data]
  );

  // **Strongly type** the chartOptions object:
  const chartOptions: ApexOptions = useMemo(() => {
    return {
      chart: {
        sparkline: { enabled: true },
        toolbar: { show: false },
        animations: { enabled: false },
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      colors: [change >= 0 ? "#22c55e" : "#ef4444"],
      tooltip: { enabled: false },
      xaxis: {
        type: "numeric",
        labels: { show: false },
      },
      yaxis: {
        labels: { show: false },
      },
    };
  }, [change]);

  // The `series` array must match ApexCharts’ expected shape
  const series = useMemo(
    () => [
      {
        name: "Price",
        data: chartData,
      },
    ],
    [chartData]
  );

  return (
    <div className="w-full h-full">
      {/* Pass the typed options and the series into ApexCharts */}
      <ApexChart
        options={chartOptions}
        series={series}
        type="line"
        width="100%"
        height="100%"
      />
    </div>
  );
}
