import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import "./styles/global.css";

import "./styles/navbar.css";

import "./styles/theme.css";

import "./styles/auth.css";

import "./styles/dashboard.css";

import "./styles/courses.css";

import "./styles/quiz.css";

import "./styles/chat.css";

import "./styles/lesson.css";

import "./styles/profile.css";

import "./styles/certificate.css";

import "./styles/instructor.css";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
