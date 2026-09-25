import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <p className="text-7xl font-black gradient-text mb-4">404</p>
    <h1 className="text-2xl font-bold text-slate-100 mb-2">Page not found</h1>
    <p className="text-slate-400 mb-8">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="btn-primary">Back to Home</Link>
  </div>
);

export default NotFound;
