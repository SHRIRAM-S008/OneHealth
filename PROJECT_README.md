# OneHealth Grid - Disease Surveillance Platform

OneHealth Grid is a comprehensive disease surveillance platform designed for public health officials, veterinarians, and healthcare providers to track, analyze, and respond to disease outbreaks across human, animal, and environmental health sectors.

## Features

### Dashboard
- Real-time disease case tracking
- Interactive geographic map with clustering
- Outbreak detection and alerts
- Statistical summaries and trend analysis
- Recent cases overview

### Case Management
- Report new disease cases
- Track case status (reported, confirmed, resolved)
- View detailed case information
- Filter and search cases by various criteria

### Outbreak Detection
- Automated outbreak detection algorithms
- Severity assessment (low, medium, high, critical)
- Alert system for new outbreaks and case increases
- Outbreak status tracking (active, contained, resolved)

### Data Analytics
- Disease distribution charts
- Case trend analysis
- Geographic visualization
- Export capabilities

### Geographic Visualization
- **Interactive Markers**: Clickable pins showing detailed case information
- **Cluster Visualization**: Automatic grouping of cases in dense areas
- **Region Filtering**: Draw areas on map to filter cases
- Heatmap layer (coming soon)
- District boundaries overlay (coming soon)

### Reporting
- Generate comprehensive disease surveillance reports
- Export data in multiple formats
- Historical trend analysis

### User Management
- Role-based access control
- Organization-specific data isolation
- Secure authentication

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Shadcn UI
- **Mapping**: Leaflet, React Leaflet, Leaflet Marker Cluster
- **Backend**: Supabase (Database, Authentication, Real-time)
- **Deployment**: Vercel

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd onehealth-grid
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in the [scripts/](file:///Users/shriram/Downloads/onehealth-grid/scripts/) directory in order:
   - [01-init-schema.sql](file:///Users/shriram/Downloads/onehealth-grid/scripts/01-init-schema.sql)
   - [02-add-user-roles.sql](file:///Users/shriram/Downloads/onehealth-grid/scripts/02-add-user-roles.sql)
   - [03-seed-dummy-data.sql](file:///Users/shriram/Downloads/onehealth-grid/scripts/03-seed-dummy-data.sql)
3. Configure authentication settings in Supabase dashboard

## Deployment

The project is configured for deployment on Vercel. Connect your GitHub repository to Vercel and configure the environment variables.

## Map Features

The geographic visualization includes several advanced features:

### Interactive Markers
- Click any marker to view detailed case information
- Popups display disease name, location, status, and patient details

### Cluster Visualization
- Cases in close proximity are automatically grouped
- Clusters show the number of cases they contain
- Zoom in to expand clusters into individual markers

### Region Filtering
- Click "Draw Area" to activate region selection
- Draw a rectangle on the map to filter cases
- View filtered results in a dedicated panel
- Use "Clear" to reset the filter

### Future Enhancements
- Heatmap layer for disease density visualization
- Administrative boundary overlays
- Advanced filtering options

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](file:///Users/shriram/Downloads/onehealth-grid/LICENSE) file for details.

## Support

For support, please open an issue on the GitHub repository or contact the development team.