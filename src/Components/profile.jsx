import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";  // Import Firebase
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";  // Import auth state listener
import { ToastContainer, toast } from "react-toastify";  // Import Toastify
import "react-toastify/dist/ReactToastify.css";  // Toastify CSS

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    salary: "",
    bigExpenses: [],
    currentInvestments: [],
    desiredInvestments: [],
    goals: "",
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();

        // Clean up single-character entries in specific fields
        const cleanedData = {
          ...data,
          bigExpenses: cleanArray(data.bigExpenses),
          currentInvestments: cleanArray(data.currentInvestments),
          desiredInvestments: cleanArray(data.desiredInvestments),
        };

        setFormData(cleanedData);
        toast.success("Profile data loaded successfully!");
      } else {
        toast.error("No profile data found.");
      }
    } catch (error) {
      toast.error("Error loading profile data.");
    }
  };

  // Helper function to clean up unintended single-character entries in an array
  const cleanArray = (array) => {
    if (!Array.isArray(array)) return [];
    return array.filter((item) => item.length > 1); // Keeps only items longer than one character
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleMultipleChoice = (field, option) => {
    setFormData((prevData) => {
      const updatedChoices = prevData[field].includes(option)
        ? prevData[field].filter((item) => item !== option)
        : [...prevData[field], option];
      return { ...prevData, [field]: updatedChoices };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userId) {
      try {
        // Clean up single-character entries before saving to prevent extra characters from saving
        const cleanedFormData = {
          ...formData,
          bigExpenses: cleanArray(formData.bigExpenses),
          currentInvestments: cleanArray(formData.currentInvestments),
          desiredInvestments: cleanArray(formData.desiredInvestments),
        };

        await setDoc(doc(db, "users", userId), cleanedFormData);
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error("Error updating profile.");
      }
    } else {
      toast.error("No user is logged in.");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-[#172554] to-[#bae6fd] w-[100%] ml-[18vh]">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="bg-blue-600 shadow-lg rounded-lg p-6 max-w-md w-full text-white">
        <h2 className="text-2xl font-medium mb-6 text-center bg-gray-800 h-16 grid place-items-center">Profile Builder</h2>

        <div className="mb-4">
          <label className="block font-medium">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 rounded bg-blue-50 text-blue-900"
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="mt-1 block w-full p-2 rounded bg-blue-50 text-blue-900"
            placeholder="Enter your age"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Salary:</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            className="mt-1 block w-full p-2 rounded bg-blue-50 text-blue-900"
            placeholder="Enter your salary"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium">Big Expenses:</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {["House loan", "Car loan", "Education loan", "Children", "Other"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleMultipleChoice("bigExpenses", option)}
                className={`p-2 rounded ${
                  formData.bigExpenses.includes(option) ? "bg-green-500" : "bg-blue-400"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium">Current Investments:</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {["Stocks", "Bonds", "Crypto", "Gold", "Real Estate", "Other"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleMultipleChoice("currentInvestments", option)}
                className={`p-2 rounded ${
                  formData.currentInvestments.includes(option) ? "bg-green-500" : "bg-blue-400"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium">Desired Investments:</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {["Stocks", "Bonds", "Crypto", "Gold", "Real Estate", "Other"].map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => handleMultipleChoice("desiredInvestments", option)}
                className={`p-2 rounded ${
                  formData.desiredInvestments.includes(option) ? "bg-green-500" : "bg-blue-400"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-medium">Financial Goals:</label>
          <input
            type="text"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            className="mt-1 block w-full p-2 rounded bg-blue-50 text-blue-900"
            placeholder="Enter your goals"
          />
        </div>

        <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded w-full">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;