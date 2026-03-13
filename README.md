# WFC – Wolverine Fitness Club Management System

A comprehensive, modern, production-ready Gym Management Web Application built with React (Frontend) and Node.js/Express (Backend) with MongoDB database.

## 🏋️ Overview

WFC Management System is a complete solution for managing gym operations including member registration, payment tracking, fitness measurements, diet plans, personal training, attendance, and invoice generation with advanced features like BMI calculation, progress photo tracking, and comprehensive reporting.

## 🌟 Key Features

### 1. **Authentication System**
- JWT-based secure login
- Email & phone-based authentication
- Forgot password functionality
- Role-based access control (Admin, Staff, Trainer, Member)
- User registration and profile management

### 2. **Member Management**
- Multi-step registration form with validation
- Body measurements tracking (Height, Weight, BMI, Waist-Hip Ratio)
- Automatic fitness category calculation
- Progress photo storage (Front, Side, Back views)
- Member status tracking (Active, Inactive, Expired, Suspended)

### 3. **Membership Plans**
- Pre-configured plans: Guest (1 day), Basic (1 month), Standard (3 months), Premium (6 months)
- Flexible pricing and features configuration
- Plan duration management

### 4. **Payment Management**
- Multiple payment modes (Cash, Card, UPI, Online)
- Automated invoice generation
- Revenue tracking and analytics
- Payment status monitoring
- Monthly revenue reports

### 5. **Invoice System**
- Professional invoice generation
- PDF download capability
- Print-ready format
- WhatsApp sharing option
- Transaction tracking

### 6. **Diet Plans**
- Customized meal planning (Breakfast, Lunch, Dinner, Snacks)
- Macro tracking (Protein, Carbs, Fats, Fiber)
- Calorie target management
- Weight goal tracking
- Trainer assignment for diet plans

### 7. **Personal Training**
- Trainer management and assignment
- Session tracking and completion
- Trainer specializations and ratings
- Session-by-session progress tracking

### 8. **Attendance System**
- Daily check-in/check-out
- Multiple check-in methods (QR, Phone, Staff)
- Session duration tracking
- Monthly and daily attendance reports
- Attendance analytics

### 9. **Reporting & Analytics**
- Revenue summary and trends
- Member status reports
- Payment method breakdown
- Monthly analytics
- Export capabilities

### 10. **Additional Features**
- Responsive mobile-friendly design
- Dark theme support
- Real-time notifications
- Comprehensive error handling
- Scalable architecture

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **jsPDF & html2canvas** - PDF generation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload

## 📁 Project Structure

```
wfc-software/
├── wfc-software-backend-main/
│   ├── models/
│   │   ├── User.js
│   │   ├── Member.js
│   │   ├── Payment.js
│   │   ├── Plan.js
│   │   ├── DietPlan.js
│   │   ├── Trainer.js
│   │   ├── PersonalTraining.js
│   │   ├── Attendance.js
│   │   ├── Invoice.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── memberController.js
│   │   ├── paymentController.js
│   │   ├── dietPlanController.js
│   │   ├── trainerController.js
│   │   ├── attendanceController.js
│   │   ├── invoiceController.js
│   │   └── planController.js
│   ├── routers/
│   │   └── apiRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── multer.js
│   ├── utils/
│   │   └── helpers.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── wfc-software-frontend-main/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Members.jsx
    │   │   ├── Payments.jsx
    │   │   ├── Attendance.jsx
    │   │   ├── DietPlans.jsx
    │   │   ├── Training.jsx
    │   │   ├── Reports.jsx
    │   │   └── About.jsx
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    └── vite.config.js
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
```bash
cd wfc-software-backend-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```bash
cp .env.example .env
```

4. **Configure `.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wfc-gym
JWT_SECRET=your-secret-key-change-this
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
```

5. **Start MongoDB**
```bash
mongod
```

6. **Run backend**
```bash
npm start
```

