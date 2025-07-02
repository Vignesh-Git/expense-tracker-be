import { Router } from 'express';
import { login, logout, signup, validateToken } from '../controllers/authController';
import passport from 'passport';

const router = Router();

/**
 * Authentication routes
 * POST /auth/signup - User registration with email, password, and name
 * POST /auth/login - User login with email and password
 * GET /auth/logout - User logout
 * GET /auth/validate - Validate JWT token and return user info
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password (minimum 6 characters)
 *           example: "password123"
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *     SignupResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "User created successfully"
 *         token:
 *           type: string
 *           description: JWT authentication token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: User's unique identifier
 *               example: "507f1f77bcf86cd799439011"
 *             email:
 *               type: string
 *               example: "user@example.com"
 *             name:
 *               type: string
 *               example: "John Doe"
 *             role:
 *               type: string
 *               enum: [user, admin]
 *               example: "user"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Email, password, and name are required"
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email, password, and name
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           examples:
 *             valid_signup:
 *               summary: Valid signup data
 *               value:
 *                 email: "user@example.com"
 *                 password: "password123"
 *                 name: "John Doe"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignupResponse'
 *       400:
 *         description: Bad request - validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missing_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "Email, password, and name are required"
 *               invalid_email:
 *                 summary: Invalid email format
 *                 value:
 *                   message: "Please provide a valid email address"
 *               weak_password:
 *                 summary: Password too short
 *                 value:
 *                   message: "Password must be at least 6 characters long"
 *       409:
 *         description: Conflict - user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "User with this email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Internal server error"
 */

// User signup route
router.post('/signup', signup);

// User login route
router.post('/login', login);

// User logout route
router.get('/logout', logout);

// Token validation route (requires authentication)
router.get('/validate', passport.authenticate('jwt', { session: false }), validateToken);

export default router; 