// HustlesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Briefcase, PlusCircle, Trash2, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HustlesPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [hustles, setHustles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHustles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/hustles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add debugging and better validation
      console.log('API response:', response.data);
      
      // Ensure we always set an array
      const hustlesData = response.data;
      if (Array.isArray(hustlesData)) {
        setHustles(hustlesData);
      } else if (hustlesData && Array.isArray(hustlesData.hustles)) {
        // In case the API returns { hustles: [...] }
        setHustles(hustlesData.hustles);
      } else if (hustlesData && Array.isArray(hustlesData.data)) {
        // In case the API returns { data: [...] }
        setHustles(hustlesData.data);
      } else {
        console.warn('API response is not an array:', hustlesData);
        setHustles([]);
      }
    } catch (err) {
      console.error('Fetch hustles error:', err);
      toast.error(err.response?.data?.error || 'Failed to fetch hustles');
      setHustles([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const deleteHustle = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/hustles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHustles(prev => prev.filter(h => h.id !== id));
      toast.success('Hustle deleted successfully!');
    } catch (err) {
      console.error('Delete hustle error:', err);
      toast.error(err.response?.data?.error || 'Failed to delete hustle');
    }
  };

  useEffect(() => {
    if (token) fetchHustles();
  }, [token]);

  // Add a safety check before rendering
  const hustlesList = Array.isArray(hustles) ? hustles : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Hustles</h2>
        <button
          onClick={() => navigate('/hustles/new')}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Hustle
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : hustlesList.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
          {hustlesList.map(hustle => (
            <div 
              key={hustle.id} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/hustles/${hustle.id}`, { state: { hustle } })}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{hustle.title}</h3>
                  <p className="text-gray-600 mt-1">{hustle.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHustle(hustle.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  {hustle.type}
                </span>
                <ArrowRight className="text-gray-400" size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HustlesPage;