// import React, { useState } from 'react';
// import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
// import HustleList from './HustleList';
// import HustleDetails from './HustleDetails';
// import HustleForm from './HustleForm';
// import TransactionForm from './TransactionForm';
// import TransactionList from './TransactionList';

// const MyHustlesPage = () => {
//   const [hustles, setHustles] = useState([
//     {
//       id: '1',
//       name: 'Mama Mboga Stand',
//       businessType: 'Retail',
//       location: 'Nairobi CBD',
//       startDate: '2025-01-15',
//       description: 'Vegetable and fruit stand',
//       status: 'active',
//       income: 25000,
//       expenses: 18000,
//       profit: 7000,
//       incomeChange: 12,
//       expenseChange: 8,
//       profitChange: 15,
//       daysActive: 142,
//       avgDailyProfit: 49,
//       recentTransactions: [
//         { 
//           id: '1',
//           type: 'income', 
//           amount: 2500, 
//           description: 'Daily sales', 
//           date: '2025-06-02',
//           tags: ['Sales'],
//           category: 'Sales Revenue',
//           hustleId: '1',
//           hustleName: 'Mama Mboga Stand'
//         },
//         { 
//           id: '2',
//           type: 'expense', 
//           amount: 800, 
//           description: 'Vegetable restock', 
//           date: '2025-06-01',
//           tags: ['Supplies'],
//           category: 'Raw Materials',
//           hustleId: '1',
//           hustleName: 'Mama Mboga Stand'
//         },
//         { 
//           id: '3',
//           type: 'income', 
//           amount: 3200, 
//           description: 'Weekly bulk order', 
//           date: '2025-05-30',
//           tags: ['Wholesale'],
//           category: 'Sales Revenue',
//           hustleId: '1',
//           hustleName: 'Mama Mboga Stand'
//         }
//       ]
//     },
//     {
//       id: '2',
//       name: 'Boda Boda',
//       businessType: 'Service',
//       location: 'Kawangware',
//       startDate: '2025-03-10',
//       description: 'Motorcycle taxi service',
//       status: 'active',
//       income: 15000,
//       expenses: 8000,
//       profit: 7000,
//       incomeChange: 5,
//       expenseChange: 3,
//       profitChange: 8,
//       daysActive: 88,
//       avgDailyProfit: 80,
//       recentTransactions: [
//         { 
//           id: '4',
//           type: 'income', 
//           amount: 1500, 
//           description: 'Daily rides', 
//           date: '2025-06-02',
//           tags: ['Transport'],
//           category: 'Service Income',
//           hustleId: '2',
//           hustleName: 'Boda Boda'
//         },
//         { 
//           id: '5',
//           type: 'expense', 
//           amount: 500, 
//           description: 'Fuel', 
//           date: '2025-06-01',
//           tags: ['Fuel'],
//           category: 'Utilities',
//           hustleId: '2',
//           hustleName: 'Boda Boda'
//         },
//         { 
//           id: '6',
//           type: 'expense', 
//           amount: 200, 
//           description: 'Maintenance', 
//           date: '2025-05-30',
//           tags: ['Repairs'],
//           category: 'Maintenance',
//           hustleId: '2',
//           hustleName: 'Boda Boda'
//         }
//       ]
//     }
//   ]);

//   // Get all transactions across all hustles
//   const [allTransactions, setAllTransactions] = useState(() => {
//     return hustles.flatMap(hustle => hustle.recentTransactions || []);
//   });

//   const navigate = useNavigate();

//   const addHustle = (newHustle) => {
//     const hustle = {
//       ...newHustle,
//       id: Date.now().toString(),
//       status: 'active',
//       income: 0,
//       expenses: 0,
//       profit: 0,
//       incomeChange: 0,
//       expenseChange: 0,
//       profitChange: 0,
//       daysActive: 0,
//       avgDailyProfit: 0,
//       recentTransactions: []
//     };
//     setHustles([...hustles, hustle]);
//     navigate('/hustles');
//   };

//   const addTransaction = (hustleId, transaction) => {
//     const newTransaction = {
//       ...transaction,
//       id: Date.now().toString()
//     };

//     // Update hustles state
//     setHustles(prevHustles => 
//       prevHustles.map(hustle => {
//         if (hustle.id === hustleId) {
//           const updatedHustle = { ...hustle };
//           updatedHustle.recentTransactions = [
//             newTransaction,
//             ...(hustle.recentTransactions || [])
//           ];

//           if (transaction.type === 'income') {
//             updatedHustle.income += transaction.amount;
//           } else {
//             updatedHustle.expenses += transaction.amount;
//           }

//           updatedHustle.profit = updatedHustle.income - updatedHustle.expenses;
//           return updatedHustle;
//         }
//         return hustle;
//       })
//     );

//     // Update all transactions state
//     setAllTransactions(prev => [newTransaction, ...prev]);
    
//     navigate(`/hustles/${hustleId}`);
//   };

//   // Component to handle individual hustle details
//   const HustleDetailsWrapper = () => {
//     const { id } = useParams();
//     const hustle = hustles.find(h => h.id === id);
    
//     if (!hustle) {
//       return (
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
//           <p className="text-gray-600">Hustle not found</p>
//           <button
//             onClick={() => navigate('/hustles')}
//             className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
//           >
//             Back to Hustles
//           </button>
//         </div>
//       );
//     }

//     return <HustleDetails hustle={hustle} />;
//   };

//   // Component to handle transaction form
//   const TransactionFormWrapper = () => {
//     const { id } = useParams();
//     const hustle = hustles.find(h => h.id === id);
    
//     return (
//       <TransactionForm 
//         hustle={hustle}
//         onSubmit={(transaction) => addTransaction(id, transaction)}
//       />
//     );
//   };

//   return (
//     <div className="p-6">
//       <Routes>
//         <Route 
//           path="/" 
//           element={<HustleList hustles={hustles} />} 
//         />
//         <Route 
//           path="/new" 
//           element={<HustleForm onSubmit={addHustle} />} 
//         />
//         <Route 
//           path="/transactions" 
//           element={
//             <TransactionList 
//               transactions={allTransactions}
//               hustles={hustles}
//               onAddTransaction={() => navigate('/hustles')}
//             />
//           } 
//         />
//         <Route 
//           path="/:id" 
//           element={<HustleDetailsWrapper />} 
//         />
//         <Route 
//           path="/:id/transactions/new" 
//           element={<TransactionFormWrapper />} 
//         />
//       </Routes>
//     </div>
//   );
// };

// export default MyHustlesPage;