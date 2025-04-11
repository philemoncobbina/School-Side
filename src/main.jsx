import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import HomePage from './Pages/HomePage';
import SignupPage from './Pages/SignupPage';
import LoginPage from './Pages/LoginPage';
import DashboardPage from './Pages/DashboardPage';
import Reservations from './Pages/Reservations';
import ComplaintForms from './Pages/ComplaintForms';
import SubscriptionForms from './Pages/SubscriptionForms';
import Admissions from './Pages/Admissions';
import IdleTimerHandler from './Services/IdleTimerHandler';
import SideBar from './layouts/HomePage/SideBar';
import RequireAuth from './Services/RequireAuth';
import RequirePrincipalAuth from './Services/RequirePrincipalAuth';
import AuthProvider from './Services/AuthProvider';
import EditComplain from './Pages/EditComplain';
import EditReservation from './layouts/Reservations/EditReservation';
import AdmissionReview from './Pages/AdmissionReview';
import TicketPage from './Pages/TicketPage';
import TicketEditpage from './Pages/TicketEditpage';
import UseradminPage from './Pages/UseradminPage';
import JobpostPage from './Pages/JobpostPage';
import JobPostEditPage from './Pages/JobPostEditPage';
import Addjobpost from './Pages/Addjobpost';
import Jobapplicationpage from './Pages/Jobapplicationpage';
import EditJobapplicationpage from './Pages/EditJobapplicationpage';
import StudentAuthPage from './Pages/StudentAuthPage';


const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: (
      <RequirePrincipalAuth>
        <SignupPage />
      </RequirePrincipalAuth>
    ),
  },
  {
    path: '/users',
    element: (
      <RequirePrincipalAuth>
        <UseradminPage />
      </RequirePrincipalAuth>
    ),
  },
  {
    path: '/create-student',
    element: (
      <RequirePrincipalAuth>
        <StudentAuthPage />
      </RequirePrincipalAuth>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <IdleTimerHandler />
        <SideBar />
      </RequireAuth>
    ),
    children: [
      {
        path: '',
        element: <DashboardPage />,
      },
      {
        path: 'reservations',
        element: <Reservations />,
      },
      {
        path: 'complaints',
        element: <ComplaintForms />,
      },
      {
        path: 'jobpost/:id/edit', // Corrected here to be relative
        element: <JobPostEditPage />,
      },
      {
        path: 'tickets',
        element: <TicketPage />,
      },
      {
        path: 'subscriptions',
        element: <SubscriptionForms />,
      },
      {
        path: 'admissions',
        element: <Admissions />,
      },
      {
        path: 'jobpost',
        element: <JobpostPage />,
      },
      {
        path: 'jobpost/new',
        element: <Addjobpost />,
      },
      {
        path: 'jobapplication',
        element: <Jobapplicationpage />,
      },
      {
        path: 'jobapplication/edit/:id',
        element: <EditJobapplicationpage />,
      },
      {
        path: 'reservations/edit/:id',
        element: <EditReservation />,
      },
      {
        path: 'tickets/edit/:id',
        element: <TicketEditpage />,
      },
      {
        path: 'complaints/edit/:id',
        element: <EditComplain />,
      },
      {
        path: 'admissions/edit-admission/:id',
        element: <AdmissionReview />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
