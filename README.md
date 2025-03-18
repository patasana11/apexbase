# ApexBase

Enterprise-Grade Backend as a Service (BaaS) Platform

## Overview

ApexBase is a comprehensive Backend-as-a-Service (BaaS) platform that provides all the backend infrastructure needed to build modern applications. It includes authentication, database, storage, serverless functions, and more, all in a unified platform.

## Features

- **Authentication & Authorization**: Secure user authentication and role-based access control
- **Database Management**: Scalable database solutions with real-time capabilities
- **File Storage**: Secure and scalable file storage system
- **Serverless Functions**: Deploy and manage serverless functions
- **API Management**: Create and manage APIs with ease
- **Workflow Designer**: Visual workflow designer for business processes
- **Real-time Updates**: Built-in real-time capabilities
- **Analytics & Monitoring**: Comprehensive analytics and monitoring tools

## Getting Started

### Prerequisites

- Node.js 18+
- npm or Bun (recommended)
- PostgreSQL (optional for local development)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/apexbase.git
   cd apexbase
   ```

2. Install dependencies:
   ```bash
   # Using npm
   npm install

   # Using Bun (recommended)
   bun install
   ```

3. Environment Setup:
   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit the .env file with your configuration
   # For development, most variables can use placeholder values
   ```

4. Run the development server:
   ```bash
   # Using npm
   npm run dev

   # Using Bun (recommended)
   bun run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Development Mode

When running in development mode:

- Authentication is simulated - you can login with any credentials
- The GSB API endpoints use local mocks when possible
- You can access all features without actual backend connections

### Environment Variables

The application requires several environment variables to be set. See `.env.example` for a full list with descriptions. Key variables include:

- `NEXTAUTH_SECRET`: Required for NextAuth.js authentication
- `NEXT_PUBLIC_GSB_API_URL`: API endpoint for the GSB backend
- `NEXT_PUBLIC_DEFAULT_TENANT_CODE`: Default tenant code for GSB
- `DATABASE_URL`: PostgreSQL connection string (optional for development)

## Architecture

ApexBase follows a modern architecture:

- **Frontend**: Next.js with React and TypeScript
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Authentication**: NextAuth.js with JWT strategy
- **Data Layer**: GSB (Global Service Bus) API for all backend interactions

## Documentation

For detailed documentation, visit [docs.apexbase.com](https://docs.apexbase.com)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the [MIT License](LICENSE).
