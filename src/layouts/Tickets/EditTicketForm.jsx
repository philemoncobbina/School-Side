import React, { useState, useEffect } from 'react';
import { fetchTickets, deleteTicket, editTicket, fetchTicketLogs } from '../../Services/TicketService';
import { useParams, useNavigate } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal'; // Import ConfirmationModal
import NoAccessModal from './NoAccessModal'; // Import NoAccessModal
import UserService from '../../Services/UserService';
import { FaArrowLeft } from 'react-icons/fa';


const EditTicketForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        section: '',
        severity: '',
        description: '',
        status: 'unattended',
    });
    const [existingScreenshot, setExistingScreenshot] = useState(null);
    const [error, setError] = useState(null);
    const [ticketLogs, setTicketLogs] = useState([]);
    const [userRole, setUserRole] = useState(''); // State to track user role
    const [showConfirmationModal, setShowConfirmationModal] = useState(false); // Modal state for confirmation
    const [showNoAccessModal, setShowNoAccessModal] = useState(false); // Modal state for no access
    const [ticketToDelete, setTicketToDelete] = useState(null); // Track which ticket to delete

    useEffect(() => {
        const loadTicket = async () => {
            try {
                const fetchedTickets = await fetchTickets();
                const ticketData = fetchedTickets.find(ticket => ticket.id.toString() === id.toString());
                
                if (ticketData) {
                    setTicket(ticketData);
                    setFormData(ticketData);
                    setExistingScreenshot(ticketData.screenshot);
                } else {
                    setError('Ticket not found');
                }
            } catch (err) {
                setError('Error fetching ticket data');
                console.error(err);
            }
        };

        const loadTicketLogs = async () => {
            try {
                const logs = await fetchTicketLogs(id);
                setTicketLogs(logs);
            } catch (err) {
                console.error('Error fetching ticket logs:', err);
            }
        };

        const getUserRole = async () => {
            try {
                const userDetails = await UserService.getUserDetails();
                setUserRole(userDetails.role); // Set the user's role
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        loadTicket();
        loadTicketLogs();
        getUserRole(); // Fetch the user role
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
        const formDataToSubmit = new FormData();

        // Append all form fields to FormData, except the screenshot
        Object.keys(formData).forEach((key) => {
            if (key !== 'screenshot') {  // Ensure the screenshot is not added to formData
                formDataToSubmit.append(key, formData[key]);
            }
        });

        // Call the editTicket function with the updated FormData
        const updatedTicket = await editTicket(id, formDataToSubmit);
        alert('Ticket updated successfully!');
        navigate('/dashboard/tickets');
    } catch (err) {
        console.error('Error updating ticket:', err);
        setError('Error updating ticket');
    }
};




    const openDeleteModal = () => {
        if (userRole === 'principal') {
            setShowConfirmationModal(true); // Show confirmation modal if the user is a principal
        } else {
            setShowNoAccessModal(true); // Show no access modal if the user is not a principal
        }
    };

    const confirmDelete = async () => {
        try {
            await deleteTicket(id);
            alert('Ticket deleted successfully');
            navigate('/tickets');
        } catch (err) {
            console.error('Error deleting ticket:', err);
            setError('Error deleting ticket');
        } finally {
            setShowConfirmationModal(false); // Close modal after deletion
        }
    };

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    if (!ticket) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between mb-6">
        <button
          className="text-blue-500 flex items-center space-x-2 hover:text-blue-700 transition duration-200"
          onClick={() => navigate('/dashboard/tickets')}
        >
          <FaArrowLeft />
          <span className="text-lg font-medium">Back to Reservations</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Edit Reservation</h1>
      </div>
            <form onSubmit={handleFormSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-6">
                {/* Form Fields */}
                <div>
                    <label className="block font-medium mb-1">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Phone Number</label>
                    <input
                        type="text"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Section</label>
                    <select name="section" value={formData.section} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md">
    <option value="authentication">Authentication</option>
    <option value="reservation">Reservation Booking</option>
    <option value="admissions">Admissions</option>
    <option value="others">Others</option>
</select>

                </div>
                <div>
                    <label className="block font-medium mb-1">Severity</label>
                    <select
                        name="severity"
                        value={formData.severity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
    <option value="critical">Critical</option>
                    </select>
                </div>
                <div>
                    <label className="block font-medium mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows="4"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="unattended">Unattended</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>

                {/* Display the existing screenshot */}
                {existingScreenshot && (
                    <div>
                        <label className="block font-medium mb-1">Current Screenshot</label>
                        <img
                            src={existingScreenshot}
                            alt="Screenshot"
                            className="w-full max-w-sm border border-gray-300 rounded-md"
                        />
                    </div>
                )}
                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    >
                        Update Ticket
                    </button>
                    <button
                        type="button"
                        onClick={openDeleteModal}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                    >
                        Delete Ticket
                    </button>
                </div>
            </form>

            {/* Ticket Logs */}
            {/* Display the Ticket Logs in a Table */}
            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Ticket Logs</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">User</th>
                                <th className="px-4 py-2 text-left">Changed fields</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ticketLogs.length > 0 ? (
    ticketLogs.map((log, index) => (
        <tr key={index} className="border-t">
            <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
            <td className="px-4 py-2">{log.user_email}</td>
            <td className="px-4 py-2">{log.changed_fields}</td>
        </tr>
    ))
) : (
    <tr>
        <td className="px-4 py-2 text-center" colSpan="3">
            No logs found
        </td>
    </tr>
)}

                        </tbody>
                    </table>
                </div>
            </div>
  

            {/* Modals */}
            {showConfirmationModal && (
                <ConfirmationModal
                    showModal={showConfirmationModal}
                    onConfirm={confirmDelete}
                    onClose={() => setShowConfirmationModal(false)}
                    message="Are you sure you want to delete this ticket?"
                />
            )}

            {showNoAccessModal && (
                <NoAccessModal isOpen={showNoAccessModal} onClose={() => setShowNoAccessModal(false)} />
            )}
        </div>
    );
};

export default EditTicketForm;
