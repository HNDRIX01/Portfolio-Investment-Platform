'use client'
import React, { useEffect, useState } from 'react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Adjust the endpoint URL as needed
    fetch('/api/analytics/')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-6">Loading analytics data...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading analytics data: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Analytics</h1>

        {/* Date range + Export button */}
        <div className="flex items-center space-x-4">
          <div className="bg-white p-2 rounded border border-[#8B0000]">
            {/* Replace with your date picker or a dynamic date range */}
            <span className="text-sm text-gray-600">
              Jan 20, 2023 - Feb 9, 2023
            </span>
          </div>
          <button className="bg-gray-800 hover:bg-gray-700 text-sm px-4 py-2 rounded text-white transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Tabs: Overview, Analytics, Reports, etc. */}
      <div className="flex space-x-4 border-b border-gray-300 mb-6">
        <button className="pb-2 border-b-2 border-gray-800 text-gray-800 transition-colors hover:text-gray-600">
          Overview
        </button>
        <button className="pb-2 text-gray-600 transition-colors hover:text-gray-800">
          Analytics
        </button>
        <button className="pb-2 text-gray-600 transition-colors hover:text-gray-800">
          Reports
        </button>
        <button className="pb-2 text-gray-600 transition-colors hover:text-gray-800">
          Notifications
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Total Gain */}
        <div className="bg-white p-4 rounded border-2 border-[#8B0000]">
          <p className="text-sm text-gray-600">Total Gain</p>
          <p className="text-2xl font-bold text-gray-800">
            ${analytics.total_gain.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-green-600 text-sm">+20.1% from last month</p>
        </div>
        {/* Total Portfolios Value */}
        <div className="bg-white p-4 rounded border-2 border-[#8B0000]">
          <p className="text-sm text-gray-600">Total Portfolios Value</p>
          <p className="text-2xl font-bold text-gray-800">
            ${analytics.total_value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-green-600 text-sm">+180.7% from last month</p>
        </div>
        {/* Active Portfolios */}
        <div className="bg-white p-4 rounded border-2 border-[#8B0000]">
          <p className="text-sm text-gray-600">Active Portfolios</p>
          <p className="text-2xl font-bold text-gray-800">
            {analytics.active_portfolios}
          </p>
          <p className="text-green-600 text-sm">+20.1% from last month</p>
        </div>
        {/* Weekly Growth Rate */}
        <div className="bg-white p-4 rounded border-2 border-[#8B0000]">
          <p className="text-sm text-gray-600">Weekly Growth Rate</p>
          <p className="text-2xl font-bold text-gray-800">
            {analytics.weekly_growth.toFixed(2)}%
          </p>
          <p className="text-green-600 text-sm">+0.2% from last month</p>
        </div>
      </div>

      {/* Chart Area (Revenue) */}
      <div className="bg-white p-4 rounded border-2 border-[#8B0020] mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Revenue</h2>
        {/* Insert your chart library component here */}
        <div className="h-40 flex items-center justify-center text-gray-600">
          [Chart Placeholder]
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-4 rounded border-2 border-[#8B0000]">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h2>
        <ul className="space-y-2">
          <li className="flex justify-between text-gray-800">
            <span>Alice Johnson</span>
            <span className="text-green-600">+ $350.00</span>
          </li>
          <li className="flex justify-between text-gray-800">
            <span>Bob Smith</span>
            <span className="text-red-600">- $123.45</span>
          </li>
          {/* Additional transactions can be rendered here */}
        </ul>
      </div>
    </div>
  );
}
