/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import GoogleLoginComponent from "../components/GoogleLoginComponent";
import {
  Camera,
  Image as ImageIcon,
  Paintbrush,
  Layers,
  Upload,
  Wand2,
  Move,
  Save,
  Download,
} from "lucide-react";

const AuthContainer = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState();
  const [error, setError] = useState("");

  const handleLoginSuccess = async (response) => {
    const { credential } = response;
    try {
      const data = await AuthService.login(credential);
      setUser(data.user);
      navigate("/editor");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Failed to log in. Please try again.");
    }
  };

  if (user) {
    return <Navigate to="/editor" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Abstract background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl w-full bg-gray-800/90 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
          {/* Left side - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                Canvas
              </h1>
              <p className="text-xl text-gray-300">
                Transform your creative vision with our advanced image editing
                suite
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-700/70 transition-all duration-300">
                <Paintbrush className="w-10 h-10 text-purple-400 mb-3" />
                <h3 className="text-lg text-gray-200 font-semibold">
                  Creative Tools
                </h3>
                <p className="text-gray-400">
                  Express your creativity with precision drawing tools
                </p>
              </div>
              <div className="bg-gray-700/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-700/70 transition-all duration-300">
                <Layers className="w-10 h-10 text-purple-400 mb-3" />
                <h3 className="text-lg text-gray-200 font-semibold">
                  Pro Filters
                </h3>
                <p className="text-gray-400">
                  Enhanced filters for professional results
                </p>
              </div>
              <div className="bg-gray-700/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-700/70 transition-all duration-300">
                <Wand2 className="w-10 h-10 text-purple-400 mb-3" />
                <h3 className="text-lg text-gray-200 font-semibold">
                  AI Generation
                </h3>
                <p className="text-gray-400">
                  Create stunning images with AI technology
                </p>
              </div>
              <div className="bg-gray-700/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-700/70 transition-all duration-300">
                <Move className="w-10 h-10 text-purple-400 mb-3" />
                <h3 className="text-lg text-gray-200 font-semibold">
                  Transform
                </h3>
                <p className="text-gray-400">
                  Advanced cropping, rotation, and resizing tools
                </p>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div className="px-4 py-2 bg-gray-700/30 rounded-full text-gray-300 text-sm flex items-center gap-2">
                <Save className="w-4 h-4" />
                Cloud Storage
              </div>
              <div className="px-4 py-2 bg-gray-700/30 rounded-full text-gray-300 text-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Easy Export
              </div>
              <div className="px-4 py-2 bg-gray-700/30 rounded-full text-gray-300 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Multiple Formats
              </div>
            </div>
          </div>

          {/* Right side - Login */}
          <div className="flex flex-col justify-center lg:border-l lg:border-gray-700 lg:pl-8">
            <div className="bg-gray-700/50 p-8 rounded-xl backdrop-blur-sm">
              <h2 className="text-3xl text-gray-200 font-semibold mb-8 text-center">
                Get Started
              </h2>
              <div className="space-y-6">
                <p className="text-gray-300 text-center">
                  Sign in to access your workspace and saved projects
                </p>
                <GoogleLoginComponent onGoogleResponse={handleLoginSuccess} />
                {error && (
                  <p className="mt-4 text-red-400 text-center text-sm">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
