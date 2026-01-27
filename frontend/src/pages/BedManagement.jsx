import React, { useEffect, useState } from 'react';
import { Filter, User, Plus, Search, Settings } from 'lucide-react';
import { bedAPI, patientAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const BedCard = ({ bed, patient, onDischarge, onAdmit }) => {
  const isOccupied = bed.status === 'OCCUPIED';
  
  return (
    <div className={`bg-white rounded-xl border-l-4 shadow-sm p-4 ${isOccupied ? 'border-red-500' : 'border-green-500'}`}>
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${isOccupied ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {bed.status}
        </span>
        {isOccupied && <div className="text-red-500 font-bold text-xl">*</div>}
        {!isOccupied && <div className="text-green-500 font-bold text-xl">✓</div>}
      </div>
      
      <h3 className="text-lg font-bold text-gray-900">{bed.bedId}</h3>
      <p className="text-sm text-gray-500 mb-4">{bed.wardNumber} - {bed.type}</p>
      
      <div className="flex items-center space-x-3 mb-6">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOccupied ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-300'}`}>
           <User size={16} />
        </div>
        <div>
           {isOccupied ? (
             <>
               <p className="text-sm font-semibold text-gray-900">{patient?.name || 'Unknown Patient'}</p>
               <p className="text-xs text-gray-500">Admitted: {patient ? new Date(patient.arrivalTime).toLocaleDateString() : '-'}</p>
             </>
           ) : (
             <p className="text-sm text-gray-400">No Patient Assigned</p>
           )}
        </div>
      </div>
      
      <button 
        onClick={() => isOccupied ? onDischarge(bed.bedId) : onAdmit(bed.bedId)}
        className={`w-full py-2 rounded-lg font-medium text-sm border transition-colors ${
          isOccupied 
            ? 'border-red-200 text-red-600 hover:bg-red-50' 
            : 'bg-blue-600 text-white hover:bg-blue-700 border-transparent'
        }`}
      >
        {isOccupied ? 'Discharge Patient' : 'Admit Patient'}
      </button>
    </div>
  );
};

const BedManagement = () => {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState('All Wards');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBedData, setNewBedData] = useState({ bedId: '', wardNumber: '', type: 'GENERAL' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bedsRes, patientsRes] = await Promise.all([
        bedAPI.getAll(),
        patientAPI.getAll()
      ]);
      setBeds(bedsRes.data);
      setPatients(patientsRes.data);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    try {
        await bedAPI.add(newBedData);
        setIsModalOpen(false);
        setNewBedData({ bedId: '', wardNumber: '', type: 'GENERAL' });
        fetchData();
    } catch (error) {
        alert('Failed to add bed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDischarge = async (bedId) => {
    if(!window.confirm("Are you sure you want to discharge this patient?")) return;
    try {
      await bedAPI.updateStatus(bedId, 'FREE');
      fetchData(); // Refresh
    } catch (error) {
      alert("Failed to discharge");
    }
  };

  const handleAdmit = (bedId) => {
    // Navigate to admission page, potentially pre-selecting bed if we had that param
    navigate('/admit');
  };

  const getFilteredBeds = () => {
    return beds.filter(bed => {
       const wardMatch = filter === 'All Wards' || 
                         (bed.wardNumber && bed.wardNumber.toLowerCase().includes(filter.toLowerCase())) || 
                         (bed.type && bed.type.toLowerCase().includes(filter.toLowerCase()));
       const statusMatch = statusFilter === 'All' || 
                           (statusFilter === 'Free' && bed.status === 'FREE') || 
                           (statusFilter === 'Occupied' && bed.status === 'OCCUPIED');
       return wardMatch && statusMatch;
    });
  };

  const filteredBeds = getFilteredBeds();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Bed Management Grid</h2>
        <div className="flex space-x-3">
          <button onClick={() => setIsModalOpen(true)} className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50">
             <Plus size={18} />
             <span>Add New Bed</span>
          </button>
          <button onClick={() => navigate('/admit')} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700">
             <Plus size={18} />
             <span>Add New Admission</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
         <div className="relative flex-1 min-w-[300px]">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input type="text" placeholder="Search by Bed ID or Patient Name..." className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
         </div>
         
         <div className="flex space-x-2">
           {['All Wards', 'ICU', 'General', 'Emergency'].map(f => (
             <button 
               key={f}
               onClick={() => setFilter(f)}
               className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
             >
               {f}
             </button>
           ))}
         </div>

         <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
           {['All', 'Free', 'Occupied'].map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {s}
              </button>
           ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBeds.map(bed => {
           // Find patient assigned to this bed
           // Note: Data model has assignedBedId on Patient, but Bed doesn't have patientId. 
           // We map from patient list.
           const assignedPatient = patients.find(p => p.assignedBedId === bed.bedId && p.status === 'ADMITTED'); 
           
           return (
             <BedCard 
               key={bed.bedId} 
               bed={bed} 
               patient={assignedPatient} 
               onDischarge={handleDischarge} 
               onAdmit={handleAdmit}
             />
           );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Bed</h3>
            <form onSubmit={handleAddBed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed ID</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. ICU-101"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newBedData.bedId}
                  onChange={e => setNewBedData({...newBedData, bedId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ward Number/Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Ward A"
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newBedData.wardNumber}
                  onChange={e => setNewBedData({...newBedData, wardNumber: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type</label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg"
                  value={newBedData.type}
                  onChange={e => setNewBedData({...newBedData, type: e.target.value})}
                >
                  <option value="GENERAL">GENERAL</option>
                  <option value="ICU">ICU</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BedManagement;
