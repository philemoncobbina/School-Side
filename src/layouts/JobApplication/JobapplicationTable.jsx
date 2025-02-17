import React, { useState, useEffect } from 'react';
import { MoreVertical, Trash, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { jobApplicationService } from '../../Services/Jobapplication';

const JobApplicationsTable = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openPopoverId, setOpenPopoverId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const data = await jobApplicationService.getMyApplications();
      setApplications(data);
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
        setApplications(applications.filter(app => app.id !== id));
        setOpenPopoverId(null);
      } catch (err) {
        console.error('Failed to delete application:', err);
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/dashboard/jobapplication/edit/${id}`);
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

  if (loading) return <div className="flex justify-center p-4">Loading applications...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="w-full overflow-x-auto">
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
          {applications.map((application) => (
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
              <td className="px-6 py-4">
                <button onClick={() => handleEdit(application.id)} className="text-blue-600 hover:underline mr-2">
                  <Edit className="inline h-4 w-4 mr-1" /> Edit
                </button>
                <button onClick={() => handleDelete(application.id)} className="text-red-600 hover:underline">
                  <Trash className="inline h-4 w-4 mr-1" /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobApplicationsTable;
