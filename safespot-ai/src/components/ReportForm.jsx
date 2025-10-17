import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import CameraCapture from './CameraCapture';
import { getLocationWithAddress } from '../services/locationService';

const ReportForm = ({ onReportSubmitted, user }) => {
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    category: '',
    urgency: 'medium',
    reporterName: user?.displayName || '',
    coordinates: null
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const categories = [
    { 
      id: 'lighting', 
      label: 'Street Lighting',
      color: 'from-yellow-400 to-orange-500'
    },
    { 
      id: 'vandalism', 
      label: 'Vandalism',
      color: 'from-red-400 to-pink-500'
    },
    { 
      id: 'noise', 
      label: 'Noise',
      color: 'from-purple-400 to-indigo-500'
    },
    { 
      id: 'waste', 
      label: 'Waste & Litter',
      color: 'from-green-400 to-emerald-500'
    },
    { 
      id: 'infrastructure', 
      label: 'Infrastructure',
      color: 'from-orange-400 to-red-500'
    },
    { 
      id: 'other', 
      label: 'Other',
      color: 'from-blue-400 to-cyan-500'
    }
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Low', color: 'from-green-400 to-emerald-500', icon: '●' },
    { id: 'medium', label: 'Medium', color: 'from-yellow-400 to-orange-500', icon: '●●' },
    { id: 'high', label: 'High', color: 'from-orange-500 to-red-500', icon: '●●●' },
    { id: 'critical', label: 'Critical', color: 'from-red-600 to-pink-600', icon: '●●●●' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleCameraCapture = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setShowCamera(false);
    setError('');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Please describe the issue');
      return;
    }
    if (!formData.location.trim()) {
      setError('Please provide a location');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const imageRef = ref(storage, `reports/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const reportData = {
        description: formData.description.trim(),
        location: formData.location.trim(),
        category: formData.category,
        urgency: formData.urgency,
        reporterName: formData.reporterName.trim() || user?.displayName || 'Anonymous',
        reporterEmail: user?.email || 'anonymous',
        reporterId: user?.uid || 'anonymous',
        timestamp: serverTimestamp(),
        status: 'pending',
        votes: 0,
        imageUrl: imageUrl
      };

      await addDoc(collection(db, 'reports'), reportData);

      setFormData({
        description: '',
        location: '',
        category: '',
        urgency: 'medium',
        reporterName: user?.displayName || ''
      });
      setImageFile(null);
      setImagePreview(null);

      if (onReportSubmitted) {
        onReportSubmitted();
      }

    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="backdrop-blur-xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            Report an Issue
          </h2>
          <p className="text-gray-600 font-medium">
            Help make your community safer
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-xl p-4 animate-shake">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="text-red-800 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Issue Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${
                    formData.category === cat.id
                      ? 'border-transparent shadow-xl scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
                >
                  {formData.category === cat.id && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color}`}></div>
                  )}
                  <div className={`relative z-10 text-center ${
                    formData.category === cat.id ? 'text-white' : 'text-gray-700'
                  }`}>
                    <span className="font-bold text-base">{cat.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Urgency Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {urgencyLevels.map(level => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: level.id })}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                    formData.urgency === level.id
                      ? 'border-transparent shadow-xl scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
                >
                  {formData.urgency === level.id && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${level.color}`}></div>
                  )}
                  <div className={`relative z-10 text-center ${
                    formData.urgency === level.id ? 'text-white' : 'text-gray-700'
                  }`}>
                    <div className="text-lg mb-1">{level.icon}</div>
                    <span className="font-bold text-sm">{level.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you observed and why it needs attention"
              rows="4"
              className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-bold text-gray-900 mb-2">
              Location
            </label>
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Street address or intersection"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Add Photo (Optional)
            </label>
            
            {!imagePreview ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Take Photo Button */}
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all group"
                >
                  <svg className="w-12 h-12 mb-3 text-blue-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm font-bold text-blue-600">Take Photo</p>
                  <p className="text-xs text-gray-500 mt-1">Open camera</p>
                </button>

                {/* Upload File Button */}
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all group">
                  <svg className="w-12 h-12 mb-3 text-gray-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm font-bold text-gray-600">Upload File</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG (Max 5MB)</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Your Name */}
          <div>
            <label htmlFor="reporterName" className="block text-sm font-bold text-gray-900 mb-2">
              Your Name <span className="text-gray-400 font-normal text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              id="reporterName"
              name="reporterName"
              value={formData.reporterName}
              onChange={handleChange}
              placeholder={user?.displayName || "Your name"}
              className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-gray-900 placeholder-gray-400"
            />
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Signed in as <span className="font-semibold text-gray-700">{user?.email}</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting Report...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Submit Report</span>
              </div>
            )}
          </button>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              <div>
                <p className="text-sm font-bold text-yellow-800 mb-1">Emergency Alert</p>
                <p className="text-xs text-yellow-700">For life-threatening emergencies, call <strong>911</strong> immediately. SafeSpot is for non-emergency community issues only.</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ReportForm;