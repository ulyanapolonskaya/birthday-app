# Family Birthdays App

A minimal, visually pleasing web application to view and manage birthdays of relatives. The app features a dark theme design and is perfect for sharing with family members.

## Features

- **Birthday List View**: Displays all birthdays sorted by upcoming date
- **Today's Birthdays**: Special highlighting for birthdays happening today
- **Add/Edit/Delete**: Full CRUD operations for birthday entries
- **Age Calculation**: Automatically calculates and displays current age
- **Days Until Next Birthday**: Shows countdown to next birthday
- **Dark Theme**: Beautiful dark theme with soft pastel accents
- **Responsive Design**: Works great on desktop and mobile
- **Local Storage**: Changes are saved locally in the browser
- **Export Feature**: Download your birthday data as JSON

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Data Management

- Initial data is loaded from `public/birthdays.json`
- All changes (add/edit/delete) are stored in browser's localStorage
- Use the "Export" button to download your current data as JSON
- To update the base data, modify `public/birthdays.json`

## Deployment

This app is designed to be deployed on GitHub Pages or any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Ensure the `birthdays.json` file is accessible in the public directory

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **date-fns** for date manipulation
- **lucide-react** for icons
- **CSS Custom Properties** for theming

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
