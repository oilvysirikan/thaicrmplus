import React, { useState, useEffect } from 'react';
import { Survey } from '../types';
import { fetchSurveys } from '../api';
import ClipboardListIcon from './icons/ClipboardListIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import SearchIcon from './icons/SearchIcon';

const Surveys: React.FC = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        const data = await fetchSurveys();
        setSurveys(data);
      } catch (error) {
        console.error("Failed to fetch surveys", error);
      } finally {
        setLoading(false);
      }
    };
    loadSurveys();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Surveys</h1>
          <p className="text-gray-500 mt-1">Create and manage chat-based questionnaires for your customers.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-700 transition-colors shadow-sm">
          <PlusCircleIcon />
          <span>Create Survey</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </span>
            <input 
              type="text" 
              placeholder="Search surveys..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Loading surveys...</p>
          </div>
        ) : surveys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {surveys.map((survey) => (
              <div key={survey.id} className="group bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ClipboardListIcon />
                  </div>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    {survey.responseCount} Responses
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{survey.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{survey.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs text-gray-400">
                  <span>{survey.questions.length} Questions</span>
                  <span>Created {survey.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ClipboardListIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No surveys yet</h3>
            <p className="text-gray-500 mt-1">Start by creating your first customer feedback survey.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Surveys;
