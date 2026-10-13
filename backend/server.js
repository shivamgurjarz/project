require('dotenv').config();
const express = require('express');
const cors = require('cors');

const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/auth.routes');
const studentRoutes = require('./src/routes/students.routes');
const companyRoutes = require('./src/routes/companies.routes');
const driveRoutes = require('./src/routes/drives.routes');
const placementRoutes = require('./src/routes/placements.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/placements', placementRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Placement system API running on http://localhost:${PORT}`));
