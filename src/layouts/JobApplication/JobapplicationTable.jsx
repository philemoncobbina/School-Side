import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Trash, Edit, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobApplicationService } from '../../Services/Jobapplication';

const JobApplicationsTable = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
    
    // Close popover when clicking outside
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpenPopoverId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Filter applications based on search term
    if (searchTerm.trim() === '') {
      setFilteredApplications(applications);
    } else {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = applications.filter(app => 
        app.job_title.toLowerCase().includes(lowercasedTerm) ||
        app.job_reference_number.toLowerCase().includes(lowercasedTerm) ||
        `${app.first_name} ${app.last_name}`.toLowerCase().includes(lowercasedTerm) ||
        app.email.toLowerCase().includes(lowercasedTerm) ||
        app.status.toLowerCase().includes(lowercasedTerm) ||
        app.educational_level.toLowerCase().includes(lowercasedTerm)
      );
      setFilteredApplications(filtered);
    }
  }, [searchTerm, applications]);

  const loadApplications = async () => {
    try {
      const data = await jobApplicationService.getMyApplications();
      setApplications(data);
      setFilteredApplications(data);
      setError(null);
    } catch (err) {
      setError('Failed to load applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await jobApplicationService.deleteApplication(id);
        const updatedApplications = applications.filter(app => app.id !== id);
        setApplications(updatedApplications);
        setFilteredApplications(updatedApplications.filter(app => 
          searchTerm.trim() === '' || 
          Object.values(app).some(value => 
            typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ));
        setOpenPopoverId(null);
      } catch (err) {
        console.error('Failed to delete application:', err);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/jobapplication/edit/${id}`);
    setOpenPopoverId(null);
  };

  const togglePopover = (id) => {
    setOpenPopoverId(openPopoverId === id ? null : id);
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'SHORTLISTED': 'bg-blue-100 text-blue-800',
      'REJECTED': 'bg-red-100 text-red-800',
      'HIRED': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) return <div className="flex justify-center p-4">Loading applications...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="w-full">
      {/* Search Field */}
      <div className="p-4 mb-4 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        {filteredApplications.length !== applications.length && (
          <div className="mt-2 text-sm text-gray-500">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Education</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{application.job_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{application.job_reference_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{application.first_name} {application.last_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{application.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(application.applied_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{application.educational_level.replace('_', ' ')}</td>
                  <td className="px-6 py-4 relative">
                    <button 
                      onClick={() => togglePopover(application.id)} 
                      className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-5 w-5 text-gray-500" />
                    </button>
                    
                    {openPopoverId === application.id && (
                      <div 
                        ref={popoverRef}
                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                        style={{ top: '100%' }}
                      >
                        <div className="py-1 rounded-md bg-white shadow-xs">
                          <button
                            onClick={() => handleEdit(application.id)}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="mr-3 h-4 w-4 text-blue-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(application.id)}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Trash className="mr-3 h-4 w-4 text-red-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  No applications found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobApplicationsTable;