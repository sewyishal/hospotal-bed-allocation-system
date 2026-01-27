import React, { useState } from 'react';
import { UserPlus, CheckCircle } from 'lucide-react';
import { patientAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const Admission = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    severity: 1,
    requiredWard: 'GENERAL'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend expects: patientId, name, severity, requiredWard
      const payload = {
        patientId: `P-${Math.floor(Math.random() * 10000)}`, // Generate random ID
        name: formData.name,
        severity: parseInt(formData.severity),
        requiredWard: formData.requiredWard
      };

      const res = await patientAPI.register(payload);
      setResult(res.data);
      // Wait a bit and then redirect? Or just show success.
    } catch (error) {
       alert("Admission Failed: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const closeSuccess = () => {
    setResult(null);
    setFormData({ name: '', age: '', gender: 'Male', severity: 1, requiredWard: 'GENERAL' });
    navigate('/beds');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
          <UserPlus className="text-white" size={32} />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Patient Admission Portal</h2>
           <p className="text-gray-500">Register a new patient and allocate a bed immediately.</p>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-bold text-gray-900 mb-6 flex items-center">
             <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
             Personal Information
           </h3>
           
           <form onSubmit={handleSubmit} className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
               <input 
                 required
                 type="text" 
                 value={formData.name}
                 onChange={e => setFormData({...formData, name: e.target.value})}
                 placeholder="e.g. John Doe"
                 className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
             </div>

             <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input 
                    type="number" 
                    value={formData.age}
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    placeholder="e.g. 45"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
               </div>
             </div>

             <div className="pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                  Medical Details
                </h3>

                <div className="space-y-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-3">Severity Level (1-10)</label>
                     <div className="flex space-x-4">
                        {[1, 5, 8, 10].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setFormData({...formData, severity: level})}
                            className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all ${
                              formData.severity === level 
                                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {level === 1 ? 'Low (1)' : level === 5 ? 'Moderate (5)' : level === 8 ? 'High (8)' : 'Critical (10)'}
                          </button>
                        ))}
                     </div>
                     <p className="text-xs text-gray-400 mt-2 text-right">Current Selection: {formData.severity}</p>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Required Ward</label>
                      <select 
                        value={formData.requiredWard}
                        onChange={e => setFormData({...formData, requiredWard: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="GENERAL">General Ward</option>
                        <option value="ICU">Intensive Care Unit (ICU)</option>
                        <option value="EMERGENCY">Emergency</option>
                      </select>
                   </div>
                </div>
             </div>

             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50"
             >
               {loading ? 'Processing...' : 'Allocate Bed Now'}
             </button>
           </form>
        </div>

        <div className="w-80 space-y-6">
           {/* Guidelines or Helpers */}
           <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
             <h4 className="font-bold text-blue-900 mb-2">Queue Status</h4>
             <p className="text-sm text-blue-800">
               Usually instant allocation. If full, patient is automatically queued based on severity.
             </p>
           </div>
        </div>
      </div>

      {result && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-xl shadow-2xl max-w-md w-full flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-2 rounded-full">
                <CheckCircle size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">{result.message}</h4>
                {result.details.bed && (
                  <p className="text-gray-300 text-sm">Assigned to {result.details.bed.bedId} ({result.details.bed.wardNumber})</p>
                )}
                {!result.details.bed && (
                   <p className="text-gray-300 text-sm">Added to Waiting List</p>
                )}
              </div>
            </div>
            <button onClick={closeSuccess} className="text-gray-400 hover:text-white">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admission;
