import React, { useEffect, useState, useRef } from 'react';
import { FaEdit, FaTrashAlt, FaSearch, FaEllipsisH } from 'react-icons/fa';
import { fetchTickets, deleteTicket } from '../../Services/TicketService';
import UserService from '../../Services/UserService';
import ConfirmationModal from './ConfirmationModal';
import NoAccessModal from './NoAccessModal';
import { useNavigate } from 'react-router-dom';

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNoAccessModal, setShowNoAccessModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [openPopover, setOpenPopover] = useState({});
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  const getUserRole = async () => {
    try {
      const userDetails = await UserService.getUserDetails();
      setUserRole(userDetails.role);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getTickets = async () => {
    try {
      const data = await fetchTickets();
      setTickets(data);
      setFilteredTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getUserRole();  // Corrected function call
    getTickets();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpenPopover({});
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef]);

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
    if (value) {
      const filtered = tickets.filter((ticket) =>
        ticket.full_name.toLowerCase().includes(value.toLowerCase()) ||
        ticket.email.toLowerCase().includes(value.toLowerCase()) ||
        ticket.section.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTickets(filtered);
    } else {
      setFilteredTickets(tickets);
    }
  };

  const handleEdit = (ticket) => {
    navigate(`/dashboard/ticket/edit/${ticket.id}`);
  };

  const openDeleteModal = (ticket) => {
    if (userRole === 'principal') {
      setTicketToDelete(ticket); // Corrected variable name
      setShowDeleteModal(true); // Updated function name
    } else {
      setShowNoAccessModal(true); // Updated function name
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteTicket(ticketToDelete.id);
      setTickets(tickets.filter((ticket) => ticket.id !== ticketToDelete.id));
      setFilteredTickets(filteredTickets.filter((ticket) => ticket.id !== ticketToDelete.id));
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const togglePopover = (id) => {
    setOpenPopover((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">Support Tickets</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
            aria-label="Search Tickets"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true" />
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium text-gray-700">Loading...</div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center text-gray-600 py-12">No tickets found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Ticket ID</th>
                <th className="px-6 py-3 text-left">Full Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Section</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="px-6 py-4 font-medium text-gray-800">{ticket.TicketID}</td>
                  <td className="px-6 py-4 text-gray-600">{ticket.full_name}</td>
                  <td className="px-6 py-4 text-gray-600">{ticket.email}</td>
                  <td className="px-6 py-4 text-gray-600">{ticket.phone_number}</td>
                  <td className="px-6 py-4 text-gray-600">{ticket.section}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-500 text-white px-3 py-1 inline-block text-xs rounded-full font-semibold">
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end">
                    <button
                      className="text-gray-600 hover:text-gray-900"
                      onClick={() => togglePopover(ticket.id)}
                      aria-label="Open Actions Menu"
                    >
                      <FaEllipsisH />
                    </button>

                    {openPopover[ticket.id] && (
                      <div
                        ref={popoverRef}
                        className="absolute bg-white shadow-lg border border-gray-200 rounded-lg text-left z-10 mt-2 p-2"
                      >
                        <button
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-40 rounded-md transition duration-150 ease-in-out"
                          onClick={() => handleEdit(ticket)}
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </button>
                        <button
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-200 w-40 rounded-md transition duration-150 ease-in-out"
                          onClick={() => openDeleteModal(ticket)} // Fixed function call
                        >
                          <FaTrashAlt className="mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmationModal
    showModal={showDeleteModal} // Updated to match the prop name in ConfirmationModal
    onClose={() => setShowDeleteModal(false)}
    onConfirm={confirmDelete}
    message="Are you sure you want to delete this ticket?" // Optional message prop
/>

      <NoAccessModal isOpen={showNoAccessModal} onClose={() => setShowNoAccessModal(false)} />
    </div>
  );
};

export default TicketsList;
