// LoginSignup.js
import React, { useState } from 'react';
import { auth, googleProvider } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';


const Login= () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {

      //sign up
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully!");
        navigate("/profile")
      } 
      

      // login
      else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in successfully!");
        navigate("/profile")

      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Google login successful!");
      navigate("/profile")

    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <>
      <header>
        <nav className="bg-blue-800 text-white flex justify-center py-4 space-x-12 w-full">
          <button onClick={() => window.location.href = "/home"} className="hover:underline">Home</button>
          <button onClick={() => window.location.href = "/aboutus"} className="hover:underline">About Us</button>
          <button onClick={() => window.location.href = "/features"} className="hover:underline">Features</button>
          <button onClick={() => window.location.href = "/login"} className="hover:underline">Sign Up</button>
        </nav>
      </header>
    
    <div className="flex items-center justify-center h-screen bg-gray-900 ">
      
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
         
        <h2 className="text-2xl font-semibold font-sans text-center mb-6">{isSignUp ? "Sign Up" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isSignUp ? "Sign Up" : "Login"}

          </button>

          <div className="text-center mt-4">
            <p>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-500 ml-2"
              >
                {isSignUp ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>

          <hr className="my-4" />

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default Login;
