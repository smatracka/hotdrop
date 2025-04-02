# Drop Commerce Platform

This repository contains two main frontend applications for the Drop Commerce platform:
1. Drop Page - Customer-facing application for browsing and purchasing drops
2. Seller Panel - Administrative panel for managing drops and products

## Project Structure

```
frontend/
├── drop-page/     # Customer-facing application
└── seller-panel/  # Administrative panel
```

## System Overview

The platform implements a unique drop-based e-commerce system where sellers can create scheduled product releases (drops) that are presented to customers in a controlled, queue-based environment.

### Drop System Features
- **Scheduled Drops**: Sellers can schedule drops for specific dates and times
- **Pre-drop Phase**:
  - Product preview
  - Countdown timer
  - Pre-deposit system for buyers
- **Active Drop Phase**:
  - Queue system (100 concurrent users)
  - Real-time inventory management
  - Shopping cart reservation system
- **Post-drop Phase**:
  - Order confirmation
  - Thank you page
  - Next user entry

### Queue Management
- Maximum 100 concurrent users during active drops
- Automatic queue progression:
  1. User enters drop
  2. Places order
  3. Completes purchase
  4. Redirected to thank you page
  5. Next user enters from queue

### Cart Reservation System
- Real-time inventory tracking
- Cart items reserved during checkout
- Automatic release of reserved items if purchase is not completed
- Prevents overselling of limited inventory

## Drop Page Application

The Drop Page is a React-based application that allows customers to browse, view, and purchase limited-edition product drops.

### Features
- Browse upcoming, active, and past drops
- View detailed drop information
- Pre-deposit system for drop participation
- Queue-based purchase system
- Real-time inventory tracking
- Secure checkout process
- User authentication and registration
- Thank you page after successful purchase

### Routes
- `/drops/upcoming` - View upcoming drops
- `/drops/active` - View currently active drops
- `/drops/past` - View past drops
- `/drops/:dropId` - View specific drop landing page
- `/drops/:dropId/active` - Active drop page
- `/drops/:dropId/prepaid` - Prepaid purchase page (protected)
- `/drops/:dropId/checkout` - Checkout page (protected)
- `/drops/:dropId/thank-you` - Thank you page (protected)
- `/auth/login` - Login page
- `/auth/register` - Registration page

### Key Dependencies
- React 18.2.0
- React Router 6.30.0
- Axios for API calls
- Lodash for utility functions
- Jest for testing
- Google Cloud Platform integration
- Google Drive API for asset management

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run deploy` - Build and deploy application
- `npm run sync-resources` - Sync resources from Google Drive
- `npm run optimize-images` - Optimize images
- `npm run analyze` - Analyze bundle size

## Seller Panel Application

The Seller Panel is an administrative interface for managing drops, products, and monitoring sales.

### Features
- Dashboard with sales analytics
- Drop management:
  - Create new drops
  - Schedule drop times
  - Set product quantities
  - Configure drop settings
- Product management:
  - Add/edit products
  - Upload product images to Google Drive
  - Set pricing and inventory
- Sales tracking and reporting
- User management
- Drag-and-drop interface for organizing content
- Real-time drop status monitoring

### Key Dependencies
- React 18.2.0
- Material-UI (MUI) for UI components
- Chart.js for analytics
- React Beautiful DnD for drag-and-drop
- React Hook Form for form handling
- Yup for validation
- React Toastify for notifications
- Date-fns for date manipulation
- Google Cloud Platform integration
- Google Drive API for asset management

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Integration Details

### Google Cloud Platform Integration
- Both applications are deployed on Google Cloud
- Asset management through Google Drive
- Real-time updates using Cloud Pub/Sub
- Queue management using Cloud Functions
- Database operations through Cloud Firestore

### Drop Creation Flow
1. Seller creates drop in Seller Panel
2. System generates drop page in Drop Page application
3. Assets are synced from Google Drive
4. Drop is scheduled and visible in upcoming drops
5. System manages queue and inventory during active phase

### Asset Management
- Product images stored in Google Drive
- Automatic synchronization with both applications
- Image optimization during sync
- CDN integration for fast delivery

## Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm or yarn package manager
- Google Cloud Platform account
- Google Drive API access

### Installation

1. Clone the repository
2. Install dependencies for both applications:

```bash
# Install Drop Page dependencies
cd frontend/drop-page
npm install

# Install Seller Panel dependencies
cd ../seller-panel
npm install
```

3. Configure Google Cloud credentials:
   - Set up service account
   - Configure environment variables
   - Set up Google Drive API access

### Development

To run either application in development mode:

```bash
# For Drop Page
cd frontend/drop-page
npm start

# For Seller Panel
cd frontend/seller-panel
npm start
```

The applications will be available at:
- Drop Page: http://localhost:3000
- Seller Panel: http://localhost:3000

### Building for Production

To create production builds:

```bash
# For Drop Page
cd frontend/drop-page
npm run build

# For Seller Panel
cd frontend/seller-panel
npm run build
```

## Testing

Both applications include Jest and React Testing Library for testing:

```bash
npm test
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is private and proprietary.
