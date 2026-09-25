import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const StarRating = ({ rating = 0, size = 'w-4 h-4', showValue = true, count }) => {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <StarIcon
            key={i}
            className={`${size} ${i <= rounded ? 'text-amber-400' : 'text-white/15'}`}
          />
        ))}
      </span>
      {showValue && <span className="text-sm text-slate-300 font-medium">{rating ? rating.toFixed(1) : 'New'}</span>}
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  );
};

export default StarRating;
