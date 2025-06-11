import React from 'react';
import HustleCard from './HustleCard';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HustleList = ({ hustles }) => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Hustles</h2>
        <button
          onClick={() => navigate('/hustles/new')}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Hustle
        </button>
      </div>

      {hustles.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <p className="text-gray-600 mb-4">You don't have any hustles yet.</p>
          <button
            onClick={() => navigate('/hustles/new')}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          >
            Start Your First Hustle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hustles.map(hustle => (
            <HustleCard 
              key={hustle.id} 
              hustle={hustle} 
              onClick={() => navigate(`/hustles/${hustle.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HustleList;