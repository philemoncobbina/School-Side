import React from 'react';

const SubscriptionForms = () => (
  <section>
    <h2 className="text-2xl font-bold mb-4">Subscription Forms</h2>
    <table className="min-w-full bg-white rounded shadow-md">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Subscriber Name</th>
          <th className="py-2 px-4 border-b">Email</th>
          <th className="py-2 px-4 border-b">Subscription Type</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-2 px-4 border-b">Jane Doe</td>
          <td className="py-2 px-4 border-b">jane@example.com</td>
          <td className="py-2 px-4 border-b">Premium</td>
        </tr>
        {/* Add more rows */}
      </tbody>
    </table>
  </section>
);

export default SubscriptionForms;
