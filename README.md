# LearnHub

An AI-powered Learning Management System (LMS) built using **Django REST Framework** and **React**.

LearnHub provides a complete online learning platform where students can enroll in courses, track progress, attempt quizzes, and interact with an AI tutor. Instructors can create courses, lessons, quizzes, and manage learning content through dedicated APIs.

---

# 🚀 Features

## 👤 Authentication & User Management

* JWT Authentication
* User Registration
* User Login
* Token Refresh
* Profile Management
* Password Change
* Role Based Access Control
* User Roles:

  * Student
  * Instructor

---

## 📚 Course Management

### Students

* Browse all courses
* View course details
* Enroll in courses
* View lessons
* Mark lessons as completed
* Track learning progress
* Generate course certificates

### Instructors

* Create courses
* Update course details
* Delete courses
* Add lessons
* Edit lessons
* Manage course content

---

## 📝 Quiz System

### Students

* Attempt quizzes
* Multiple attempts supported
* Automatic scoring
* Pass / Fail evaluation

### Instructors

* Create quizzes
* Add questions
* Add choices
* Manage quizzes
* Support for:

  * Multiple Choice Questions (MCQ)
  * True / False Questions

---

## 🤖 AI Tutor

The AI Tutor acts as an intelligent learning assistant.

Features:

* Answer student questions
* Explain difficult concepts
* Provide examples
* Simplify complex topics
* Course-related doubt clearing
* Conversational interface
* Real-time responses

---

# 🛠 Tech Stack

## Backend

* Python
* Django
* Django REST Framework
* SQLite
* JWT Authentication
* drf-spectacular (Swagger API Docs)

---

## Frontend

* React
* Vite
* React Router DOM
* Axios
* Context API

---

## AI

* OpenAI API
* Prompt Engineering
* Context-aware conversations

---

# 📁 Project Structure

```text
LMS/

accounts/
│
├── models.py
├── serializers.py
├── views.py
└── urls.py


courses/
│
├── models.py
├── serializers.py
├── views.py
├── permissions.py
└── urls.py


quiz/
│
├── models.py
├── serializers.py
├── views.py
└── urls.py


ai_tutor/
│
├── views.py
└── urls.py


config/
│
├── settings.py
└── urls.py


frontend/
│
└── src/
    ├── api/
    ├── components/
    ├── context/
    ├── pages/
    └── utils/
```

---

# 🗄 Database Design

## User

Stores authentication and profile details.

| Field    | Type                 |
| -------- | -------------------- |
| id       | Integer              |
| username | String               |
| email    | String               |
| password | Hashed String        |
| role     | student / instructor |
| bio      | Text                 |

---

## Course

Stores course information.

| Field       | Type     |
| ----------- | -------- |
| id          | Integer  |
| title       | String   |
| description | Text     |
| instructor  | FK(User) |
| published   | Boolean  |
| created_at  | DateTime |
| updated_at  | DateTime |

---

## Lesson

Stores lessons under courses.

| Field     | Type       |
| --------- | ---------- |
| id        | Integer    |
| course    | FK(Course) |
| title     | String     |
| content   | Text       |
| order     | Integer    |
| video_url | URL        |

---

## Enrollment

Tracks enrolled students.

| Field       | Type       |
| ----------- | ---------- |
| id          | Integer    |
| student     | FK(User)   |
| course      | FK(Course) |
| enrolled_at | DateTime   |

---

## Progress

Tracks lesson completion.

| Field        | Type       |
| ------------ | ---------- |
| id           | Integer    |
| student      | FK(User)   |
| lesson       | FK(Lesson) |
| completed    | Boolean    |
| completed_at | DateTime   |

---

## Quiz

Stores quiz details.

| Field      | Type             |
| ---------- | ---------------- |
| id         | Integer          |
| lesson     | OneToOne(Lesson) |
| pass_score | Decimal          |

---

## Question

Stores quiz questions.

| Field         | Type     |
| ------------- | -------- |
| id            | Integer  |
| quiz          | FK(Quiz) |
| text          | Text     |
| question_type | MCQ / TF |

