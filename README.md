# ExpenseSync Backend API

---

**Frontend Live App:** [https://main.do3xsaggo4ysf.amplifyapp.com/](https://main.do3xsaggo4ysf.amplifyapp.com/)

**Swagger API Docs:** [https://ckhpkdpdca.ap-south-1.awsapprunner.com/api-docs/](https://ckhpkdpdca.ap-south-1.awsapprunner.com/api-docs/)

---

A robust Node.js/Express.js backend API for the ExpenseSync expense tracking application. Built with TypeScript, MongoDB, and JWT authentication.

---

## 🚩 Mandatory Features

- **User Authentication & Roles**: JWT-based login, registration, and role-based access (user/admin)
- **Expense Management**: Add, edit, delete, and list expenses with categories, payment methods, and recurring options
- **Category Management**: Custom categories for expenses
- **Budget Tracking**: Set and monitor budgets per category
- **Admin Panel**:
  - View and filter all users' expenses
  - Approve/deny expense requests
  - View all users and manage them
- **Notifications**: Real-time notifications for approvals/denials
- **File Uploads**: Attach receipts to expenses
- **API Documentation**: Swagger UI at `/api-docs`

---

## 👤 Default Admin Credentials

- **Email**: `admin@gmail.com`
- **Password**: `admin`
- **Role**: `admin`

> The admin user is auto-created on first server start or by running `npm run seed:admin`.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport.js
- **File Upload**: Multer with GridFS
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: bcryptjs, CORS, express-session

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker-be
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/expensesync
MONGODB_URI_PROD=your_production_mongodb_uri

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your_session_secret_here

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 4. Database Setup

Ensure MongoDB is running on your system:

```bash
# Start MongoDB (if not running as a service)
mongod
```

### 5. Admin User Setup

The application automatically creates an admin user when the server starts for the first time. You can also manually create the admin user using the seed script:

```bash
# Run the admin seed script
npm run seed:admin
```

**Default Admin Credentials:**
- **Email**: `admin@gmail.com`
- **Password**: `admin`
- **Role**: `admin`

> **Note**: The password is securely hashed using bcrypt with 12 salt rounds. The admin user is created automatically on first server startup, or you can run the seed script manually.

### 6. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Swagger UI
Access the interactive API documentation at: [https://ckhpkdpdca.ap-south-1.awsapprunner.com/api-docs/](https://ckhpkdpdca.ap-south-1.awsapprunner.com/api-docs/)

### API Endpoints

#### Authentication Routes (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

#### User Routes (`/users`)
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user (Admin only)

#### Expense Routes (`/expenses`)
- `GET /expenses` - Get all expenses (with filters)
- `POST /expenses` - Create new expense
- `GET /expenses/:id` - Get expense by ID
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `POST /expenses/:id/approve` - Approve expense (Admin only)
- `POST /expenses/:id/reject` - Reject expense (Admin only)

#### Category Routes (`/categories`)
- `GET /categories` - Get all categories
- `POST /categories` - Create new category
- `GET /categories/:id` - Get category by ID
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

#### Notification Routes (`/notification`)
- `GET /notification` - Get user notifications
- `POST /notification` - Create notification
- `PUT /notification/:id` - Update notification
- `DELETE /notification/:id` - Delete notification

#### Admin Routes (`/admin`)
- `GET /admin/dashboard` - Admin dashboard stats
- `GET /admin/users` - Get all users with details
- `GET /admin/expenses` - Get all expenses with filters
- `POST /admin/expenses/:id/approve` - Approve expense
- `POST /admin/expenses/:id/reject` - Reject expense

## 🏗️ Project Structure

```
src/
├── configs/           # Configuration files
│   ├── db.ts         # Database connection
│   ├── passport.ts   # Passport authentication setup
│   └── swagger.ts    # Swagger API documentation
├── controllers/      # Route controllers
│   ├── authController.ts
│   ├── userController.ts
│   ├── expenseController.ts
│   ├── categoryController.ts
│   ├── notificationController.ts
│   └── adminController.ts
├── models/          # MongoDB schemas
│   ├── User.ts
│   ├── Expense.ts
│   ├── Category.ts
│   ├── Budget.ts
│   ├── Notification.ts
│   └── index.ts
├── routes/          # API routes
│   ├── auth.ts
│   ├── user.ts
│   ├── expenses.ts
│   ├── category.ts
│   ├── notification.ts
│   └── admin.ts
├── types/           # TypeScript type definitions
│   └── express/
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Registration**: Users can register with email and password
2. **Login**: Returns JWT token for authenticated requests
3. **Authorization**: Include token in `Authorization: Bearer <token>` header
4. **Session Management**: Express sessions for additional security

### Example Authentication Flow

```bash
# Register
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Use token for authenticated requests
curl -X GET http://localhost:5000/expenses \
  -H "Authorization: Bearer <your_jwt_token>"
```

## 📊 Data Models

### User
- Basic user information (name, email, password)
- Role-based access (user/admin)
- Profile management
- **Default Admin User**: Created automatically with email `admin@gmail.com` and password `admin`

### Expense
- Amount, description, date
- Category association
- Receipt attachments
- Approval status
- User ownership

### Category
- Name and description
- Color coding
- Budget limits

### Budget
- Monthly/yearly budgets
- Category-wise limits
- Spending tracking

### Notification
- User notifications
- Approval requests
- System messages

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm test         # Run tests (not implemented yet)
npm run seed:admin # Create admin user manually
```

### Code Style

- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent naming conventions
- Proper error handling

### Database Migrations

Currently using Mongoose schemas with automatic migrations. For production, consider implementing proper migration scripts.

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI_PROD=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
SESSION_SECRET=your_secure_session_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication tokens
- **CORS Protection**: Configurable cross-origin requests
- **Input Validation**: Request data validation
- **Rate Limiting**: Protection against abuse (can be added)
- **Helmet**: Security headers (can be added)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/api-docs`
- Review the codebase structure
- Create an issue for bugs or feature requests

## 🔄 API Versioning

Current API version: v1.0.0
- Base URL: `http://localhost:5000`
- All endpoints are prefixed with their respective routes
- Swagger documentation includes all available endpoints

---

**Note**: This is the backend API for the ExpenseSync application. Make sure to also set up the frontend application for a complete expense tracking solution.