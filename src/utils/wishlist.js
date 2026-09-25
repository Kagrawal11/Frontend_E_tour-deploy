const KEY = 'virtugo_wishlist';

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

const write = (list) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // storage unavailable (private mode etc.) - fail silently
  }
};

export const getWishlist = () => read();

export const isWishlisted = (categoryId) => read().some((t) => t.categoryId === categoryId);

export const toggleWishlist = (tour) => {
  const list = read();
  const idx = list.findIndex((t) => t.categoryId === tour.categoryId);
  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    list.push(tour);
  }
  write(list);
  return idx < 0; // true if now wishlisted
};

export const removeFromWishlist = (categoryId) => {
  write(read().filter((t) => t.categoryId !== categoryId));
};
