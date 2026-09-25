const KEY = 'virtugo_recently_viewed';
const MAX_ITEMS = 8;

const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

export const getRecentlyViewed = () => read();

export const trackRecentlyViewed = (tour) => {
  try {
    const list = read().filter((t) => t.categoryId !== tour.categoryId);
    list.unshift(tour);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  } catch {
    // storage unavailable - fail silently
  }
};
