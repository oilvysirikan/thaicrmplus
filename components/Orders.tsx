import React, { useState, useMemo, useEffect } from 'react';
import { Order } from '../types';
import ChevronRightIcon from './icons/ChevronRightIcon';
import SearchIcon from './icons/SearchIcon';
import XCircleIcon from './icons/XCircleIcon';
import TruckIcon from './icons/TruckIcon';
import ChatBubbleIcon from './icons/ChatBubbleIcon';
import OrderDetailModal from './OrderDetailModal';
import { fetchOrders, createShipmentForOrder, sendOrderNotification } from '../api';

const getStatusChipClass = (status: Order['status']) => {
  switch (status) {
    case 'Shipped':
    case 'Fulfilled':
      return 'bg-green-100 text-green-800';
    case 'Awaiting Payment':
      return 'bg-yellow-100 text-yellow-800';
    case 'Pending':
      return 'bg-blue-100 text-blue-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const TableRowSkeleton: React.FC = () => (
  <tr className="bg-white animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-28"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
    <td className="px-6 py-4 text-right"><div className="h-5 w-5 bg-gray-200 rounded-full inline-block"></div></td>
  </tr>
);

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'All'>('All');

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const data = await fetchOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch orders. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);
  
  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleSelectOrder = (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    e.stopPropagation();
    if (e.target.checked) {
      setSelectedOrderIds(prev => [...prev, orderId]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleBulkMarkAsShipped = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const results = await Promise.all(selectedOrderIds.map(id => createShipmentForOrder(id)));
      
      setOrders(prevOrders => {
        const newOrders = [...prevOrders];
        results.forEach(updatedOrder => {
          const index = newOrders.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) newOrders[index] = updatedOrder;
        });
        return newOrders;
      });
      
      setSelectedOrderIds([]);
      alert(`Successfully processed ${results.length} orders.`);
    } catch (err) {
      console.error("Bulk processing failed:", err);
      alert("Failed to process some orders. Please check logs.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkSendNotification = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      const results = await Promise.all(selectedOrderIds.map(id => sendOrderNotification(id)));
      
      setOrders(prevOrders => {
        const newOrders = [...prevOrders];
        results.forEach(updatedOrder => {
          const index = newOrders.findIndex(o => o.id === updatedOrder.id);
          if (index !== -1) newOrders[index] = updatedOrder;
        });
        return newOrders;
      });
      
      setSelectedOrderIds([]);
      alert(`Successfully sent notifications for ${results.length} orders.`);
    } catch (err) {
      console.error("Bulk notification failed:", err);
      alert("Failed to send some notifications. Please check logs.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        if (statusFilter === 'All') return true;
        return order.status === statusFilter;
      })
      .filter(order => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return (
          order.externalOrderId.toLowerCase().includes(term) ||
          order.customerName.toLowerCase().includes(term) ||
          (order.trackingNumber && order.trackingNumber.toLowerCase().includes(term))
        );
      });
  }, [orders, searchTerm, statusFilter]);

  const orderStatuses: (Order['status'] | 'All')[] = ['All', 'Pending', 'Awaiting Payment', 'Shipped', 'Fulfilled', 'Cancelled'];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Order History</h2>

      {/* Bulk Actions Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-indigo-900 text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center space-x-6 animate-bounce-in">
          <span className="font-semibold">{selectedOrderIds.length} orders selected</span>
          <div className="h-6 w-px bg-indigo-700"></div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBulkMarkAsShipped}
              disabled={isBulkProcessing}
              className="flex items-center space-x-2 hover:text-indigo-200 transition-colors disabled:opacity-50"
            >
              {isBulkProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <TruckIcon />
              )}
              <span>Mark as Shipped</span>
            </button>
            <button 
              onClick={handleBulkSendNotification}
              disabled={isBulkProcessing}
              className="flex items-center space-x-2 hover:text-indigo-200 transition-colors disabled:opacity-50"
            >
              {isBulkProcessing ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <ChatBubbleIcon />
              )}
              <span>Send Notification</span>
            </button>
          </div>
          <button 
            onClick={() => setSelectedOrderIds([])}
            className="ml-4 text-indigo-300 hover:text-white"
          >
            <XCircleIcon />
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              id="search-orders"
              type="text"
              placeholder="Search by Order ID, Customer, or Tracking #"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <XCircleIcon />
              </button>
            )}
          </div>
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by Status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as Order['status'] | 'All')}
              className="w-full h-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {orderStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={filteredOrders.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-3">Order ID</th>
                <th scope="col" className="px-6 py-3">Customer</th>
                <th scope="col" className="px-6 py-3">Date</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Tracking #</th>
                <th scope="col" className="px-6 py-3">Notification</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(7)].map((_, i) => <TableRowSkeleton key={i} />)
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-red-500 font-semibold">
                    {error}
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`bg-white border-b hover:bg-gray-50 cursor-pointer ${selectedOrderIds.includes(order.id) ? 'bg-indigo-50' : ''}`} onClick={() => handleOrderClick(order.id)}>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={(e) => handleSelectOrder(e, order.id)}
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{order.externalOrderId}</td>
                    <td className="px-6 py-4">{order.customerName}</td>
                    <td className="px-6 py-4">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusChipClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{order.trackingNumber || 'N/A'}</td>
                    <td className="px-6 py-4">{order.notificationStatus}</td>
                     <td className="px-6 py-4 text-right">
                      <button className="font-medium text-indigo-600 hover:text-indigo-800" aria-label={`View details for order ${order.externalOrderId}`}>
                        <ChevronRightIcon />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No orders match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Order Detail Modal */}
      {isModalOpen && selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onOrderUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
};

export default Orders;
