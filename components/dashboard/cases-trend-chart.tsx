"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CasesTrendChartProps {
  data: Array<{ name: string; value: number }>
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"]

export function CasesTrendChart({ data }: CasesTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cases by Status</CardTitle>
        <CardDescription>Distribution of case statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="#8884d8" dataKey="value">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
