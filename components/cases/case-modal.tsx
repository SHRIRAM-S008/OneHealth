"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
  symptoms: string[]
  notes: string
}

interface CaseModalProps {
  case: Case
  onClose: () => void
  onUpdateStatus: (caseId: string, newStatus: string) => void
}

export function CaseModal({ case: caseData, onClose, onUpdateStatus }: CaseModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{caseData.disease_name}</CardTitle>
              <CardDescription>Case ID: {caseData.id}</CardDescription>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Information */}
          <div>
            <h3 className="font-semibold mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{caseData.patient_age || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{caseData.patient_gender || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Disease Information */}
          <div>
            <h3 className="font-semibold mb-3">Disease Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{caseData.disease_category}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{caseData.status}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <h3 className="font-semibold mb-3">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Onset Date</p>
                <p className="font-medium">{caseData.onset_date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Report Date</p>
                <p className="font-medium">{caseData.report_date}</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="font-medium">{caseData.location || "Not specified"}</p>
          </div>

          {/* Symptoms */}
          {caseData.symptoms && caseData.symptoms.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {caseData.symptoms.map((symptom, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-full bg-muted">
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {caseData.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-sm text-muted-foreground">{caseData.notes}</p>
            </div>
          )}

          {/* Status Update */}
          <div>
            <h3 className="font-semibold mb-3">Update Status</h3>
            <div className="flex gap-2">
              {["reported", "confirmed", "resolved"].map((status) => (
                <Button
                  key={status}
                  variant={caseData.status === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdateStatus(caseData.id, status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
