
# 💼 Job Portal - Full Stack Application
<img width="1222" height="633" alt="1" src="https://github.com/user-attachments/assets/0ccb8907-7e11-4137-b7b9-a9c5385c2d1d" />
<img width="711" height="644" alt="2" src="https://github.com/user-attachments/assets/f02290cd-e1be-44db-8b99-b7de777150d0" />
<img width="1172" height="630" alt="3" src="https://github.com/user-attachments/assets/9c873b6c-6c39-47b9-a317-d621cdfa2e62" />
<img width="1204" height="631" alt="4" src="https://github.com/user-attachments/assets/02481438-5ee5-49fd-b4eb-4b1b08d40ad9" />
<img width="1207" height="649" alt="5" src="https://github.com/user-attachments/assets/ee4725d4-d903-4b03-aa85-7af149339ff2" />
<img width="992" height="692" alt="7" src="https://github.com/user-attachments/assets/2cb390be-7278-4de6-8423-643ddea33cf4" />
<img width="1173" height="641" alt="6" src="https://github.com/user-attachments/assets/e37c9445-565f-45e8-9047-2bb0d6f08d4a" />
<img width="1029" height="653" alt="8" src="https://github.com/user-attachments/assets/b35e3923-bd06-45d6-aff1-a91cabe5b4fb" />

A modern, full-featured job portal built with **Next.js 14** and **MongoDB Atlas**. Connect employers with talented job seekers seamlessly!

![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 👔 For Employers
- ✅ Secure registration and authentication
- ✅ Post job listings with detailed information
- ✅ Manage all posted jobs from dashboard
- ✅ View and manage job applications
- ✅ Update application status (Pending/Reviewed/Accepted/Rejected)
- ✅ Download applicant resumes
- ✅ Delete job postings

### 🎯 For Job Seekers
- ✅ User registration and authentication
- ✅ Browse all available job openings
- ✅ Apply to jobs with custom cover letters
- ✅ **Resume Builder** - Create professional resume from scratch
- ✅ **PDF Download** - Download resume as PDF
- ✅ Upload and manage resume files
- ✅ Track all applications and their status
- ✅ Dashboard with application statistics

### 🔐 Security Features
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected API routes
- ✅ Role-based access control
- ✅ Secure cookie management

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- JavaScript

**Backend:**
- Next.js API Routes
- MongoDB Atlas
- Mongoose ODM

**Authentication:**
- JWT (JSON Web Tokens)
- bcryptjs

**File Storage:**
- Base64 encoding in MongoDB (no cloud storage needed)
- jsPDF for PDF generation

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Git installed

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/YOUR-USERNAME/job-portal.git
cd job-portal
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env.local` file**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

## 🗄️ Database Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Copy the connection string to `.env.local`

## 📁 Project Structure

```
job-portal/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── jobs/         # Job CRUD operations
│   │   ├── applications/ # Application management
│   │   └── resume/       # Resume upload/download
│   ├── employer/         # Employer pages
│   ├── seeker/          # Job seeker pages
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   └── layout.js        # Root layout
├── models/              # MongoDB models
│   ├── User.js
│   ├── Job.js
│   ├── Application.js
│   └── Resume.js
├── lib/                 # Utility functions
│   ├── db.js           # Database connection
│   └── auth.js         # JWT utilities
└── middleware.js       # Route protection

```

## 🚀 Features in Detail

### Resume Builder
- Create professional resumes from scratch
- Add multiple work experiences and education entries
- Real-time preview
- Download as beautifully formatted PDF
- Auto-fill from user profile

### Dashboard
- Application statistics
- Latest job openings
- Application tracking
- Status updates

### Job Management
- Post jobs with rich details
- View applicant profiles
- Download resumes
- Update application status
- Delete listings

## 🔑 Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret (use a strong random string)
JWT_SECRET=your-secret-key-minimum-32-characters

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

⚠️ ** You can even use my .env. It is just a mongodb atlas string and all data is saving in it.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@tayyab38201](https://github.com/tayyab38201)
- LinkedIn: https://www.linkedin.com/in/muhammad-tayyab-a20618236/

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the database platform
- Tailwind CSS for the styling framework
- jsPDF for PDF generation

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

⭐ Star this repo if you find it helpful!

Made with ❤️ using Next.js and MongoDB
