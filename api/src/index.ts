import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import companiesRoutes from './modules/job-tracker/routes/companies.routes';
import applicationsRoutes from './modules/job-tracker/routes/applications.routes';
import dashboardRoutes from './modules/job-tracker/routes/dashboard.routes';
import { errorHandler } from './shared/middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Base API v1 routes
app.use('/api/v1/companies', companiesRoutes);
app.use('/api/v1/applications', applicationsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
