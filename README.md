OneHealth Grid

(Replace with your actual logo for branding)
A web-based platform for tracking disease cases, predicting outbreaks, and monitoring public health using AI and real-time data. It integrates human and animal health data (One Health approach) to enable early detection and coordinated response efforts.




📖 Overview
OneHealth Grid is designed for clinics, veterinarians, and public health teams to easily log patient symptoms, classify potential diseases with AI, visualize outbreak trends, and receive instant alerts. It supports bulk data imports for efficiency and offers public access for demonstrations, while including robust authentication for production use.
Core Goals:

* Detect outbreaks early through AI predictions and rule-based monitoring.
* Provide secure, role-based access for different users (e.g., admins, clinics, vets).
* Enable scalable data management with real-time updates and export options.

This platform promotes faster decision-making in public health by combining technology with practical workflows.

✨ Features

* Case Management: Log individual cases or bulk upload via CSV files, with search, filtering, and export capabilities.
* AI Disease Prediction: Uses a machine learning model to analyze symptoms and suggest disease categories with confidence scores (e.g., flu, COVID, or veterinary conditions).
* Real-Time Dashboard: Displays live statistics, trend charts, geographic maps, and lists of recent cases for quick overviews.
* Outbreak Detection and Alerts: Automatically identifies clusters of cases (e.g., multiple similar reports in a short time frame) and sends notifications to relevant users.
* Analytics and Reporting: Interactive visualizations for disease distributions, age demographics, case statuses, and custom reports with data exports.
* Bulk Data Uploads: User-friendly interface for dragging and dropping CSV files, including validation checks and progress indicators.
* User Authentication: Simple email/password registration and login, with role assignments for controlled access.
* Public Demo Mode: All dashboard and analytics pages are viewable without logging in, ideal for testing or presentations.


🛠️ Tech Stack
CategoryTechnologiesFrontendNext.js 14 (App Router), React.js, Material-UI (for responsive and accessible UI), Chart.js or Recharts (for visualizations).BackendSupabase (handles PostgreSQL database, user authentication, file storage, and real-time subscriptions).AI/MLMultinomial Naive Bayes classifier with TF-IDF text processing; uses NLTK for symptom data preprocessing.File HandlingPandas library for parsing and validating uploaded CSV files; integrates with Supabase Storage.DeploymentVercel for hosting the frontend; Supabase for managed backend services.CI/CD & ToolsGitHub Actions for automated workflows; Docker for local development environments.MonitoringSupabase Dashboard for performance tracking; optional tools like Sentry for error logging.
This stack ensures the platform is modern, scalable, and easy to maintain.

🚀 Quick Start
Prerequisites
You'll need Node.js (version 18 or higher), a free Supabase account for the backend, and Git for version control.
Setup Steps

1. Clone the Repository: Download the project files from GitHub to your local machine using your preferred Git client.
2. Install Dependencies: Open the project folder in your terminal or command prompt and install the required packages using your package manager (npm or Yarn).
3. Configure Environment: Create a new file named .env.local in the project root. Add your Supabase project URL and anonymous key (found in the Supabase Dashboard under Settings > API). Optionally, include keys for any external AI services if needed.
4. Database Setup: Log into your Supabase Dashboard and use the SQL Editor to create the necessary tables for cases, alerts, and outbreaks. Enable Row Level Security (RLS) policies to control data access based on user roles. Add indexes on key fields like symptoms for better performance.
5. Seed Sample Data (Optional): Once the app is running, use the built-in seed endpoint or Supabase's import tools to populate the database with example cases for testing.
6. Run the Application Locally: Start the development server via your package manager's dev script. The app will be available at http://localhost:3000 in your web browser.
7. AI Model Setup: Predictions are handled through Supabase Edge Functions. For local testing, ensure any ML dependencies are integrated via the API routes.

This process should take about 15-30 minutes to get a working local instance.

📁 Project Structure
The project is organized using Next.js conventions:

* App Directory: Contains all pages and layouts, including the home page for routing, authentication pages (login/signup), and dashboard sections (cases, analytics, uploads, etc.).
* API Routes: Dedicated folder for backend endpoints like case management, AI predictions, and bulk uploads, all integrated with Supabase.
* Components: Reusable UI elements such as dashboards, charts, modals, and forms.
* Lib Folder: Utilities for Supabase client setup, data validation, and helper functions.
* Public Folder: Static assets like icons and images.
* Root files include configuration for Next.js, package dependencies, and this README.

This structure keeps code modular and easy to navigate.

🔧 Usage Examples

* Logging a Case: Visit the Cases page on the dashboard, fill out the form with patient details and symptoms, and submit for AI classification.
* Getting AI Predictions: Enter symptoms in the prediction form; the system analyzes them and returns the top disease matches with confidence levels.
* Bulk Uploading Data: Go to the Upload page, select a CSV file matching the sample format, and monitor the import progress. The app validates data before adding it to the database.
* Monitoring Alerts: On the Outbreaks page, view active alerts that update in real-time as new cases are reported. Mark them as read to clear notifications.
* Generating Reports: Use the Analytics or Reports page to filter data, view charts, and download CSV exports for further analysis.
