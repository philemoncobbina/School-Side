import React, { useEffect, useState } from 'react';
import studentAuthService from '../../Services/studentAuthService';

const EditUserModal = ({ formData, setFormData, handleSaveUser, setEditMode }) => {
    const [classOptions, setClassOptions] = useState([]);

    useEffect(() => {
        // Load class options when component mounts
        const options = studentAuthService.getClassOptions();
        setClassOptions(options);
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                <div className="mb-4">
                    <label className="block text-gray-700">First Name</label>
                    <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Last Name</label>
                    <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                        disabled={true}
                    />
                </div>
                
                {/* Role display/selection */}
                {formData.role && (
                    <div className="mb-4">
                        <label className="block text-gray-700">Role</label>
                        {formData.role === 'student' ? (
                            <input
                                type="text"
                                value="Student"
                                className="w-full p-2 border border-gray-300 rounded bg-gray-100"
                                disabled={true}
                            />
                        ) : (
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                
                                <option value="staff">Staff</option>
                                <option value="principal">Principal</option>
                            </select>
                        )}
                    </div>
                )}

                {/* Student-specific fields */}
                {formData.role === 'student' && (
                    <>
                        <div className="mb-4">
                            <label className="block text-gray-700">Index Number</label>
                            <input
                                type="text"
                                value={formData.index_number || ''}
                                onChange={(e) => setFormData({ ...formData, index_number: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Class</label>
                            <select
                                value={formData.class_name || ''}
                                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="">Select Class</option>
                                {classOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                <div className="flex space-x-4">
                    <button
                        onClick={handleSaveUser}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-150"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setEditMode(false)}
                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition duration-150"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;