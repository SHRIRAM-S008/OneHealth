"use client"

interface Case {
  id: string
  disease_name: string
  disease_category: string
  patient_age: number
  patient_gender: string
  status: string
  onset_date: string
  report_date: string
  location: string
}

interface CasesTableProps {
  cases: Case[]
  onSelectCase: (case_: Case) => void
}

export function CasesTable({ cases, onSelectCase }: CasesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-red-100 text-red-800"
      case "reported":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {cases.map((case_) => (
          <div key={case_.id} className="border border-border rounded-lg p-3 bg-card hover:bg-muted/50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-semibold text-sm">{case_.disease_name}</p>
                <p className="text-xs text-muted-foreground">{case_.location || "Unknown location"}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(case_.status)}`}>{case_.status}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{case_.disease_category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Age</p>
                <p className="font-medium">{case_.patient_age || "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Onset Date</p>
                <p className="font-medium">{case_.onset_date}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gender</p>
                <p className="font-medium">{case_.patient_gender || "-"}</p>
              </div>
            </div>

            <button
              onClick={() => onSelectCase(case_)}
              className="w-full text-primary hover:underline text-xs font-medium py-2 border-t border-border"
            >
              View Details
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium">Disease</th>
              <th className="text-left py-3 px-4 font-medium">Category</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Age</th>
              <th className="text-left py-3 px-4 font-medium">Onset Date</th>
              <th className="text-left py-3 px-4 font-medium">Location</th>
              <th className="text-left py-3 px-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((case_) => (
              <tr key={case_.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">{case_.disease_name}</td>
                <td className="py-3 px-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {case_.disease_category}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(case_.status)}`}>
                    {case_.status}
                  </span>
                </td>
                <td className="py-3 px-4">{case_.patient_age || "-"}</td>
                <td className="py-3 px-4">{case_.onset_date}</td>
                <td className="py-3 px-4">{case_.location || "-"}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onSelectCase(case_)}
                    className="text-primary hover:underline text-xs font-medium"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
