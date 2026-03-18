import React, { useState, useEffect } from 'react';
import { InterestInsight } from '../types';
import { fetchInterestInsights } from '../api';
import LightBulbIcon from './icons/LightBulbIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';

const Insights: React.FC = () => {
  const [insights, setInsights] = useState<InterestInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const data = await fetchInterestInsights();
        setInsights(data);
      } catch (error) {
        console.error("Failed to fetch insights", error);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customer Insights</h1>
        <p className="text-gray-500 mt-1">Analyze customer interests and behavior to optimize your marketing strategies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interest Categories */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Top Interest Categories</h2>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <LightBulbIcon />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Analyzing data...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {insights.map((insight) => (
                <div key={insight.id} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700">{insight.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-indigo-600">{insight.score}%</span>
                      {insight.trend === 'up' && <span className="text-green-500 text-xs font-bold">↑</span>}
                      {insight.trend === 'down' && <span className="text-red-500 text-xs font-bold">↓</span>}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out group-hover:bg-indigo-500" 
                      style={{ width: `${insight.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Behavior Analysis */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Behavioral Trends</h2>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <TrendingUpIcon />
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Peak Engagement Time</h3>
              <p className="text-2xl font-bold text-indigo-600">19:00 - 21:00</p>
              <p className="text-xs text-gray-400 mt-1">Most customers are active during these hours.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Top Conversion Channel</h3>
              <p className="text-2xl font-bold text-indigo-600">LINE Broadcast</p>
              <p className="text-xs text-gray-400 mt-1">Broadcast messages have the highest ROI.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Avg. Response Time</h3>
              <p className="text-2xl font-bold text-indigo-600">2.4 Minutes</p>
              <p className="text-xs text-gray-400 mt-1">Your chatbot handles 85% of queries instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
