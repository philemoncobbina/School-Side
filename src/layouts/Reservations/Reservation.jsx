import React, { useEffect, useState, useRef } from 'react';
import { FaEdit, FaTrashAlt, FaSearch, FaEllipsisH } from 'react-icons/fa';
import UserService from '../../Services/UserService';
import { fetchBookings, fetchReservationLogs, deleteBooking } from '../../Services/BookingService';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import NoAccessModal from './NoAccessModal';
import { useNavigate } from 'react-router-dom';

const Reservation = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNoAccessModalOpen, setIsNoAccessModalOpen] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [openPopover, setOpenPopover] = useState({}); // Store open state for each booking

  const popoverRef = useRef(null); // Reference for the popover menu
  const navigate = useNavigate();

  const getUserRole = async () => {
    try {
      const userDetails = await UserService.getUserDetails();
      setUserRole(userDetails.role);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getBookings = async () => {
    try {
      const data = await fetchBookings();
      const bookingsWithLogs = await Promise.all(
        data.map(async (booking) => {
          const logs = await fetchReservationLogs(booking.id);
          return { ...booking, logs };
        })
      );
      setBookings(bookingsWithLogs);
      setFilteredBookings(bookingsWithLogs);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getUserRole();
    getBookings().finally(() => setIsLoading(false));
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
      const filtered = bookings.filter((booking) =>
        booking.full_name.toLowerCase().includes(value.toLowerCase()) ||
        booking.email.toLowerCase().includes(value.toLowerCase()) ||
        booking.department.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBookings(filtered);
    } else {
      setFilteredBookings(bookings);
    }
  };

  const handleEditBooking = (booking) => {
    navigate(`/dashboard/reservations/edit/${booking.id}`);
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await deleteBooking(bookingId);
      getBookings(); // Refresh the list after deletion
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const openDeleteModal = (booking) => {
    if (userRole === 'principal') {
      setSelectedBooking(booking);
      setIsDeleteModalOpen(true);
    } else {
      setIsNoAccessModalOpen(true);
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedBooking(null);
  };

  const closeNoAccessModal = () => {
    setIsNoAccessModalOpen(false);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500 text-white';
      case 'Confirmed':
        return 'bg-green-500 text-white';
      case 'Cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">Reservations</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
            aria-label="Search Bookings"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true" />
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg font-medium text-gray-700">Loading...</div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center text-gray-600 py-12">No bookings found.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <th className="px-6 py-3 text-left">Full Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Booking Date</th>
                <th className="px-6 py-3 text-left">Department</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Updated by</th>
                <th className="px-6 py-3 text-left">Updated Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                const latestLog = booking.logs.length > 0 ? booking.logs[booking.logs.length - 1] : null;
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="px-6 py-4 font-medium text-gray-800">{booking.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{booking.email}</td>
                    <td className="px-6 py-4 text-gray-600">{booking.phone}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{booking.department}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-block text-xs rounded-full font-semibold ${getStatusStyles(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {latestLog ? latestLog.user_email : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {latestLog ? new Date(latestLog.timestamp).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end">
                      <button
                        className="text-gray-600 hover:text-gray-900"
                        onClick={() => togglePopover(booking.id)}
                        aria-label="Open Actions Menu"
                      >
                        <FaEllipsisH />
                      </button>

                      {openPopover[booking.id] && (
                        <div
                          ref={popoverRef}
                          className="absolute bg-white shadow-lg border border-gray-200 rounded-lg text-left z-10 mt-2 p-2"
                        >
                          <button
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-40 rounded-md transition duration-150 ease-in-out"
                            onClick={() => handleEditBooking(booking)}
                          >
                            <FaEdit className="mr-2" />
                            Edit
                          </button>
                          <button
                            className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-200 w-40 rounded-md transition duration-150 ease-in-out"
                            onClick={() => openDeleteModal(booking)}
                          >
                            <FaTrashAlt className="mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteBooking(selectedBooking.id)}
      />
      <NoAccessModal isOpen={isNoAccessModalOpen} onClose={closeNoAccessModal} />
    </div>
  );
};

export default Reservation;
