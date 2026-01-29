RoadIntel/
│
├── frontend/              # React Dashboard (Vite)
├── backend/               # Node.js + Express API
├── docs/                  # PRD, architecture docs (optional)
└── README.md




frontend/
│
├── public/
│   └── favicon.svg
│
├── src/
│   │
│   ├── assets/                  # Images, icons, logos
│   │
│   ├── components/              # Reusable UI components
│   │   │
│   │   ├── common/              # Generic components
│   │   │   ├── Button.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── StatCard.jsx
│   │   │
│   │   ├── charts/              # Dashboard charts
│   │   │   ├── AreaChart.jsx
│   │   │   └── SeverityChart.jsx
│   │   │
│   │   └── layout/              # Layout components
│   │       ├── Layout.jsx
│   │       ├── Navbar.jsx
│   │       └── Sidebar.jsx
│   │
│   ├── pages/                   # Route pages
│   │   ├── Dashboard.jsx
│   │   ├── MapView.jsx
│   │   ├── Upload.jsx
│   │   └── Reports.jsx
│   │
│   ├── routes/                  # Routing config
│   │   └── AppRoutes.jsx
│   │
│   ├── services/                # API communication
│   │   ├── api.js
│   │   └── pothole.service.js
│   │
│   ├── utils/                   # Helper utilities
│   │   ├── constants.js
│   │   └── formatters.js
│   │
│   ├── App.jsx                  # Root app component
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Tailwind styles
│   └── App.css                  # Optional extra styles
│
├── .env                         # Environment variables
├── package.json
├── vite.config.js
└── README.md



backend/
│
├── src/
│   ├── config/              # App & DB configs
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.js
│   │   ├── pothole.controller.js
│   │   └── upload.controller.js
│   │
│   ├── routes/              # API routes
│   │   ├── auth.routes.js
│   │   ├── pothole.routes.js
│   │   └── upload.routes.js
│   │
│   ├── models/              # Database models
│   │   ├── User.js
│   │   └── Pothole.js
│   │
│   ├── services/            # Business logic
│   │   ├── ml.service.js
│   │   └── report.service.js
│   │
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── utils/               # Helper functions
│   │   └── logger.js
│   │
│   ├── app.js               # Express app
│   └── server.js            # Entry point
│
├── uploads/                 # Image/video uploads
├── .env
├── package.json
└── nodemon.json
