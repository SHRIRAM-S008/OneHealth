🏥 OneHealth Grid - Minimal README (Technical Overview)

📌 Overview
A disease surveillance platform connecting human and animal health data using Supabase (PostgreSQL + Auth), React, and AI for early outbreak detection.

🧠 Key Features

* AI Categorization: Multinomial Naive Bayes (TF-IDF) for disease prediction
* Real-Time Sync: Supabase Realtime for live updates
* Data Upload: CSV/Excel support (human/animal cases)
* Role-Based Access: Hospital, Vet, Health Officer roles
* Outbreak Alerts: Auto-detect clusters (e.g., 5+ cases in 7 days)
* Geospatial View: Map with case markers
* Secure: JWT Auth, HTTPS, GDPR-compliant data handling


🛠️ Tech Stack

* Frontend: React.js + TypeScript + Material-UI
* Backend: Supabase (PostgreSQL, Auth, Storage)
* AI: Python (scikit-learn) for disease prediction
* Deployment: Supabase (auto-scaling, managed DB)
* Tools: Docker, GitHub Actions (CI/CD), React-Leaflet (maps)


🧰 Setup
bashDownloadCopy code# Install dependencies
npm install

# Start Supabase (local or cloud)
# Configure .env with Supabase URL + Key

# Run app
npm run dev

📁 Data Flow

1. Users upload CSV files (human/animal cases)
2. Supabase stores data + files
3. AI processes symptoms → assigns disease category
4. Real-time updates notify health officers
5. Map + dashboard visualize trends + alerts


📌 Notes

* AI model trained on 10K+ cases (85% F1-score)
* No manual data entry – all auto-validated
* Scalable for 1M+ cases (Supabase handles DB + storage)
* Security: Auth, HTTPS, and access controls for sensitive data


"OneHealth Grid connects human and animal health data for faster outbreak detection, using Supabase for backend and AI for smart analysis." 🌐🧠