Backend runs on: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd wfc-software-frontend-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password` - Reset password
- `GET /api/v1/auth/me` - Get current user (Protected)

### Member Endpoints
- `POST /api/v1/members` - Create member
- `GET /api/v1/members` - Get all members
- `GET /api/v1/members/:id` - Get member details
- `PUT /api/v1/members/:id` - Update member
- `DELETE /api/v1/members/:id` - Delete member
- `GET /api/v1/members/stats` - Get statistics

### Payment Endpoints
- `POST /api/v1/payments` - Create payment
- `GET /api/v1/payments` - Get all payments
- `GET /api/v1/payments/revenue/summary` - Revenue summary

### Other Endpoints
- `/api/v1/plans` - Plan management
- `/api/v1/diet-plans` - Diet plan management
- `/api/v1/trainers` - Trainer management
- `/api/v1/attendance` - Attendance tracking
- `/api/v1/invoices` - Invoice management

## 🔐 Database Schemas

### User Schema
```javascript
{
  name: String,
  email: String (Unique),
  phone: String (Unique),
  password: String (Hashed),
  role: 'member' | 'trainer' | 'staff' | 'admin',
  isActive: Boolean,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  timestamps: true
}
```

### Member Schema
```javascript
{
  userId: ObjectId,
  dateOfBirth: Date,
  gender: 'Male' | 'Female' | 'Other',
  height: Number,
  weight: Number,
  bmi: Number,
  waistHipRatio: Number,
  fitnessCategory: 'Underweight' | 'Normal' | 'Overweight' | 'Obese',
  progressPhotos: [{ type, url, uploadedAt }],
  currentPlan: ObjectId,
  joinDate: Date,
  expiryDate: Date,
  status: 'active' | 'inactive' | 'expired' | 'suspended',
  totalPaid: Number,
  pendingAmount: Number,
  timestamps: true
}
```

## 📱 UI Features

### Dashboard
- Statistics cards showing key metrics
- Quick action buttons
- System status overview
- Real-time data updates

### Member List
- Sortable and filterable table
- Status indicators (Active, Expiring, Overdue)
- Bulk actions
- Search functionality

### Payments
- Revenue dashboard
- Payment history
- Invoice generation
- Export options

### Attendance
- Daily attendance filters
- Check-in/check-out tracking
- Duration calculation
- Monthly reports

## 🎨 Design Highlights

- **Modern UI** - Clean, professional design with Tailwind CSS
- **Responsive Layout** - Mobile-first approach
- **Intuitive Navigation** - Easy-to-use navbar and menus
- **Visual Hierarchy** - Clear distinction between sections
- **Color Coding** - Status indicators with distinct colors
- **Accessibility** - WCAG compliant

## 🔑 Default Credentials

For testing purposes:
- Email: `admin@wfc.com`
- Password: `admin123` (Create this account during first run)

## 🐛 Error Handling

- Comprehensive try-catch blocks
- User-friendly error messages
- Input validation
- JWT token expiration handling
- Database connection error management

## 📈 Scalability Features

- Modular component architecture
- Separate controllers for each feature
- Database indexing for performance
- Pagination support ready
- Caching-friendly design

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- SQL injection prevention (MongoDB)
- CORS configuration

## 📝 Usage Examples

### Login
```javascript
POST /api/v1/auth/login
{
  "email": "member@wfc.com",
  "password": "password123"
}
```

### Create Member
```javascript
POST /api/v1/members
{
  "userId": "...",
  "height": 175,
  "weight": 75,
  "gender": "Male",
  ...
}
```

### Process Payment
```javascript
POST /api/v1/payments
{
  "memberId": "...",
  "planId": "...",
  "amount": 1000,
  "paymentMode": "cash"
}
```

## 🎯 Future Enhancements

- WhatsApp integration for notifications
- AI-powered workout recommendations
- Real-time SMS alerts
- Mobile app (React Native/Flutter)
- Body transformation timeline
- Supplement tracker
- Video workout library
- Live class features
- Advanced analytics dashboard

## 📞 Support & Documentation

For API documentation, visit the `/api/v1/health` endpoint to verify server status.

## 📄 License

This project is designed for WFC – Wolverine Fitness Club.

## 👨‍💻 Developer Notes

- Ensure MongoDB is running before starting the backend
- Update environment variables before deployment
- Configure Cloudinary for image uploads
- Set up email service for password reset
- Configure JWT secret for production

## 🚨 Important Notes

1. **Change JWT_SECRET in production** - Do not use default
2. **Configure CORS** - Set specific origins in production
3. **Database backup** - Set up regular MongoDB backups
4. **Error logging** - Implement proper logging system
5. **Rate limiting** - Add rate limiting for APIs

---

**Built with ❤️ for WFC – Wolverine Fitness Club**
