import React, { useEffect, useState } from 'react';
import { Filter, MoreHorizontal, Eye } from 'lucide-react';
import { patientAPI } from '../api';

const WaitingQueue = () => {
  const [queue, setQueue] = useState([]);
  
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await patientAPI.getQueue();
        setQueue(res.data);
      } catch (error) {
        console.error("Failed to load queue", error);
      }
    };
    fetchQueue();
    // Poll every 30s
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, []);

  const nextPatient = queue.length > 0 ? queue[0] : null;

  const handleAssign = async () => {
    if(!nextPatient) return;
    try {
        await patientAPI.allocate(nextPatient.patientId);
        // Refresh
        const res = await patientAPI.getQueue();
        setQueue(res.data);
    } catch (error) {
        alert("Allocation Failed: " + (error.response?.data?.message || 'No suitable bed found'));
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Priority Waiting Queue</h2>
           <p className="text-gray-500">{queue.length} Patients currently awaiting bed assignment</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium">
          <Filter size={16} />
          <span>Filter List</span>
        </button>
      </div>

      {nextPatient && (
        <div className="bg-white border-2 border-blue-500 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
            Next In Line
          </div>
          <div className="flex items-center space-x-6">
             <div className="w-24 h-24 bg-blue-50 rounded-lg flex items-center justify-center text-4xl font-bold text-blue-600">
               1
             </div>
             <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{nextPatient.name}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Severity: {nextPatient.severity}
                  </span>
                  <span className="text-gray-500 text-sm">ID: #{nextPatient.patientId}</span>
                  <span className="text-gray-500 text-sm">Ward: {nextPatient.requiredWard}</span>
                  <span className="text-gray-500 text-sm">Wait: {new Date(nextPatient.arrivalTime).toLocaleTimeString()}</span>
                </div>
             </div>
             <button 
               onClick={handleAssign}
               className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
             >
               Assign Bed Now
             </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
           <thead className="bg-gray-50">
             <tr>
               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Patient Details</th>
               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Priority / Severity</th>
               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Wait Time</th>
               <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {queue.map((patient, index) => (
               <tr key={patient.patientId} className="hover:bg-gray-50">
                 <td className="px-6 py-4 text-2xl font-bold text-gray-400">{index + 1}</td>
                 <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-500">ID: #{patient.patientId}</p>
                 </td>
                 <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      patient.severity >= 8 ? 'bg-red-100 text-red-700' : 
                      patient.severity >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>
                      Score: {patient.severity} - {patient.requiredWard}
                    </span>
                 </td>
                 <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(patient.arrivalTime).toLocaleTimeString()}
                 </td>
                 <td className="px-6 py-4 text-right">
                   <button className="text-gray-400 hover:text-blue-600">
                     <Eye size={20} />
                   </button>
                 </td>
               </tr>
             ))}
             {queue.length === 0 && (
               <tr>
                 <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                   No patients in waiting queue
                 </td>
               </tr>
             )}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitingQueue;
