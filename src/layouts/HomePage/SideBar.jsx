import Navbar from './Navbar';
import { NavLink, Outlet } from 'react-router-dom';

const SideBar = () => {
  const sections = [
    { name: 'Reservations', key: 'reservations', path: '/dashboard/reservations' },
    { name: 'Complaint Forms', key: 'complaints', path: '/dashboard/complaints' },
    { name: 'Subscription Forms', key: 'subscriptions', path: '/dashboard/subscriptions' },
    { name: 'Admissions', key: 'admissions', path: '/dashboard/admissions' },
    { name: 'Tickets', key: 'tickets', path: '/dashboard/tickets' },
    { name: 'Job Post', key: 'jobpost', path: '/dashboard/jobpost' },
    { name: 'Job Application', key: 'jobapplication', path: '/dashboard/jobapplication' },
  ];

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 fixed h-screen">
        <h1 className="text-2xl font-bold mb-8">Ridoana Admin</h1>
        <nav>
          {sections.map((section) => (
            <NavLink
              key={section.key}
              to={section.path}
              className={({ isActive }) =>
                `block py-2 px-4 mb-2 rounded ${isActive ? 'bg-gray-600' : 'hover:bg-gray-700'}`
              }
            >
              {section.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Navbar */}
        <Navbar />

        {/* Section content is handled by Routes */}
        <main className="mt-0">
          <Outlet /> {/* This is where the child routes will be rendered */}
        </main>
      </div>
    </div>
  );
};

export default SideBar;
