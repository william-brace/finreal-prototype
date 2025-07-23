'use client'

import React, { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Proforma } from "@/lib/session-storage"

interface CashFlowData {
  month: string
  landCost: number
  constructionCost: number
  softCosts: number
  totalCashOut: number
  revenue: number
  netCashFlow: number
  cumulativeCashFlow: number
}

interface CashFlowTabProps {
  proforma: Proforma
}

export function CashFlowTab({ proforma }: CashFlowTabProps) {
  // Generate sample cash flow data based on project length
  const cashFlowData = useMemo(() => {
    const months = proforma.projectLength || 24
    const data: CashFlowData[] = []
    
    for (let month = 1; month <= months; month++) {
      // Sample calculations - replace with actual business logic
      const landCost = month === 1 ? proforma.uses.landCosts.baseCost : 0
      const constructionCost = month > 2 ? (proforma.uses.hardCosts.baseCost / (months - 2)) : 0
      const softCosts = month > 1 ? (proforma.uses.softCosts.development / (months - 1)) : 0
      
      // Sample revenue - typically comes near end of project
      const revenue = month > months * 0.8 ? (proforma.totalRevenue / (months * 0.2)) : 0
      
      const totalCashOut = landCost + constructionCost + softCosts
      const netCashFlow = revenue - totalCashOut
      
      // Calculate cumulative cash flow
      const prevCumulative: number = data.length > 0 ? data[data.length - 1].cumulativeCashFlow : 0
      const cumulativeCashFlow: number = prevCumulative + netCashFlow
      
      data.push({
        month: `Month ${month}`,
        landCost: landCost,
        constructionCost: constructionCost,
        softCosts: softCosts,
        totalCashOut: totalCashOut,
        revenue: revenue,
        netCashFlow: netCashFlow,
        cumulativeCashFlow: cumulativeCashFlow
      })
    }
    
    return data
  }, [proforma])

  const formatCurrency = (value: number) => {
    return value ? `$${value.toLocaleString()}` : '$0'
  }

  const formatNetCashFlow = (value: number) => {
    return `${value >= 0 ? '+' : ''}$${value.toLocaleString()}`
  }

  const getCashFlowStyle = (value: number) => {
    return {
      fontWeight: 'bold' as const,
      color: value >= 0 ? '#16a34a' : '#dc2626'
    }
  }

  const getCumulativeStyle = (value: number) => {
    return {
      fontWeight: 'bold' as const,
      backgroundColor: value >= 0 ? '#f0f9ff' : '#fef2f2',
      color: value >= 0 ? '#1d4ed8' : '#dc2626'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Analysis</CardTitle>
        <CardDescription>Monthly cash flow projections throughout the project timeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: "500px", display: "flex", border: "1px solid #e5e7eb", borderRadius: "6px", overflow: "hidden" }}>
          {/* Fixed left column */}
          <div style={{ 
            backgroundColor: "#f9fafb", 
            borderRight: "2px solid #d1d5db",
            minWidth: "120px"
          }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={{
                    border: "1px solid #d1d5db",
                    padding: "12px 8px",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "left",
                    position: "sticky",
                    top: "0",
                    zIndex: 10
                  }}>
                    Period
                  </th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((row, index) => (
                  <tr key={index}>
                    <td style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      fontWeight: "500"
                    }}>
                      {row.month}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scrollable right columns */}
          <div style={{ 
            flex: 1,
            overflowX: "auto",
            overflowY: "auto"
          }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "800px" }}>
              <thead>
                <tr>
                  <th style={{
                    border: "1px solid #d1d5db",
                    padding: "12px 8px",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "left",
                    position: "sticky",
                    top: "0",
                    zIndex: 10,
                    minWidth: "130px"
                  }}>
                    Land Cost
                  </th>
                  <th style={{
                    border: "1px solid #d1d5db",
                    padding: "12px 8px",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "left",
                    position: "sticky",
                    top: "0",
                    zIndex: 10,
                    minWidth: "130px"
                  }}>
                    Construction
                  </th>
                  <th style={{
                    border: "1px solid #d1d5db",
                    padding: "12px 8px",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "left",
                    position: "sticky",
                    top: "0",
                    zIndex: 10,
                    minWidth: "130px"
                  }}>
                    Soft Costs
                  </th>
                  <th style={{
                    border: "1px solid #d1d5db",
                    padding: "12px 8px",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "left",
                    position: "sticky",
                    top: "0",
                    zIndex: 10,
                    minWidth: "140px"
                  }}>
                    Total Cash Out
                  </th>
                  <th style={{
                    border: "1px solid #d1d5db",
                    padding: "12px 8px",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "left",
                    position: "sticky",
                    top: "0",
                    zIndex: 10,
                    minWidth: "130px"
                  }}>
                    Revenue
                  </th>
                  <th style={{
                    border: "1px solid #d1d5db",
                    padding: "12px 8px",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "left",
                    position: "sticky",
                    top: "0",
                    zIndex: 10,
                    minWidth: "140px"
                  }}>
                    Net Cash Flow
                  </th>
                  <th style={{
                    border: "1px solid #d1d5db",
                    padding: "12px 8px",
                    backgroundColor: "#f3f4f6",
                    fontWeight: "600",
                    fontSize: "14px",
                    textAlign: "left",
                    position: "sticky",
                    top: "0",
                    zIndex: 10,
                    minWidth: "180px"
                  }}>
                    Cumulative Cash Flow
                  </th>
                </tr>
              </thead>
              <tbody>
                {cashFlowData.map((row, index) => (
                  <tr key={index} style={{ 
                    backgroundColor: index % 2 === 0 ? "white" : "#f9fafb"
                  }}>
                    <td style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "13px"
                    }}>
                      {formatCurrency(row.landCost)}
                    </td>
                    <td style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "13px"
                    }}>
                      {formatCurrency(row.constructionCost)}
                    </td>
                    <td style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "13px"
                    }}>
                      {formatCurrency(row.softCosts)}
                    </td>
                    <td style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#dc2626"
                    }}>
                      {formatCurrency(row.totalCashOut)}
                    </td>
                    <td style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      color: row.revenue > 0 ? "#16a34a" : "inherit"
                    }}>
                      {formatCurrency(row.revenue)}
                    </td>
                    <td style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      ...getCashFlowStyle(row.netCashFlow)
                    }}>
                      {formatNetCashFlow(row.netCashFlow)}
                    </td>
                    <td style={{
                      border: "1px solid #d1d5db",
                      padding: "8px",
                      whiteSpace: "nowrap",
                      fontSize: "13px",
                      ...getCumulativeStyle(row.cumulativeCashFlow)
                    }}>
                      {formatNetCashFlow(row.cumulativeCashFlow)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 