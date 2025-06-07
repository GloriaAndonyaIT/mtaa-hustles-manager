// import React, { useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { DollarSign, Calendar, FileText, Tag } from 'lucide-react';

// const TransactionForm = ({ hustle, onSubmit }) => {
//   const [searchParams] = useSearchParams();
//   const transactionType = searchParams.get('type') || 'income';
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     type: transactionType,
//     amount: '',
//     description: '',
//     date: new Date().toISOString().split('T')[0],
//     tag: ''
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const transaction = {
//       ...formData,
//       amount: Number(formData.amount),
//       date: formData.date
//     };
//     onSubmit(transaction);
//   };

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
//       <h2 className="text-xl font-bold text-gray-900 mb-6">
//         Add {transactionType === 'income' ? 'Income' : 'Expense'} to {hustle?.name}
//       </h2>
      
//       <form onSubmit={handleSubmit}>
//         <div className="space-y-4">
//           <div>
//             <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//               Amount (KSh) *
//             </label>
//             <div className="relative rounded-md shadow-sm">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <DollarSign className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="number"
//                 id="amount"
//                 name="amount"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 required
//                 min="1"
//                 step="1"
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
//                 placeholder="0.00"
//               />
//             </div>
//           </div>

//           <div>
//             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//               Description *
//             </label>
//             <div className="relative rounded-md shadow-sm">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <FileText className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
//                 placeholder="What was this for?"
//               />
//             </div>
//           </div>

//           <div>
//             <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
//               Date *
//             </label>
//             <div className="relative rounded-md shadow-sm">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Calendar className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="date"
//                 id="date"
//                 name="date"
//                 value={formData.date}
//                 onChange={handleChange}
//                 required
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
//               />
//             </div>
//           </div>

//           <div>
//             <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
//               Tag (Optional)
//             </label>
//             <div className="relative rounded-md shadow-sm">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <Tag className="h-5 w-5 text-gray-400" />
//               </div>
//               <input
//                 type="text"
//                 id="tag"
//                 name="tag"
//                 value={formData.tag}
//                 onChange={handleChange}
//                 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
//                 placeholder="e.g. Supplies, Transport"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="mt-8 flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={() => navigate(`/hustles/${hustle.id}`)}
//             className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
//               transactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
//             } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//               transactionType === 'income' ? 'focus:ring-green-500' : 'focus:ring-red-500'
//             }`}
//           >
//             Add {transactionType === 'income' ? 'Income' : 'Expense'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default TransactionForm;