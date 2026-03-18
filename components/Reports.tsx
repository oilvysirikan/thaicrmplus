import React, { useState, useEffect } from 'react';
import { DailyReportRow } from '../types';
import { fetchDailyReportData, fetchDashboardMetrics } from '../api';
import ClipboardCopyIcon from './icons/ClipboardCopyIcon';
import UserGroupIcon from './icons/UserGroupIcon';

const getConversionRateClass = (rate: number) => {
  if (rate > 15) return 'text-green-600 font-semibold';
  if (rate > 5) return 'text-yellow-600';
  return 'text-red-600';
};

const TableRowSkeleton: React.FC = () => (
    <tr className="bg-white animate-pulse">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-4/5"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/5"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/5"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/5"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/5"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-4/5"></div></td>
    </tr>
);

const Reports: React.FC = () => {
    const [reportData, setReportData] = useState<DailyReportRow[]>([]);
    const [userMetrics, setUserMetrics] = useState<{ total: number, change: number } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadReportData = async () => {
            try {
                setLoading(true);
                const [data, metrics] = await Promise.all([
                    fetchDailyReportData(),
                    fetchDashboardMetrics(),
                ]);
                setReportData(data);
                setUserMetrics(metrics.linkedUsers);
                setError(null);
            } catch (err) {
                setError('Failed to fetch report data. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadReportData();
    }, []);
    
    const copyDataToClipboard = () => {
        const header = "Automation Type\tDeliveries\tConversions\tConversion Rate (%)\tError Rate (%)\tSales\n";
        const rows = reportData.map(row => {
            const conversionRate = row.deliveries > 0 ? ((row.conversions / row.deliveries) * 100).toFixed(2) : "0.00";
            return `${row.automationType}\t${row.deliveries}\t${row.conversions}\t${conversionRate}\t${row.errorRate.toFixed(2)}\t${row.sales.toFixed(2)} ${row.currency}`;
        }).join("\n");

        navigator.clipboard.writeText(header + rows)
            .then(() => {
                // You would typically use a toast notification here
                alert("Report data copied to clipboard!");
            })
            .catch(err => {
                console.error("Failed to copy data: ", err);
                alert("Failed to copy data.");
            });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Daily Report</h2>
                <button 
                    onClick={copyDataToClipboard}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center"
                >
                    <ClipboardCopyIcon />
                    <span className="ml-2">Copy Data for Spreadsheet</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-gray-500 font-medium">Daily User Linkage</h4>
                    {loading || !userMetrics ? <div className="h-8 mt-2 bg-gray-200 rounded-md animate-pulse w-1/2"></div> :
                     <p className={`text-3xl font-bold mt-2 ${userMetrics.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {userMetrics.change >= 0 ? '+' : ''}{userMetrics.change.toLocaleString()}
                     </p>
                    }
                    <p className="text-sm text-gray-400 mt-1">Change from yesterday</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-gray-500 font-medium">Total Linked Users</h4>
                     {loading || !userMetrics ? <div className="h-8 mt-2 bg-gray-200 rounded-md animate-pulse w-1/2"></div> :
                        <p className="text-3xl font-bold text-gray-800 mt-2">{userMetrics.total.toLocaleString()}</p>
                     }
                    <p className="text-sm text-gray-400 mt-1">Cumulative total</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Automation Type</th>
                                <th scope="col" className="px-6 py-3 text-right">Deliveries</th>
                                <th scope="col" className="px-6 py-3 text-right">Conversions</th>
                                <th scope="col" className="px-6 py-3 text-right">Conv. Rate</th>
                                <th scope="col" className="px-6 py-3 text-right">Error Rate</th>
                                <th scope="col" className="px-6 py-3 text-right">Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(4)].map((_, i) => <TableRowSkeleton key={i} />)
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-red-500 font-semibold">
                                        {error}
                                    </td>
                                </tr>
                            ) : (
                                reportData.map((row) => {
                                    const conversionRate = row.deliveries > 0 ? (row.conversions / row.deliveries) * 100 : 0;
                                    return (
                                        <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{row.automationType}</td>
                                            <td className="px-6 py-4 text-right">{row.deliveries.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right">{row.conversions.toLocaleString()}</td>
                                            <td className={`px-6 py-4 text-right ${getConversionRateClass(conversionRate)}`}>{conversionRate.toFixed(2)}%</td>
                                            <td className={`px-6 py-4 text-right ${row.errorRate > 1 ? 'text-red-500' : 'text-gray-500'}`}>{row.errorRate.toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right font-semibold text-gray-800">{row.sales.toLocaleString('en-US', { style: 'currency', currency: 'THB', minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;