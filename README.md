# College Management System



A Django and React college portal for students and teachers. It uses SQLite for local development.

## Requirements

* Python 3.12+
* Node.js 18+ and npm

Check your installation:

```powershell
python --version
node --version
npm --version
```

## Installation

Run these commands from the folder containing `manage.py`:

```powershell
# Create and activate the Python environment
python -m venv .venv
.venv\Scripts\Activate.ps1

# Install Django
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Install React dependencies
cd frontend
npm install
cd ..

# Create/update SQLite tables
python manage.py migrate
```

If PowerShell blocks activation, run this once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Local Admin Login

The supplied local development admin account is:

| Field    | Value           |
| -------- | --------------- |
| Username | `varadesh`      |
| Password | `Varadesh@123` |

**For testing purposes, the password for every user is set to `Varadesh@123`.**

Open the admin site at http://127.0.0.1:8000/admin/.

These credentials are for local development only. Change the password before sharing or deploying the project.

If this account does not exist in your database, create it with:

Location must be ''' CMS\College_Management_System> '''

```powershell
python manage.py createsuperuser
```

## Create a Teacher

1. Sign in to Django admin.
2. Create a user under **Authentication and Authorization > Users**.
3. Add the user’s first name, last name, username, and password.
4. Create a **Teacher profile** for that user.
5. Enter a unique employee ID and department.
6. Create subjects and assign them to the teacher.

Students can register from the React login page.

## Run the Project

Use two terminals.

### Terminal 1: Django backend

From the project root:

```powershell
python manage.py runserver
```

Backend: http://127.0.0.1:8000/

### Terminal 2: React frontend

```powershell
cd frontend
npm run dev
```

Frontend: http://localhost:5173/

Open the frontend URL in the browser. Vite proxies `/api` requests to Django through [frontend/vite.config.js](frontend/vite.config.js).

## Useful Commands

```powershell
# Django configuration check
python manage.py check

# Backend tests
python manage.py test

# Create migrations after model changes
python manage.py makemigrations
python manage.py migrate
```

Frontend commands must be run inside `frontend/`:

```powershell
npm run build
npm run preview
```

## Main API Routes

* `POST /api/auth/login/` - student or teacher login
* `POST /api/auth/student-signup/` - student registration
* `GET /api/auth/me/` - current authenticated user
* `GET /api/student/dashboard/` - student dashboard
* `GET /api/teacher/dashboard/` - teacher dashboard
* `POST /api/teacher/enrollments/` - enroll a student
* `POST /api/teacher/attendance/` - save attendance
* `POST /api/teacher/assignments/` - publish an assignment
* `POST /api/teacher/announcements/` - publish an announcement

## Troubleshooting

* **Django is missing:** activate `.venv` and run `python -m pip install -r requirements.txt`.
* **Frontend cannot reach the API:** make sure both servers are running and Django is on port `8000`.
* **Database tables are missing:** run `python manage.py migrate`.
* **Port 8000 is busy:** run `python manage.py runserver 8001` and update the Vite proxy target in `frontend/vite.config.js`.

This project is configured for local development. Before production deployment, change the secret key and admin password, disable debug mode, configure allowed hosts, and enable HTTPS.
