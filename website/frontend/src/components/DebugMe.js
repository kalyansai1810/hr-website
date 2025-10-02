import React from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const DebugMe = () => {
  const { user } = useAuth();

  const storedUser = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug - Current Auth State</h1>
      <div className="mb-4">
        <h2 className="font-medium">AuthContext user object</h2>
        <pre className="bg-gray-50 p-3 rounded mt-2">{JSON.stringify(user, null, 2)}</pre>
      </div>

      <div className="mb-4">
        <h2 className="font-medium">localStorage 'user'</h2>
        <pre className="bg-gray-50 p-3 rounded mt-2">{storedUser}</pre>
      </div>

      <div className="mb-4">
        <h2 className="font-medium">localStorage 'token'</h2>
        <pre className="bg-gray-50 p-3 rounded mt-2">{token ? token.substring(0, 40) + '...' : 'null'}</pre>
      </div>

      <div className="mb-4">
        <h2 className="font-medium">axios.defaults.baseURL</h2>
        <pre className="bg-gray-50 p-3 rounded mt-2">{axios.defaults.baseURL}</pre>
      </div>
    </div>
  );
};

export default DebugMe;
