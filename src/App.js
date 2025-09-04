import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import TurnoDisplay from "./views/TurnoDisplay";
import TurnoAdmin from "./views/TurnoAdmin";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/RequireAuth";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/tv" element={<TurnoDisplay />} />

        <Route
          path="/cajero"
          element={
            <RequireAuth soloCajero>
              <TurnoAdmin />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth soloAdmin>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
