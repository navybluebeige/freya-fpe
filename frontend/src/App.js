import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import './index.css';

import RegisterPage   from './pages/RegisterPage';
import LoginPage      from './pages/LoginPage';
import HomePage       from './pages/HomePage';
import DoctorSearchPage from './pages/doctor/DoctorSearchPage';
import DoctorDashboard  from './pages/doctor/DoctorDashboard';
import DoctorMessages   from './pages/doctor/DoctorMessages';
import AdminDashboard     from './pages/admin/AdminDashboard';
import AdminDoctors       from './pages/admin/AdminDoctors';
import AdminPatients      from './pages/admin/AdminPatients';
import AdminLabs          from './pages/admin/AdminLabs';
import AdminAppointments  from './pages/admin/AdminAppointments';
import AdminClinics       from './pages/admin/AdminClinics';
import PatientMessages  from './pages/patient/PatientMessages';
import PatientDossier   from './pages/patient/PatientDossier';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientProfile   from './pages/patient/PatientProfile';
import PatientFavoris   from './pages/patient/PatientFavoris';
import PatientDashboard from './pages/patient/PatientDashboard';

import BookingPage from './pages/patient/BookingPage';
import { DoctorPublicPage } from './pages/DoctorPublicPage';
import LabPublicPage        from './pages/LabPublicPage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointments';
import DoctorPatientsPage     from './pages/doctor/DoctorPatients';
import DoctorAvailabilityPage from './pages/doctor/DoctorAvailability';
import LabDashboard     from './pages/labo/LabDashboard';
import LabAnalyses      from './pages/labo/LabAnalyses';
import LabMessages      from './pages/labo/LabMessages';
import LabProfile       from './pages/labo/LabProfile';
import LabAppointments  from './pages/labo/LabAppointments';

import PatientNotifications  from './pages/patient/PatientNotifications';
import DoctorNotifications  from './pages/doctor/DoctorNotifications';
import LabNotifications     from './pages/labo/LabNotifications';



import DoctorProfile        from './pages/doctor/DoctorProfile';
import DoctorPatientDossier  from './pages/doctor/DoctorPatientDossier';
import LabBookingPage        from './pages/patient/LabBookingPage';

// ─── Auth Guard ────────────────────────────────────
const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  console.log('[PrivateRoute] isAuthenticated:', isAuthenticated, '| role:', user?.role, '| required:', roles);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>

        {/* ── Public ──────────────────────────────────── */}
        <Route path="/"          element={<HomePage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />
        <Route path="/doctors"   element={<DoctorSearchPage />} />
        <Route path="/recherche" element={<DoctorSearchPage />} />

        {/* ── Profil médecin ───────────────────────────── */}
        <Route path="/medecin/:id"  element={<DoctorPublicPage />} />
        <Route path="/doctors/:id"  element={<DoctorPublicPage />} />

        {/* ── Page laboratoire ─────────────────────────── */}
        <Route path="/laboratoire/:id" element={<LabPublicPage />} />

        {/* ── Patient ─────────────────────────────────── */}
        <Route path="/patient"              element={<PrivateRoute roles={['patient']}><PatientDashboard /></PrivateRoute>} />
        <Route path="/patient/appointments" element={<PrivateRoute roles={['patient']}><PatientAppointments /></PrivateRoute>} />
        <Route path="/patient/messages"     element={<PrivateRoute roles={['patient']}><PatientMessages /></PrivateRoute>} />
        <Route path="/patient/dossier"      element={<PrivateRoute roles={['patient']}><PatientDossier /></PrivateRoute>} />
        <Route path="/patient/profile"      element={<PrivateRoute roles={['patient']}><PatientProfile /></PrivateRoute>} />
        <Route path="/patient/favoris"      element={<PrivateRoute roles={['patient']}><PatientFavoris /></PrivateRoute>} />
        <Route path="/book/:id"                       element={<PrivateRoute roles={['patient']}><BookingPage /></PrivateRoute>} />
        <Route path="/patient/labo/:clinicId/book"    element={<PrivateRoute roles={['patient']}><LabBookingPage /></PrivateRoute>} />
        <Route path="/patient/notifications" element={<PrivateRoute roles={['patient']}><PatientNotifications /></PrivateRoute>} />
        
        {/* ── Médecin ─────────────────────────────────── */}
        <Route path="/doctor"                    element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/appointments"       element={<PrivateRoute roles={['doctor']}><DoctorAppointmentsPage /></PrivateRoute>} />
        <Route path="/doctor/messages"           element={<PrivateRoute roles={['doctor']}><DoctorMessages /></PrivateRoute>} />
        <Route path="/doctor/patients"           element={<PrivateRoute roles={['doctor']}><DoctorPatientsPage /></PrivateRoute>} />
        <Route path="/doctor/profile"            element={<PrivateRoute roles={['doctor']}><DoctorProfile /></PrivateRoute>} />
        <Route path="/doctor/availability"                element={<PrivateRoute roles={['doctor']}><DoctorAvailabilityPage /></PrivateRoute>} />
        <Route path="/doctor/patients/:patientId/dossier" element={<PrivateRoute roles={['doctor']}><DoctorPatientDossier /></PrivateRoute>} />
        <Route path="/doctor/notifications"      element={<PrivateRoute roles={['doctor']}><DoctorNotifications /></PrivateRoute>} />

        {/* ── Admin ───────────────────────────────────── */}
        <Route path="/admin"               element={<PrivateRoute roles={['admin']}><AdminDashboard    /></PrivateRoute>} />
        <Route path="/admin/doctors"       element={<PrivateRoute roles={['admin']}><AdminDoctors      /></PrivateRoute>} />
        <Route path="/admin/patients"      element={<PrivateRoute roles={['admin']}><AdminPatients     /></PrivateRoute>} />
        <Route path="/admin/labs"          element={<PrivateRoute roles={['admin']}><AdminLabs         /></PrivateRoute>} />
        <Route path="/admin/appointments"  element={<PrivateRoute roles={['admin']}><AdminAppointments /></PrivateRoute>} />
        <Route path="/admin/clinics"       element={<PrivateRoute roles={['admin']}><AdminClinics      /></PrivateRoute>} />

        {/* ── Laboratoire ─────────────────────────────── */}
        <Route path="/labo"                    element={<PrivateRoute roles={['laboratory']}><LabDashboard       /></PrivateRoute>} />
        <Route path="/labo/appointments"       element={<PrivateRoute roles={['laboratory']}><LabAppointments    /></PrivateRoute>} />
        <Route path="/labo/analyses"           element={<PrivateRoute roles={['laboratory']}><LabAnalyses        /></PrivateRoute>} />
        <Route path="/labo/messages"           element={<PrivateRoute roles={['laboratory']}><LabMessages        /></PrivateRoute>} />
        <Route path="/labo/profile"            element={<PrivateRoute roles={['laboratory']}><LabProfile         /></PrivateRoute>} />
        <Route path="/labo/notifications"      element={<PrivateRoute roles={['laboratory']}><LabNotifications   /></PrivateRoute>} />

        {/* ── 404 ─────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;