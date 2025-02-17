import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobApplicationService } from '../../Services/Jobapplication';

const EditJobApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const data = await jobApplicationService.getApplicationById(id);
        setApplication(data);
      } catch (err) {
        setError('Failed to load application details');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append('first_name', application.first_name);
      formData.append('last_name', application.last_name);
      formData.append('email', application.email);
      formData.append('educational_level', application.educational_level);
      formData.append('status', application.status);
      
      if (resumeFile) {
        formData.append('resume', resumeFile);
      }

      await jobApplicationService.updateApplication(id, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Application updated successfully!');
      navigate('/dashboard/jobapplication');
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await jobApplicationService.deleteApplication(id);
        alert('Application deleted successfully!');
        navigate('/dashboard/jobapplications');
      } catch (err) {
        console.error('Failed to delete application:', err);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Edit Job Application</h2>
      <input
        type="text"
        value={application.first_name}
        onChange={(e) => setApplication({ ...application, first_name: e.target.value })}
        className="border p-2 rounded w-full mb-3"
        placeholder="First Name"
      />
      <input
        type="text"
        value={application.last_name}
        onChange={(e) => setApplication({ ...application, last_name: e.target.value })}
        className="border p-2 rounded w-full mb-3"
        placeholder="Last Name"
      />
      <input
        type="email"
        value={application.email}
        onChange={(e) => setApplication({ ...application, email: e.target.value })}
        className="border p-2 rounded w-full mb-3"
        placeholder="Email"
      />
      <select
        value={application.educational_level}
        onChange={(e) => setApplication({ ...application, educational_level: e.target.value })}
        className="border p-2 rounded w-full mb-3"
      >
        <option value="HIGH_SCHOOL">High School</option>
        <option value="ASSOCIATE">Associate</option>
        <option value="BACHELOR">Bachelor</option>
        <option value="MASTER">Master</option>
        <option value="PHD">PhD</option>
      </select>
      <select
        value={application.status}
        onChange={(e) => setApplication({ ...application, status: e.target.value })}
        className="border p-2 rounded w-full mb-3"
      >
        <option value="PENDING">Pending</option>
        <option value="SHORTLISTED">Shortlisted</option>
        <option value="REJECTED">Rejected</option>
        <option value="HIRED">Hired</option>
      </select>
      {application.resume && (
        <a
          href={application.resume}
          download
          className="text-blue-600 underline block mb-3"
        >
          Download Resume
        </a>
      )}
      <input
        type="file"
        onChange={(e) => setResumeFile(e.target.files[0])}
        className="border p-2 rounded w-full mb-3"
      />
      <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
      <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded ml-2">Delete</button>
    </div>
  );
};

export default EditJobApplication;
