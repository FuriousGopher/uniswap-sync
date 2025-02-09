# Uniswap V3 Data Sync Service

## Description

This project is a NestJS backend application that periodically
fetches data from the Uniswap V3 subgraph and stores it in a
PostgreSQL database. The service ensures accurate pricing calculations
by syncing Uniswap V3 pool and tick data every 30 minutes.

## Features

- Fetch Uniswap V3 pool and tick data from the subgraph using GraphQL.
- Store and update the data in a PostgreSQL database.
- Periodic synchronization every 30 minutes using NestJS cron jobs.
- Supports scalability and easy extension. 
- Includes unit tests using Jest to ensure correctness.

## Technologies Used

- **NestJS** - Backend framework
- **TypeScript** - Strongly typed JavaScript
- **PostgreSQL** - Database for storing Uniswap V3 data
- **TypeORM** - ORM for database interaction
- **Axios** - HTTP client for fetching data from Uniswap's API
- **GraphQL** - Fetching Uniswap V3 data
- **Jest** - Unit testing framework

## Installation

### Prerequisites

- **Docker & Docker Compose** (for running PostgreSQL)
- **Node.js** (>= 18)
- **Yarn** or **npm** (for package management)

### Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/FuriousGopher/uniswap-sync.git
   cd uniswap-sync
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Update the `.env` file with the required values,
including the **Uniswap API key**.


4. Start PostgreSQL using Docker Compose:

   ```sh
   docker-compose up -d
   ```
5. Start the application:

   ```sh
   yarn start:dev
   ```

   or

   ```sh
   npm run start:dev
   ```

## Usage

- The service automatically fetches data from Uniswap and syncs it with the database every **30 minutes**.

## Testing

- This project includes unit tests to verify the correctness of the Uniswap synchronization service.

   ```sh
   npm run test
   ```
  

