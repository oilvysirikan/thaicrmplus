import React, { useState, useEffect } from 'react';
import { CustomerProfile, Order } from '../types';
import { fetchOrders, fetchCustomerProfile } from '../api'; // You might need a new API function
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import StarIcon from './icons/StarIcon';

// Mock data for a single customer for preview purposes
const MOCK_CUSTOMER_ID = 'c1'; 

const tierProgress = {
    'Bronze': { current: 120, next: 500, nextTier: 'Silver' },
    'Silver': { current: 550, next: 1000, nextTier: 'Gold' },
    'Gold': { current: 1250, next: null, nextTier: null },
    'Standard': { current: 45, next: 100, nextTier: 'Bronze' }
};


const LiffMembershipPage: React.FC = () => {
    const [customer, setCustomer] = useState<CustomerProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // In a real LIFF app, you'd get the user's ID from the LIFF SDK.
                // Here, we'll fetch a mock user's data.
                const [customerData, allOrders] = await Promise.all([
                    // This function doesn't exist yet, we can add a simplified version to api.ts
                    // For now, let's assume it fetches the first customer.
                    // Or let's just create it.
                    fetchCustomerProfile(MOCK_CUSTOMER_ID),
                    fetchOrders() 
                ]);
                setCustomer(customerData);
                setOrders(allOrders.filter(o => o.customerId === customerData.id).slice(0, 3)); // Show recent 3 orders
            } catch (error) {
                console.error("Failed to load LIFF page data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if(loading) {
        return <div className="flex items-center justify-center h-full bg-gray-50 text-gray-500">Loading...</div>
    }
    
    if(!customer) {
        return <div className="flex items-center justify-center h-full bg-gray-50 text-red-500">Could not load customer data.</div>
    }

    const progressInfo = tierProgress[customer.tier];
    const progressPercent = progressInfo && progressInfo.next ? (progressInfo.current / progressInfo.next) * 100 : 100;

    return (
        <div className="w-full h-full bg-gray-100 font-sans overflow-y-auto">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                    <img src={customer.avatarUrl} alt={customer.name} className="w-16 h-16 rounded-full border-2 border-indigo-200" />
                    <div>
                        <p className="text-sm text-gray-500">Welcome back,</p>
                        <h1 className="text-xl font-bold text-gray-800">{customer.name}</h1>
                    </div>
                </div>
            </div>

            {/* Membership Card */}
            <div className="p-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm uppercase tracking-wider opacity-80">Membership Tier</p>
                            <p className="text-2xl font-bold">{customer.tier}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                            <StarIcon />
                            <span className="text-xl font-bold">{customer.points.toLocaleString()}</span>
                        </div>
                    </div>
                    {progressInfo && progressInfo.next && (
                        <div className="mt-6">
                             <div className="w-full bg-white/20 rounded-full h-2.5">
                                <div className="bg-white rounded-full h-2.5" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <p className="text-xs text-right mt-1 opacity-80">
                                {progressInfo.next - progressInfo.current} points to {progressInfo.nextTier}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order History */}
            <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Recent Orders</h2>
                <div className="space-y-3">
                    {orders.length > 0 ? orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800">{order.externalOrderId}</p>
                                <p className="text-sm text-gray-500">{order.date}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                order.status === 'Shipped' || order.status === 'Fulfilled' ? 'bg-green-100 text-green-800' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>{order.status}</span>
                        </div>
                    )) : (
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-500">
                            No recent orders.
                        </div>
                    )}
                </div>
                 <div className="text-center mt-4">
                    <a href="#" className="text-sm font-semibold text-indigo-600 hover:underline">View all orders</a>
                </div>
            </div>
        </div>
    );
};

export default LiffMembershipPage;
