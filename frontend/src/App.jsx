import {

  BrowserRouter,

  Routes,

  Route,

  Navigate

}

from "react-router-dom";


import {

  AuthProvider

}

from "./context/AuthContext";


import ProtectedRoute from "./components/ProtectedRoute";

import InstructorRoute from "./components/InstructorRoute";


import LoginPage from "./pages/LoginPage";

import RegisterPage from "./pages/RegisterPage";

import DashboardPage from "./pages/DashboardPage";

import CourseListPage from "./pages/CourseListPage";

import CourseDetailPage from "./pages/CourseDetailPage";

import LessonPage from "./pages/LessonPage";

import QuizPage from "./pages/QuizPage";

import AITutorPage from "./pages/AITutorPage";

import ProfilePage from "./pages/ProfilePage";

import CertificatePage from "./pages/CertificatePage";

import InstructorDashboard from "./pages/InstructorDashboard";

import CreateCoursePage from "./pages/CreateCoursePage";

import EditCoursePage from "./pages/EditCoursePage";

import EditLessonPage from "./pages/EditLessonPage";

import InstructorLessonsPage from "./pages/InstructorLessonsPage";

import EditQuizPage from "./pages/EditQuizPage";



function App() {

  return (

    <AuthProvider>

      <BrowserRouter>


        <Routes>


          <Route

            path="/"

            element={

              <Navigate to="/login" />

            }

          />


          <Route

            path="/login"

            element={<LoginPage/>}

          />


          <Route

            path="/register"

            element={<RegisterPage/>}

          />


          <Route

            path="/dashboard"

            element={

              <ProtectedRoute>

                <DashboardPage/>

              </ProtectedRoute>

            }

          />


          <Route

            path="/courses"

            element={

              <ProtectedRoute>

                <CourseListPage/>

              </ProtectedRoute>

            }

          />


          <Route

            path="/courses/:id"

            element={

              <ProtectedRoute>

                <CourseDetailPage/>

              </ProtectedRoute>

            }

          />


          <Route

            path="/certificate/:id"

            element={

              <ProtectedRoute>

                <CertificatePage/>

              </ProtectedRoute>

            }

          />


          <Route

            path="/lessons/:id"

            element={

              <ProtectedRoute>

                <LessonPage/>

              </ProtectedRoute>

            }

          />


          <Route

            path="/quiz/:id"

            element={

              <ProtectedRoute>

                <QuizPage/>

              </ProtectedRoute>

            }

          />


          <Route

            path="/lessons/:id/chat"

            element={

              <ProtectedRoute>

                <AITutorPage/>

              </ProtectedRoute>

            }

          />


          <Route

            path="/profile"

            element={

              <ProtectedRoute>

                <ProfilePage/>

              </ProtectedRoute>

            }

          />

          <Route

            path="/teacher"

            element={

              <ProtectedRoute>

                <InstructorRoute>

                  <InstructorDashboard/>

                </InstructorRoute>

              </ProtectedRoute>

            }

          />


          <Route

            path="/teacher/course/create"

            element={

              <ProtectedRoute>

                <InstructorRoute>

                  <CreateCoursePage/>

                </InstructorRoute>

              </ProtectedRoute>

            }

          />


          <Route

            path="/teacher/course/:id/edit"

            element={

              <ProtectedRoute>

                <InstructorRoute>

                  <EditCoursePage/>

                </InstructorRoute>

              </ProtectedRoute>

            }

          />


          <Route

            path="/teacher/course/:id/lessons"

            element={

              <ProtectedRoute>

                <InstructorRoute>

                  <InstructorLessonsPage/>

                </InstructorRoute>

              </ProtectedRoute>

            }

          />


          <Route

            path="/teacher/lesson/:id/edit"

            element={

              <ProtectedRoute>

                <InstructorRoute>

                  <EditLessonPage/>

                </InstructorRoute>

              </ProtectedRoute>

            }

          />


          <Route

            path="/teacher/quiz/:id/edit"

            element={

              <ProtectedRoute>

                <InstructorRoute>

                  <EditQuizPage/>

                </InstructorRoute>

              </ProtectedRoute>

            }

          />

        </Routes>


      </BrowserRouter>

    </AuthProvider>

  );

}


export default App;
