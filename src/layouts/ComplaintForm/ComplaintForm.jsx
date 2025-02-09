import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactService from '../../Services/ContactService';
import UserService from '../../Services/UserService';
import { FaTrashAlt, FaEdit, FaEllipsisH } from 'react-icons/fa';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import NoAccessModal from './NoAccessModal';

// Helper function for status styles
const getStatusStyles = (status) => {
    switch (status) {
      case 'in_progress':
        return 'bg-yellow-500 text-white';
      case 'resolved':
        return 'bg-green-500 text-white';
      case 'unattended':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
};

const ComplaintForm = () => {
    const [contacts, setContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [contactLogs, setContactLogs] = useState({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isNoAccessModalOpen, setIsNoAccessModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [userRole, setUserRole] = useState('');
    const [popoverOpen, setPopoverOpen] = useState(null);
    const popoverRef = useRef(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        fetchContacts();
        fetchUserRole();
    }, []);

    // Fetch contact list
    const fetchContacts = async () => {
        try {
            const data = await ContactService.getContacts();
            setContacts(data);
            setFilteredContacts(data);
            const logs = await Promise.all(data.map(async (contact) => ({
                id: contact.id,
                logs: await ContactService.getContactLogs(contact.id),
            })));
            const logsMap = logs.reduce((acc, { id, logs }) => {
                acc[id] = logs;
                return acc;
            }, {});
            setContactLogs(logsMap);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    // Fetch user role
    const fetchUserRole = async () => {
        try {
            const userDetails = await UserService.getUserDetails();
            setUserRole(userDetails.role);
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    };

    // Delete Modal
    const openDeleteModal = (contact) => {
        userRole === 'principal' ? setSelectedContact(contact) : setIsNoAccessModalOpen(true);
        setIsDeleteModalOpen(userRole === 'principal');
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedContact(null);
    };

    const closeNoAccessModal = () => setIsNoAccessModalOpen(false);

    // Handle Delete
    const handleDelete = async () => {
        try {
            await ContactService.deleteContact(selectedContact.id);
            const updatedContacts = contacts.filter(contact => contact.id !== selectedContact.id);
            setContacts(updatedContacts);
            setFilteredContacts(updatedContacts);
            closeDeleteModal();
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    // Handle search filter
    const handleSearch = (event) => {
        const value = event.target.value.toLowerCase();
        setSearchTerm(value);
        setFilteredContacts(value ? contacts.filter(contact => (
            contact.firstName.toLowerCase().includes(value) ||
            contact.lastName.toLowerCase().includes(value) ||
            contact.email.toLowerCase().includes(value)
        )) : contacts);
    };

    // Edit Modal
    const openEditModal = (contactId) => navigate(`/dashboard/complaints/edit/${contactId}`);

    // Popover toggle
    const togglePopover = (contactId) => {
        setPopoverOpen(popoverOpen === contactId ? null : contactId);
    };

    // Close popover if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setPopoverOpen(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="p-6 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">Complaint List</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                        aria-label="Search Complaints"
                    />
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                {filteredContacts.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">No complaints found.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-100">
    <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        {['First Name', 'Last Name', 'Email', 'Phone Number', 'Message', 'User Email', 'Timestamp', 'Status', 'Actions'].map(header => (
            <th key={header} className={`px-6 py-3 ${header === 'Actions' ? 'text-right' : 'text-left'}`}>
                {header}
            </th>
        ))}
    </tr>
</thead>
                        <tbody className="text-sm divide-y divide-gray-200">
                            {filteredContacts.map(contact => (
                                <tr key={contact.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4 text-gray-600">{contact.firstName}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.lastName}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.phoneNumber}</td>
                                    <td className="px-6 py-4 text-gray-600">{contact.message}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {contactLogs[contact.id]?.[0]?.user_email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {contactLogs[contact.id]?.[0]?.timestamp
                                            ? new Date(contactLogs[contact.id][0].timestamp).toLocaleDateString()
                                            : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 inline-block text-xs rounded-full font-semibold ${getStatusStyles(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>  
                                    <td className="px-6 py-4 text-right flex justify-end">
                                        <button
                                            className="text-gray-600 hover:text-gray-800"
                                            onClick={() => togglePopover(contact.id)}
                                            aria-label="More actions"
                                        >
                                            <FaEllipsisH />
                                        </button>

                                        {popoverOpen === contact.id && (
                                            <div
                                                ref={popoverRef}
                                                className="absolute bg-white shadow-lg border border-gray-200 rounded-lg text-left z-10 mt-2 p-2"
                                            >
                                                <button
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 w-40 rounded-md transition duration-150 ease-in-out"
                                                    onClick={() => openEditModal(contact.id)}
                                                >
                                                    <FaEdit className="mr-2" />
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-200 w-40 rounded-md transition duration-150 ease-in-out"
                                                    onClick={() => openDeleteModal(contact)}
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

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete} 
            />

            <NoAccessModal
                isOpen={isNoAccessModalOpen}
                onClose={closeNoAccessModal}
            />
        </div>
    );
};

export default ComplaintForm;