---

## Choice

Stores answer choices.

| Field      | Type         |
| ---------- | ------------ |
| id         | Integer      |
| question   | FK(Question) |
| text       | Text         |
| is_correct | Boolean      |

---

## QuizAttempt

Stores student quiz attempts.

| Field   | Type     |
| ------- | -------- |
| id      | Integer  |
| student | FK(User) |
| quiz    | FK(Quiz) |
| score   | Decimal  |
| passed  | Boolean  |

---

# 🔗 Entity Relationship Diagram

```text
User
│
├── Course (Instructor)
│
├── Enrollment
│      └── Course
│
├── Progress
│      └── Lesson
│             └── Course
│
└── QuizAttempt
       │
       └── Quiz
             │
             └── Lesson
                    │
                    └── Course


Quiz
│
└── Question
      │
      └── Choice
```

---

# 🔐 Authentication APIs

Base URL

```text
/api/auth/
```

---

### Register

```http
POST /api/auth/register/
```

Request

```json
{
  "username":"john",
  "email":"john@example.com",
  "password":"******",
  "role":"student"
}
```

---

### Login

```http
POST /api/auth/login/
```

Response

```json
{
  "access":"jwt_access_token",
  "refresh":"jwt_refresh_token"
}
```

---

### Refresh Token

```http
POST /api/auth/refresh/
```

---

### Profile

```http
GET /api/auth/profile/
```

---

### Change Password

```http
POST /api/auth/change-password/
```

---

# 📚 Course APIs

### Get All Courses

```http
GET /api/courses/
```

---

### Create Course

```http
POST /api/courses/
```

Instructor only.

---

### Course Detail

```http
GET /api/courses/{id}/
```

---

### Enroll in Course

```http
POST /api/courses/{id}/enroll/
```

---

### Certificate

```http
GET /api/courses/{id}/certificate/
```

---

### Lesson Detail

```http
GET /api/lessons/{id}/
```

---

### Complete Lesson

```http
POST /api/lessons/{id}/complete/
```

---

### My Progress

```http
GET /api/myprogress/
```

---

# 👨‍🏫 Instructor APIs

### Instructor Courses

```http
GET /api/instructor/courses/
POST /api/instructor/courses/
```

---

### Instructor Course Detail

```http
GET /api/instructor/courses/{id}/
PUT /api/instructor/courses/{id}/
DELETE /api/instructor/courses/{id}/
```

---

### Instructor Lessons

```http
POST /api/instructor/courses/{id}/lessons/
```

---

### Instructor Lesson Detail

```http
GET /api/instructor/lessons/{id}/
PUT /api/instructor/lessons/{id}/
DELETE /api/instructor/lessons/{id}/
```

---

# 📝 Quiz APIs

### Quiz Detail

```http
GET /api/quizzes/{id}/
```

---

### Submit Quiz

```http
POST /api/quizzes/{id}/submit/
```

Request

```json
{
  "answers":[
    {
      "question":1,
      "choice":2
    }
  ]
}
```

Response

```json
{
  "score":8,
  "passed":true
}
```

---

### Instructor Quiz APIs

```http
GET    /api/instructor/quizzes/

GET    /api/instructor/quizzes/{id}/

POST   /api/instructor/quizzes/{id}/questions/

GET    /api/instructor/questions/{id}/

POST   /api/instructor/questions/{id}/choices/

GET    /api/instructor/choices/{id}/
```

---

# 🤖 AI Tutor API

### Chat With AI

```http
POST /api/aichat/
```

Request

```json
{
  "message":"Explain Decision Trees"
}
```

Response

```json
{
  "reply":"Decision Trees are supervised learning algorithms..."
}
```

---

# 📖 API Documentation

Swagger UI is available at:

```text
/api/docs/
```

API Schema:

```text
/api/schema/
```

---

# ⚙ Installation

## Backend

```bash
git clone <repository>

cd LMS

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```
---

# Author

**Sourav K**

Full Stack Learning Management System with AI Tutor built using Django REST Framework and React.
