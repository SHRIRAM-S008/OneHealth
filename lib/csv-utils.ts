export function generateSampleCSV(): string {
  const headers = [
    "patient_age",
    "patient_gender",
    "disease_name",
    "symptoms",
    "onset_date",
    "location",
    "latitude",
    "longitude",
    "notes",
  ]

  const sampleData = [
    [
      "35",
      "M",
      "Influenza",
      "fever, cough, sore throat",
      "2024-10-20",
      "Delhi",
      "28.7041",
      "77.1025",
      "Confirmed case",
    ],
    [
      "28",
      "F",
      "Dengue Fever",
      "high fever, headache, body ache",
      "2024-10-21",
      "Mumbai",
      "19.0760",
      "72.8777",
      "Suspected case",
    ],
    ["42", "M", "COVID-19", "fever, cough, fatigue", "2024-10-19", "Bangalore", "12.9716", "77.5946", "Mild symptoms"],
    [
      "55",
      "F",
      "Tuberculosis",
      "persistent cough, chest pain",
      "2024-10-18",
      "Kolkata",
      "22.5726",
      "88.3639",
      "Under investigation",
    ],
    ["31", "M", "Malaria", "fever, chills, sweating", "2024-10-22", "Chennai", "13.0827", "80.2707", "Confirmed case"],
  ]

  const csvContent = [headers.join(","), ...sampleData.map((row) => row.join(","))].join("\n")

  return csvContent
}

export function downloadCSV(filename = "sample-disease-cases.csv"): void {
  const csv = generateSampleCSV()
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
