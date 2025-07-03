import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { connectDB } from './configs/db';
import { initializePassport } from './configs/passport';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import expenseRoutes from './routes/expenses';
import categoryRoutes from './routes/category';
import notificationRoutes from './routes/notification';
import adminRoutes from './routes/admin';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './configs/swagger';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({ secret: process.env.JWT_SECRET || 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Connect to DB and initialize passport
connectDB();
initializePassport();

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);
app.use('/categories', categoryRoutes);
app.use('/notification', notificationRoutes);
app.use('/admin', adminRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app; 