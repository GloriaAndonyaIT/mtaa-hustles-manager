// HustleForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const HustleForm = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error('You need to log in to create a hustle');
      navigate('/login');
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Hustle name is required';
    if (!formData.type) newErrors.type = 'Business type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      toast.error('You must be logged in to create a hustle!');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(
        'http://127.0.0.1:5000/hustles', 
        formData,
        config
      );

      if (response.status === 201) {
        toast.success('Hustle created successfully!');
        
        const hustleId = response.data.hustle?.id || response.data.hustle_id;
        if (!hustleId) {
          throw new Error('Hustle ID not found in response');
        }

        // Navigate to the hustle details page with the new hustle data
        navigate(`/hustles/${hustleId}`, { 
          state: { 
            hustle: response.data.hustle || {
              id: hustleId,
              ...formData,
              status: 'active', // Add default status
              user_id: response.data.user_id
            },
            isNew: true 
          } 
        });
      }
      
    } catch (err) {
      console.error('Error creating hustle:', err);
      
      let errorMessage = 'Failed to create hustle. Please try again.';
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          logout();
          navigate('/login');
        } 
        else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
        
        if (err.response.status === 400 && err.response.data?.errors) {
          setErrors(err.response.data.errors);
          return;
        }
      } else if (err.message === 'Hustle ID not found in response') {
        errorMessage = 'Server response format unexpected. Please contact support.';
      }
      
      toast.error(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Hustle</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Hustle Name *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500`}
              placeholder="e.g. Clothing Business"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.type ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500`}
            >
              <option value="">Select business type</option>
              <option value="Retail">Retail</option>
              <option value="Service">Service</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g. Nairobi, Kenya"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500`}
              placeholder="Describe your hustle..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/hustles')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </span>
            ) : 'Save Hustle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HustleForm;