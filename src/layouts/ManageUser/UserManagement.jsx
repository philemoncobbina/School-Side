import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaEllipsisH } from 'react-icons/fa';
import { fetchAllUsers, blockUser, unblockUser, editUser, deleteUser, activateUser } from '../../Services/AdminUserService';
import EditUserModal from './EditUserModal';
import { format } from 'date-fns';
import studentAuthService from '../../Services/studentAuthService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        role: '',
        index_number: '',
        class_name: '',
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const popoverRef = useRef(null);
    const [openPopover, setOpenPopover] = useState({}); // Store open state for each user

    useEffect(() => {
        loadUsers();
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
    }, []);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const response = await fetchAllUsers();
            setUsers(response.data);
            setFilteredUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (event) => {
        const { value } = event.target;
        setSearchTerm(value);

        if (value) {
            const filtered = users.filter((user) =>
                `${user.first_name} ${user.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
                user.email.toLowerCase().includes(value.toLowerCase()) ||
                (user.role ? user.role.toLowerCase().includes(value.toLowerCase()) : false)
            );
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers(users);
        }
    };

    const handleBlockUser = async (userId) => {
        try {
            await blockUser(userId);
            loadUsers();
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    };

    const handleUnblockUser = async (userId) => {
        try {
            await unblockUser(userId);
            loadUsers();
        } catch (error) {
            console.error('Error unblocking user:', error);
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            await activateUser(userId);
            loadUsers();
        } catch (error) {
            console.error('Error activating user:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteUser(userId);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        
        setFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role || '',
            index_number: user.index_number || '',
            class_name: user.class_name || '',
        });
        
        setEditMode(true);
    };

    const handleSaveUser = async () => {
        try {
            const dataToSubmit = { ...formData };
            if (!dataToSubmit.role) {
                delete dataToSubmit.role;
            }
            
            // Only include student fields if role is student
            if (dataToSubmit.role !== 'student') {
                delete dataToSubmit.index_number;
                delete dataToSubmit.class_name;
            }
            
            await editUser(selectedUser.id, dataToSubmit);
            setEditMode(false);
            loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const togglePopover = (id) => {
        setOpenPopover((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    
    const formatLastLogin = (dateString) => {
        if (!dateString) {
            return '';  // Return an empty string when there is no date
        }
        return format(new Date(dateString), 'MMMM d, yyyy, h:mm a');
    };

    return (
        <div className="p-6 bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 md:mb-0">User Management</h1>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                        aria-label="Search Users"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" aria-hidden="true" />
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg border border-gray-200">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-lg font-medium text-gray-700">Loading...</div>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center text-gray-600 py-12">No users found.</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-100">
                            <tr className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                <th className="px-6 py-3 text-left">Name</th>
                                <th className="px-6 py-3 text-left">Email</th>
                                <th className="px-6 py-3 text-left">Role</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Blocked</th>
                                <th className="px-6 py-3 text-left">Last LoggedIn</th>
                                <th className="px-6 py-3 text-left">DATE JOINED</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                    <td className="px-6 py-4">{`${user.first_name} ${user.last_name}`}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        {user.role || <span className="italic">Not Assigned</span>}
                                        {user.role === 'student' && user.class_name && (
                                            <span className="ml-2 text-xs text-gray-500">
                                                ({getClassLabel(user.class_name)})
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{renderStatusBadge(user)}</td>
                                    <td className="px-6 py-4">
                                        {user.is_blocked ? (
                                            <span className="bg-red-500 text-white px-2 py-1 rounded-full">Blocked</span>
                                        ) : (
                                            <span className="bg-green-500 text-white px-2 py-1 rounded-full">Not Blocked</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">{formatLastLogin(user.last_login)}</td> {/* Updated Last Login Format */}
                                    <td className="px-6 py-4">{formatLastLogin(user.date_joined)}</td>
                                    <td className="px-6 py-4 text-right flex justify-end">
                                        <button
                                            className="text-gray-600 hover:text-gray-900"
                                            onClick={() => togglePopover(user.id)}
                                            aria-label="Open Actions Menu"
                                        >
                                            <FaEllipsisH />
                                        </button>

                                        {openPopover[user.id] && (
                                            <div
                                                ref={popoverRef}
                                                className="absolute bg-white shadow-lg border border-gray-200 rounded-lg text-left z-10 mt-2 p-2"
                                            >
                                                {user.is_blocked ? (
                                                    <button
                                                        className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-200 w-40 rounded-md transition duration-150 ease-in-out"
                                                        onClick={() => handleUnblockUser(user.id)}
                                                    >
                                                        Unblock
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-200 w-40 rounded-md transition duration-150 ease-in-out"
                                                        onClick={() => handleBlockUser(user.id)}
                                                    >
                                                        Block
                                                    </button>
                                                )}
                                                {!user.is_active && !user.is_blocked && (
                                                    <button
                                                        className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-200 w-40 rounded-md transition duration-150 ease-in-out"
                                                        onClick={() => handleActivateUser(user.id)}
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                                <button
                                                    className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-200 w-40 rounded-md transition duration-150 ease-in-out"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-200 w-40 rounded-md transition duration-150 ease-in-out"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
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

            {editMode && (
                <EditUserModal
                    formData={formData}
                    setFormData={setFormData}
                    handleSaveUser={handleSaveUser}
                    setEditMode={setEditMode}
                />
            )}
            
        </div>
    );
};

// Helper function to get class label from class value
const getClassLabel = (classValue) => {
    const classOptions = studentAuthService.getClassOptions();
    const classOption = classOptions.find(option => option.value === classValue);
    return classOption ? classOption.label : classValue;
};

const renderStatusBadge = (user) => {
    if (user.is_active) {
        return <span className="bg-green-500 text-white px-2 py-1 rounded-full">Active</span>;
    } else {
        return <span className="bg-red-500 text-white px-2 py-1 rounded-full">Inactive</span>;
    }
};

export default UserManagement;