"use client"

import { Input } from "@/components/ui/input"

interface CaseFiltersProps {
  filters: {
    status: string
    category: string
    dateFrom: string
    dateTo: string
  }
  setFilters: (filters: any) => void
  categories: string[]
}

export function CaseFilters({ filters, setFilters, categories }: CaseFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="reported">Reported</option>
          <option value="confirmed">Confirmed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">From Date</label>
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">To Date</label>
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="text-sm"
        />
      </div>
    </div>
  )
}
