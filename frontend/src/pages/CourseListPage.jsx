import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../api/axios";
import formatDate from "../utils/formatDate";

function CourseListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("-created_at");

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError("");

    const timer = setTimeout(() => {
      const fetchCourses = async () => {
        try {
          const response = await api.get(
            `/api/courses/?search=${search}&ordering=${ordering}`,
            { signal: controller.signal }
          );

          setCourses(response.data);
        } catch (err) {
          if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
            setError("Failed to load courses.");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchCourses();
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, ordering]);

  return (
    <>
      <Navbar />

      <div className="page-container">
        <h1>Courses</h1>

        <p className="subtitle">Browse and continue learning</p>

        <div className="course-toolbar">
          <input
            type="text"
            placeholder="Search courses"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
          >
            <option value="-created_at">Newest</option>
            <option value="created_at">Oldest</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
          </select>
        </div>

        {loading && <p>Loading...</p>}

        {error && <p className="error">{error}</p>}

        {!loading && courses.length === 0 && (
          <p>No courses found.</p>
        )}

        {courses.map((course) => (
          <div key={course.id} className="course-card">
            <h2>{course.title}</h2>

            <p>{course.description}</p>

            <p>
              Instructor: {course.instructor_name}
            </p>

            <p>
              Lessons: {course.lesson_count}
            </p>

            <p>
              Created On: {formatDate(course.created_at)}
            </p>

            <p>
              {course.is_enrolled ? "Enrolled" : "Not Enrolled"}
            </p>

            <Link to={`/courses/${course.id}`}>
              Open Course
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}

export default CourseListPage;