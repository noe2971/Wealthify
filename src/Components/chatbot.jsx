import React, { useState, useEffect } from 'react';
import { FaArrowAltCircleUp } from "react-icons/fa";
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { db, auth } from '../config/firebase';
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [language, setLanguage] = useState('English');

  const apiKey = import.meta.env.VITE_GPT_KEY;
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const languages = [
    "English", "Hindi", "Bengali", "Telugu", "Marathi",
    "Tamil", "Gujarati", "Kannada", "Malayalam", "Punjabi", "Odia"
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchUserProfile(user.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      setProfileData(userDoc.data());
    }
  };

  const handleSendMessage = async () => {
    if (input.trim()) {
      const newMessages = [...messages, { text: input, user: true }];
      setMessages(newMessages);
      setInput('');

      // Create a concise user profile summary
      const userProfile = profileData
        ? `Name: ${profileData.name}, Age: ${profileData.age}, Salary: ${profileData.salary}, Expenses: ${profileData.bigExpenses}, Investments: ${profileData.desiredInvestments}, Goals: ${profileData.goals}, Current: ${profileData.currentInvestments.join(', ')}`
        : "No profile";

      // Concise prompt with minimal tokens
      const prompt = `Lang: ${language}. ${userProfile}. Q: ${input}`;
      console.log(prompt);

      try {
        setLoading(true);
        const result = await axios.post(
          apiUrl,
          {
            model: "gpt-3.5-turbo", // Using turbo model
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
        setLoading(false);
        setMessages([...newMessages, { text: botResponse, user: false }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setLoading(false);
        setMessages([...newMessages, { text: 'Error: Could not get response from AI', user: false }]);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-[82%] bg-gradient-to-b from-[#172554] to-[#bae6fd] max-w-4xl mx-auto space-y-4 p-4 ">
      <div className="flex gap-10 justify-center items-center w-full px-8 mb-8">
        <h1 className="font-bold font-sans text-[3rem] drop-shadow-lg text-white">Finance AI Chatbot</h1>
        <select
          className="p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {languages.map((lang, index) => (
            <option key={index} value={lang}>{lang}</option>
          ))}
        </select>
      </div>
      <div className="bg-white w-[95vh] shadow-lg rounded-lg overflow-hidden">
        <div className="p-8 h-[65vh] overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.user ? 'justify-end' : 'justify-start'} mb-2`}>
              <div className={`rounded-lg p-3 shadow-md flex flex-wrap font-sans ${msg.user ? 'bg-blue-600 text-white' : 'bg-blue-100'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && (
            <div className="wrapper">
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="circle"></div>
              <div className="shadow"></div>
              <div className="shadow"></div>
              <div className="shadow"></div>
              <span className="text-blue-500">Loading</span>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200 flex">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button
            className="ml-2 text-white bg-blue-900 hover:bg-gray-800 p-2 rounded-lg transition-all"
            onClick={handleSendMessage}
          >
            <FaArrowAltCircleUp size={25} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
