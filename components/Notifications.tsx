import React, { useState, useEffect } from 'react';
import { Notification } from '../types';
import { fetchNotifications } from '../api';

const getStatusChipClass = (status: Notification['status']) => {
  switch (status) {
    case 'Sent':
      return 'bg-green-100 text-green-800';
    case 'Failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTypeChipClass = (type: Notification['type']) => {
  switch (type) {
    case 'Order Confirmation':
      return 'bg-blue-100 text-blue-800';
    case 'Shipping Update':
      return 'bg-purple-100 text-purple-800';
    case 'Payment Reminder':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TableRowSkeleton: React.FC = () => (
    <tr className="bg-white animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-36"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-16"></div></td>
    </tr>
);

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                setLoading(true);
                const data = await fetchNotifications();
                setNotifications(data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch notifications. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadNotifications();
    }, []);


    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Notification Log</h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Order ID</th>
                                <th scope="col" className="px-6 py-3">Recipient (LINE ID)</th>
                                <th scope="col" className="px-6 py-3">Message Type</th>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(7)].map((_, i) => <TableRowSkeleton key={i} />)
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-red-500 font-semibold">
                                        {error}
                                    </td>
                                </tr>
                            ) : (
                                notifications.map((notification) => (
                                    <tr key={notification.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{notification.orderId}</td>
                                        <td className="px-6 py-4 font-mono">{notification.recipient}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeChipClass(notification.type)}`}>
                                                {notification.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{notification.timestamp}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusChipClass(notification.status)}`}>
                                                {notification.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
