// EditUserModal.js
import React from 'react';

const EditUserModal = ({ formData, setFormData, handleSaveUser, setEditMode }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
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
                        className="w-full p-2 border border-gray-300 rounded"
                    />
                </div>
                {formData.role && (
                    <div className="mb-4">
                        <label className="block text-gray-700">Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded"
                        >
                            <option value="">No Role</option>
                            <option value="staff">Staff</option>
                            <option value="principal">Principal</option>
                        </select>
                    </div>
                )}
                <div className="flex space-x-4">
                    <button
                        onClick={handleSaveUser}
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                    >
                        Save
                    </button>
                    <button
                        onClick={() => setEditMode(false)}
                        className="bg-gray-500 text-white py-2 px-4 rounded"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditUserModal;
