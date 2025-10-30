import { Card, CardContent } from "@/components/ui/card"

interface StatisticsSummaryProps {
  totalCases: number
  confirmedCases: number
  reportedCases: number
  resolvedCases: number
}

export function StatisticsSummary({
  totalCases,
  confirmedCases,
  reportedCases,
  resolvedCases,
}: StatisticsSummaryProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold">{totalCases}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Total Cases</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-red-600">{confirmedCases}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Confirmed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-yellow-600">{reportedCases}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Reported</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-green-600">{resolvedCases}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Resolved</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
