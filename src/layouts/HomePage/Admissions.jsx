import React from 'react';

const Admissions = () => (
  <section>
    <h2 className="text-2xl font-bold mb-4">Admissions</h2>
    <table className="min-w-full bg-white rounded shadow-md">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Applicant Name</th>
          <th className="py-2 px-4 border-b">Application Date</th>
          <th className="py-2 px-4 border-b">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-2 px-4 border-b">Alex Smith</td>
          <td className="py-2 px-4 border-b">2024-09-08</td>
          <td className="py-2 px-4 border-b">Accepted</td>
        </tr>
        {/* Add more rows */}
      </tbody>
    </table>
  </section>
);

export default Admissions;
