import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [geminiTips, setGeminiTips] = useState([]);
  const [RiskLevel, setRiskLevel] = useState();
  const [badge, setBadge] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [budget, setBudget] = useState(0);
  const [moneySpent, setMoneySpent] = useState(0);
  const [expenseList, setExpenseList] = useState([]);
  const [salary, setSalary] = useState(0);
  
  const apiKey = import.meta.env.VITE_GPT_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  // Fetch daily tips when the component is mounted
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserProfile(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setProfileData(data);
      setBudget(data.budget || 0);
      setMoneySpent(data.moneySpent || 0);
      setExpenseList(Array.isArray(data.expenses) ? data.expenses : []);
      setSalary(Number(data.salary) || 0);  // Convert salary to number
    }
  };

  const handleGemini = async () => {
    const userProfile = profileData
      ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Big Expenses: ${profileData.bigExpenses}, Desired Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current Investments: ${profileData.currentInvestments.join(', ')}.`
      : "No user profile available.";

    console.log(profileData);

    const prompt = `${userProfile} User Question: Give me 3 concise financial tips`;

    try {
      const result = await axios.post(
        apiUrl,
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      const botResponse = result.data.choices[0].message.content;
      setGeminiTips(botResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      setGeminiTips("Sorry, we were unable to fetch response");
    }
  };

  const handleGemini2 = async () => {
    const userProfile = profileData
      ? `User Profile: Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Big Expenses: ${profileData.bigExpenses}, Desired Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current Investments: ${profileData.currentInvestments.join(', ')}.`
      : "No user profile available.";

    console.log(profileData);

    const prompt = `${userProfile} Can you give the user's risk level and describe it in just one liner`;
    console.log(prompt)

    try {
      const result = await axios.post(
        apiUrl,
        {
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      const botResponse = result.data.choices[0].message.content;
      setRiskLevel(botResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      setRiskLevel("Sorry, we were unable to fetch response")
    }
  };

  const getSavingsBadge = (budget, moneySpent) => {
    const savings = budget - moneySpent;
    const savingsPercentage = (savings / budget) * 100;

    if (savingsPercentage > 50) {
      return "Saver";
    } else if (savingsPercentage > 30) {
      return "Budget King";
    } else {
      return "Money Guru";
    }
  };

  const expenses = Array.isArray(expenseList) && expenseList.length > 0 ? expenseList : [
    { name: 'Home Loan', amount: 5000, date: "19/10/2024" },
    { name: 'Dinner', amount: 100, date: "27/10/2024" },
    { name: 'Trip to Goa', amount: 1000, date: "27/10/2024" },
    { name: 'I bought PS5', amount: 500, date: "27/10/2024" },
    { name: 'Pencil', amount: 3.5, date: "27/10/2024" },
  ];
  
  const expenseData = {
    labels: expenses.map(exp => exp.name || 'Unnamed'),
    datasets: [{
      data: expenses.map(exp => typeof exp.amount === 'number' ? exp.amount : 0),
      backgroundColor: ['#1E3A8A', '#3B82F6', '#2563EB', '#1D4ED8', '#0F172A', '#60A5FA', '#93C5FD','#0F172A', '#172554', '#1E40AF'], 
    }]
  };
  

  const incomeExpenseData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Income vs Expenses',
        data: [salary, moneySpent],
        backgroundColor: ['#0A1172', '#0F172A'], 
      },
    ],
  };

  const savingsProgress = (budget, moneySpent) => {
    const savings = budget - moneySpent;
    return (savings / budget) * 100;
  };

  const progress = savingsProgress(budget, moneySpent);

  return (
    <div className="flex flex-col items-center  w-[82%] ml-[18%] bg-gradient-to-b from-[#172554] to-[#bae6fd] p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-white">Welcome</h1>
        <h2 className="text-2xl text-white mt-2">Badge: {getSavingsBadge(budget, moneySpent)}</h2>
        <hr className="my-4 border-white" />
      </div>
    

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Expense Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-[500px] h-[400px] ml-8">
  <h3 className="text-xl font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
  <Pie 
    data={expenseData} 
    options={{ 
      responsive: false, 
      maintainAspectRatio: false 
    }} 
  />
</div>

        {/* Income vs Expenses */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-[500px] h-[400px] ml-12">
        
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Income vs Expenses</h3>
          <Bar 
              data={incomeExpenseData} 
              options={{ 
                responsive: false, 
                maintainAspectRatio: false 
              }} 
              />
        </div>
      </div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center mt-12">
            <div className="flex justify-center gap-40  ml-80 items-center space-x-6 mb-4">
    
                <h3 className="text-xl font-semibold text-gray-800 ml-14">Risk Level</h3>
                <button 
                  onClick={handleGemini2} 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out">
                  Calculate Risk Level
                </button>
              </div>
              <div>{RiskLevel}</div>
            </div>
      
            {/* Savings Progress */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Savings Progress</h3>
              <progress value={progress} max="100" className="w-full h-6 mb-4 rounded-lg bg-gray-200" />
              <p className="text-lg text-gray-700">{Math.round(progress)}% of your budget saved!</p>
            </div>
      
            {/* Gemini Tips */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="flex justify-center gap-40 ml-80 items-center space-x-6 mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mr-4">GPT Tips for Today</h3>
                <div 
                  onClick={handleGemini} 
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out cursor-pointer">
                  Get tips
                </div>
              </div>
              <ul className="list-disc pl-6 text-gray-700">
                {geminiTips}
              </ul>
            </div>
      
          </div>
        );
      };
      
      export default Dashboard;