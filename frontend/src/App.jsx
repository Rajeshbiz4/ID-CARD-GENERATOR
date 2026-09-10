import {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import {
  AdminDashboard,
  SchoolDashboard,
} from "./pages/Dashboards";
import SchoolsPage from "./pages/SchoolsPage";
import StudentsPage from "./pages/StudentsPage";
import StudentFormPage from "./pages/StudentFormPage";
import ProfilePage from "./pages/ProfilePage";
import TemplatesPage from "./pages/TemplatesPage";
import CustomTemplatePage from "./pages/CustomTemplatePage";
import IdCardsPage from "./pages/IdCardsPage";

import {
  beginLoading,
  endLoading,
} from "./loaderStore";

function storedUser() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "sid_user"
      )
    );
  } catch {
    return null;
  }
}

export default function App() {
  const [user, setUser] =
    useState(storedUser());

  const navigate =
    useNavigate();

  const location =
    useLocation();

  /*
   * This guarantees visible loading feedback
   * every time the user changes pages.
   * API loaders stay active independently if
   * the server request takes longer.
   */
  useEffect(() => {
    const token =
      beginLoading("route");

    const timer =
      setTimeout(
        () => {
          endLoading(token);
        },
        650
      );

    return () => {
      clearTimeout(timer);
      endLoading(token);
    };
  }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem(
      "sid_token"
    );

    localStorage.removeItem(
      "sid_user"
    );

    setUser(null);
    navigate("/login");
  };

  const protect = (
    role,
    Component
  ) =>
    user &&
    user.role === role ? (
      <Component
        user={user}
        onLogout={logout}
      />
    ) : (
      <Navigate
        to="/login"
        replace
      />
    );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={setUser}
          />
        }
      />

      <Route
        path="/admin"
        element={protect(
          "ADMIN",
          AdminDashboard
        )}
      />

      <Route
        path="/admin/schools"
        element={protect(
          "ADMIN",
          SchoolsPage
        )}
      />

      <Route
        path="/school"
        element={protect(
          "SCHOOL",
          SchoolDashboard
        )}
      />

      <Route
        path="/school/students"
        element={protect(
          "SCHOOL",
          StudentsPage
        )}
      />

      <Route
        path="/school/students/new"
        element={protect(
          "SCHOOL",
          StudentFormPage
        )}
      />

      <Route
        path="/school/students/:id/edit"
        element={protect(
          "SCHOOL",
          StudentFormPage
        )}
      />

      <Route
        path="/school/profile"
        element={protect(
          "SCHOOL",
          ProfilePage
        )}
      />

      <Route
        path="/school/templates"
        element={protect(
          "SCHOOL",
          TemplatesPage
        )}
      />

      <Route
        path="/school/custom-template"
        element={protect(
          "SCHOOL",
          CustomTemplatePage
        )}
      />

      <Route
        path="/school/id-cards"
        element={protect(
          "SCHOOL",
          IdCardsPage
        )}
      />

      <Route
        path="*"
        element={
          <Navigate
            to={
              user
                ? user.role ===
                  "ADMIN"
                  ? "/admin"
                  : "/school"
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}
