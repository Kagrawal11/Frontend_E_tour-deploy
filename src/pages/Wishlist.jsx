import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { getWishlist, removeFromWishlist } from '../utils/wishlist';

const Wishlist = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(getWishlist());
  }, []);

  const handleRemove = (categoryId) => {
    removeFromWishlist(categoryId);
    setItems(getWishlist());
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">My Wishlist</h1>
      <p className="text-slate-400 mb-8">Tours you've saved for later</p>

      {items.length === 0 ? (
        <div className="card p-12 text-center">
          <HeartIcon className="w-12 h-12 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 mb-6">Your wishlist is empty.</p>
          <Link to="/tours" className="btn-primary">Browse Tours</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((tour) => (
            <div key={tour.categoryId} className="card card-hover overflow-hidden">
              <Link to={`/tours/details/${tour.categoryId}`} className="block h-40 overflow-hidden">
                <img
                  src={tour.imagePath}
                  alt={tour.categoryName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </Link>
              <div className="p-4 flex items-center justify-between gap-3">
                <Link to={`/tours/details/${tour.categoryId}`} className="font-semibold text-slate-100 hover:text-[#22d3ee] transition-colors">
                  {tour.categoryName}
                </Link>
                <button
                  onClick={() => handleRemove(tour.categoryId)}
                  className="text-xs text-rose-400 hover:text-rose-300 shrink-0"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
