# Frontend - Network Topology Visualizer

Main web application for network topology visualization and management.

## Features

- 🌐 Network topology editor with ReactFlow
- 👤 User authentication system
- 📊 Dashboard with project management
- 💾 Export/Import topology configurations
- 🔐 Protected routes and role-based access
- 📱 Responsive design

## Tech Stack

- **React** 18.2+
- **React Router** 6.8+
- **ReactFlow** 11.7+
- **Vite** 4.1+
- **CSS3** for styling

## Project Structure

```
src/
├── components/          # React components
│   ├── Canvas/         # Network visualization
│   └── Layout/         # Layout components
├── pages/              # Page components
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom hooks
├── utils/              # Utility functions
└── styles/             # CSS files
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Available Routes

- `/login` - Login page
- `/` - Dashboard (protected)
- `/editor` - Network editor (protected)
- `/account` - User account (protected)

## Demo Credentials

```
Username: admin
Password: admin123

Username: engineer
Password: engineer123

Username: user
Password: user123
```

## License

MIT
