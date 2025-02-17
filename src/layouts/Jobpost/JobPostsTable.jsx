import React, { useState, useEffect } from 'react';
import { JobPostService } from '../../Services/jobPostService';
import { MoreHorizontal, Search, CheckCircle, Clock, PenLine, Trash2, Eye, FileEdit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const JobPostsTable = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // Close menu when clicking outside
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await JobPostService.getAllPosts();
      setPosts(data);
    } catch (err) {
      setError('Failed to load job posts');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      await JobPostService.publishPost(id);
      loadPosts();
    } catch (err) {
      setError('Failed to publish post');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await JobPostService.deletePost(id);
        loadPosts();
      } catch (err) {
        setError('Failed to delete post');
      }
    }
  };

  const handleEdit = (postId) => {
    navigate(`/dashboard/jobpost/${postId}/edit`);
  };

  const handleAddJobPost = () => {
    navigate('/dashboard/jobpost/new');
  };

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <PenLine className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredPosts = posts.filter(post => {
    const searchLower = searchTerm.toLowerCase();
    return (
      post.reference_number?.toLowerCase().includes(searchLower) ||
      post.title?.toLowerCase().includes(searchLower) ||
      post.location?.toLowerCase().includes(searchLower) ||
      post.status?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddJobPost}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Job Post</span>
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Ref. Number</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Title</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="group hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="relative">
                      <span className="absolute -top-2 right-0 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {Math.round(post.applications_count)}
                      </span>
                      <span className="block pt-2">{post.reference_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {post.title}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(post.status)}
                      <span className="text-sm text-gray-600">
                        {post.status.charAt(0) + post.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.location}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {format(new Date(post.created_at), 'MMM dd, yyyy hh:mm a')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="">
                      <button
                        onClick={(e) => toggleMenu(e, post.id)}
                        className=" group-hover:visible p-1 rounded-full hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      </button>
                      
                      {openMenuId === post.id && (
                        <div className="absolute right-5 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1">
                            <button
                              onClick={() => handleEdit(post.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <FileEdit className="h-4 w-4" />
                              <span>Edit</span>
                            </button>
                            
                            {post.status === 'DRAFT' && (
                              <button
                                onClick={() => handlePublish(post.id)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span>Publish</span>
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobPostsTable;