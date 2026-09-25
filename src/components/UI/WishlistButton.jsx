import React, { useState } from 'react';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { isWishlisted, toggleWishlist } from '../../utils/wishlist';

// tour: { categoryId, categoryName, imagePath }
const WishlistButton = ({ tour, className = '' }) => {
  const [wishlisted, setWishlisted] = useState(() => isWishlisted(tour.categoryId));

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowWishlisted = toggleWishlist(tour);
    setWishlisted(nowWishlisted);
    toast.success(nowWishlisted ? 'Added to wishlist' : 'Removed from wishlist', { autoClose: 1500 });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-110 ${className}`}
      style={{ background: 'rgba(8,9,15,0.55)' }}
    >
      {wishlisted ? (
        <HeartSolid className="w-5 h-5 text-rose-400" />
      ) : (
        <HeartOutline className="w-5 h-5 text-white" />
      )}
    </button>
  );
};

export default WishlistButton;
