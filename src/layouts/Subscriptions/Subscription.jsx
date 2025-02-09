import React, { useEffect, useState } from 'react';
import { getSubscriptions, deleteSubscription, getEmailList, updateEmailList } from '../../Services/SubscriptionService';
import { FaTrashAlt, FaCopy } from 'react-icons/fa';

const Subscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newEmails, setNewEmails] = useState('');
  const [emailList, setEmailList] = useState('');

  useEffect(() => {
    fetchSubscriptions();
    fetchEmailList();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      setError("Failed to fetch subscriptions.");
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailList = async () => {
    try {
      const data = await getEmailList();
      if (data && data.length > 0 && data[0].emails) {
        setEmailList(data[0].emails);
      } else {
        setEmailList('No emails available');
      }
    } catch (error) {
      console.error("Failed to fetch email list:", error);
      setError("Failed to load email list.");
    }
  };

  const handleDeleteSubscription = async (id) => {
    setError(null);
    try {
      await deleteSubscription(id);
      setSuccess("Subscription deleted successfully.");
      fetchSubscriptions();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to delete subscription.");
      console.error("Failed to delete subscription:", error);
    }
  };

  const handleUpdateEmailList = async () => {
    if (!newEmails.trim()) {
      setError("Please enter one or more email addresses.");
      return;
    }
    try {
      const emailsArray = newEmails.split(';').map(email => email.trim());
      await updateEmailList(emailsArray);
      setSuccess("Email list updated successfully.");
      setNewEmails('');
      fetchEmailList();
    } catch (error) {
      setError(error.response?.data?.detail || "Failed to update email list.");
      console.error("Failed to update email list:", error);
    }
  };

  const copyEmailList = () => {
    navigator.clipboard.writeText(emailList);
    setSuccess("Email list copied to clipboard!");
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-md max-w-4xl">
      <h2 className="text-4xl font-extrabold mb-6 text-gray-800">Manage Subscriptions</h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading subscriptions...</span>
        </div>
      ) : (
        <div>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

          <table className="w-full bg-white border border-gray-300 rounded-lg shadow">
            <thead>
              <tr>
                <th className="py-4 px-6 bg-gray-100 text-left font-semibold text-gray-600">ID</th>
                <th className="py-4 px-6 bg-gray-100 text-left font-semibold text-gray-600">Full Name</th>
                <th className="py-4 px-6 bg-gray-100 text-left font-semibold text-gray-600">Email</th>
                <th className="py-4 px-6 bg-gray-100 text-center font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-700">{sub.id}</td>
                  <td className="py-4 px-6 text-gray-700">{sub.full_name}</td>
                  <td className="py-4 px-6 text-gray-700">{sub.email}</td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleDeleteSubscription(sub.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 focus:outline-none"
                      aria-label="Delete subscription"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subscriptions.length === 0 && (
            <div className="text-center text-gray-500 py-6">No subscriptions found.</div>
          )}

          <div className="mt-10">
            <h3 className="text-3xl font-semibold text-gray-700 mb-4">Update Email List</h3>
            <div className="relative">
  <output
    className="block bg-gray-100 pt-9 p-4 rounded-lg shadow-inner text-gray-700 w-full mb-4 break-words transition-all duration-300"
    style={{ whiteSpace: "pre-wrap" }}
  >
    {emailList}
    <button
      onClick={copyEmailList}
      className="absolute top-4 right-4 bg-gray-700 p-1 rounded-full hover:bg-gray-600 focus:outline-none"
      aria-label="Copy email list"
      title="Copy email list" // Tooltip for hover
    >
      <FaCopy className="text-white" />
    </button>
  </output>
</div>



<label htmlFor="email" className="block mb-2 text-gray-800 font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={newEmails}
              onChange={(e) => setNewEmails(e.target.value)}
              placeholder="Enter emails separated by semicolons"
              className="border border-gray-300 rounded px-4 py-2 w-full mb-4 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={handleUpdateEmailList}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Update Email List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
