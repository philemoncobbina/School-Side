import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JobPostService } from '../../Services/jobPostService';
import { CalendarIcon, SaveIcon, TrashIcon, CheckCircleIcon, ClockIcon, VolumeXIcon } from 'lucide-react';
import { format } from 'date-fns';

export default function JobPostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  
  const [post, setPost] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary_range: '',
    status: 'DRAFT',
    scheduled_date: null
  });

  useEffect(() => {
    if (id) {
      loadPost();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      const data = await JobPostService.getPostById(parseInt(id));
      setPost(data);
    } catch (err) {
      setError('Failed to load job post');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPost(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await JobPostService.updatePost(parseInt(id), post);
      } else {
        await JobPostService.createPost(post);
      }
      navigate('/dashboard/jobpost');
    } catch (err) {
      setError('Failed to save job post');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await JobPostService.deletePost(parseInt(id));
        navigate('/dashboard/jobpost');
      } catch (err) {
        setError('Failed to delete post');
      }
    }
  };

  const handlePublish = async () => {
    try {
      await JobPostService.publishPost(parseInt(id));
      loadPost();
    } catch (err) {
      setError('Failed to publish post');
    }
  };

  const handleMute = async () => {
    if (window.confirm('Are you sure you want to cancel the scheduled post? It will be moved back to draft status.')) {
      try {
        await JobPostService.updatePost(parseInt(id), { ...post, status: 'DRAFT', scheduled_date: null });
        loadPost();
      } catch (err) {
        setError('Failed to cancel schedule');
      }
    }
  };

  const handleSchedule = async () => {
    try {
      await JobPostService.schedulePost(parseInt(id), { scheduled_date: scheduleDate });
      setShowScheduleModal(false);
      loadPost();
    } catch (err) {
      setError('Failed to schedule post');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {id ? 'Edit Job Post' : 'Create New Job Post'}
          </h1>
          <div className="flex space-x-4">
            {post.status === 'DRAFT' && id && (
              <>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Schedule
                </button>
                <button
                  onClick={handlePublish}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Publish
                </button>
              </>
            )}
            {post.status === 'PUBLISHED' && (
              <button
                onClick={handleMute}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                <VolumeXIcon className="w-4 h-4 mr-2" />
                Mute Post
              </button>
            )}
            {post.status === 'SCHEDULED' && (
              <>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Reschedule
                </button>
                <button
                  onClick={handleMute}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  <VolumeXIcon className="w-4 h-4 mr-2" />
                  Cancel Schedule
                </button>
              </>
            )}
            {id && (
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Status Badge */}
        {post.status && (
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
              ${post.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' : 
                post.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' : 
                'bg-green-100 text-green-800'}`}>
              {post.status}
              {post.scheduled_date && (
                <span className="ml-2">
                  {format(new Date(post.scheduled_date), 'MMM dd, yyyy hh:mm a')}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={post.title}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={post.location}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Salary Range</label>
            <input
              type="text"
              name="salary_range"
              value={post.salary_range}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={post.description}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Requirements</label>
            <textarea
              name="requirements"
              value={post.requirements}
              onChange={handleInputChange}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </form>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">
                {post.status === 'SCHEDULED' ? 'Reschedule Post' : 'Schedule Post'}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Publication Date</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {post.status === 'SCHEDULED' ? 'Reschedule' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}