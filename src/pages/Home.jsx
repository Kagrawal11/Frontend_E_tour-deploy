import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tourAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import family1 from '../assets/images/past-trips/family_1.png';
import family2 from '../assets/images/past-trips/family_2.png';
import family3 from '../assets/images/past-trips/family_3.png';
import family4 from '../assets/images/past-trips/family_4.png';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const getImageUrl = (path) => {
  if (!path) return null;
  const sanitizedPath = path.replace(/^"+|"+$/g, '');
  if (sanitizedPath.startsWith('http')) return sanitizedPath;
  const cleanPath = sanitizedPath.startsWith('/') ? sanitizedPath : `/${sanitizedPath}`;
  const finalPath = cleanPath.startsWith('/images') ? cleanPath : `/images${cleanPath}`;
  return `${BACKEND_URL}${finalPath}`;
};

const Home = () => {
  const categoryImages = [
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    "https://www.outlooktravelmag.com/media/A-Paris-Weekend-Away-main-1536px-jpg-1536x884.webp",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80"
  ];

  const [searchParams, setSearchParams] = useState({
    location: '',
    date: '',
    price: '',
    adults: 1,
    children: 0
  });
  const [tours, setTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [toursError, setToursError] = useState(null);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    fetchPopularTours();
  }, []);

  const fetchPopularTours = async () => {
    try {
      setLoadingTours(true);
      const response = await tourAPI.getTours();
      // Get first 4-5 tours
      const toursList = response.data.slice(0, 4);
      setTours(toursList);
      setToursError(null);
    } catch (error) {
      console.error('Error fetching tours:', error);
      setToursError(t('popular.error'));
    } finally {
      setLoadingTours(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handleTravelerCountChange = (field, delta, min) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: Math.max(min, (Number(prev[field]) || 0) + delta)
    }));
  };

  const pastTrips = [
    { id: 1, image: family1, title: 'Paris, France', family: 'The Smiths' },
    { id: 2, image: family2, title: 'Maldives', family: 'The Johnsons' },
    { id: 3, image: family3, title: 'Swiss Alps', family: 'The Williams' },
    { id: 4, image: family4, title: 'Kyoto, Japan', family: 'The Browns' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/tours', { state: { searchParams } });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative min-h-[640px] flex items-center justify-center text-white">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80"
            alt="Travel Background"
            className="w-full h-full object-cover"
            fetchpriority="high"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(8,9,15,0.55) 0%, rgba(8,9,15,0.75) 55%, #08090f 100%)' }}></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 z-10 relative mt-12">
          {/* Language Switcher */}
          <div className="absolute top-[-80px] right-4 flex gap-2">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${i18n.language === 'en' ? 'text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
              style={i18n.language === 'en' ? { background: 'linear-gradient(135deg, #7c5cff, #22d3ee)' } : undefined}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${i18n.language === 'hi' ? 'text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
              style={i18n.language === 'hi' ? { background: 'linear-gradient(135deg, #7c5cff, #22d3ee)' } : undefined}
            >
              हिन्दी
            </button>
            <button
              onClick={() => changeLanguage('es')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${i18n.language === 'es' ? 'text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
              style={i18n.language === 'es' ? { background: 'linear-gradient(135deg, #7c5cff, #22d3ee)' } : undefined}
            >
              ES
            </button>
          </div>

          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
              {t('hero.title1')} <span className="gradient-text">{t('hero.title2')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 drop-shadow-md max-w-2xl mx-auto font-light">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* Floating Search Widget */}
          <div className="max-w-5xl mx-auto glass rounded-2xl p-6 md:p-8 transform transition-all hover:scale-[1.01] animate-slide-up glow">

            {/* Tabs (Optional decorative) */}
            <div className="flex gap-6 mb-6 border-b pb-4 overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
              <button className="flex items-center gap-2 font-bold pb-1 gradient-text border-b-2" style={{ borderImage: 'linear-gradient(90deg, #7c5cff, #22d3ee) 1' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#7c5cff]" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {t('search.tours')}
              </button>
            </div>

            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="text-left w-full group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-[#22d3ee]">
                  {t('search.location')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within:text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <input
                    type="text"
                    name="location"
                    placeholder={t('search.locationPlaceholder')}
                    value={searchParams.location}
                    onChange={handleInputChange}
                    className="input-field pl-10 font-semibold"
                  />
                </div>
              </div>

              <div className="text-left w-full group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-[#22d3ee]">
                  {t('search.date')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within:text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <input
                    type="date"
                    name="date"
                    value={searchParams.date}
                    onChange={handleInputChange}
                    className="input-field pl-10 font-semibold [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="text-left w-full group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-[#22d3ee]">
                  {t('search.budget')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-focus-within:text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <input
                    type="number"
                    name="price"
                    placeholder={t('search.budgetPlaceholder')}
                    value={searchParams.price}
                    onChange={handleInputChange}
                    className="input-field pl-10 font-semibold"
                  />
                </div>
              </div>

              <div className="text-left w-full group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Travelers
                </label>
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Adults</span>
                    <button
                      type="button"
                      onClick={() => handleTravelerCountChange('adults', -1, 1)}
                      className="w-6 h-6 rounded-full border border-white/15 text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-semibold text-slate-100">{searchParams.adults}</span>
                    <button
                      type="button"
                      onClick={() => handleTravelerCountChange('adults', 1, 1)}
                      className="w-6 h-6 rounded-full border border-white/15 text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold">Children</span>
                    <button
                      type="button"
                      onClick={() => handleTravelerCountChange('children', -1, 0)}
                      className="w-6 h-6 rounded-full border border-white/15 text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-semibold text-slate-100">{searchParams.children}</span>
                    <button
                      type="button"
                      onClick={() => handleTravelerCountChange('children', 1, 0)}
                      className="w-6 h-6 rounded-full border border-white/15 text-slate-300 hover:bg-white/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full h-[50px] uppercase tracking-wide"
              >
                {t('search.submit')}
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12 animate-fade-in-up">

          </div>
        </div>
      </section>


      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              {t('popular.title')}
            </h2>
            <p className="text-slate-400 text-lg">
              {t('popular.subtitle')}
            </p>
          </div>

          {loadingTours ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#7c5cff', borderTopColor: 'transparent' }}></div>
            </div>
          ) : toursError ? (
            <div className="text-center py-12">
              <p className="text-rose-400 text-lg mb-4">{toursError}</p>
              <button
                onClick={fetchPopularTours}
                className="btn-primary"
              >
                {t('popular.retry')}
              </button>
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">{t('popular.noTours')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tours.map((tour, index) => (

                <Link
                  key={tour.categoryId}
                  to={`/tours/details/${tour.categoryId}`}
                  className="group relative card card-hover"
                >
                  {/* Image */}
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={getImageUrl(tour.imagePath) || categoryImages[index % categoryImages.length]}
                      alt={tour.categoryName}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = categoryImages[index % categoryImages.length];
                      }}
                    />

                    {/* Luxury overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                    {/* Premium badge */}

                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-100 mb-2 tracking-tight">
                      {tour.categoryName}
                    </h3>

                    <p className="text-slate-400 text-sm leading-relaxed mb-5 line-clamp-2">
                      {tour.categoryDescription || t('popular.defaultDesc')}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="gradient-text font-semibold text-sm tracking-wide">
                        {t('popular.viewExperience')}
                      </span>

                      <span className="text-xs text-slate-500">
                        {tour.departures?.length || 0} {t('popular.departures')}
                      </span>
                    </div>
                  </div>
                </Link>

              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/tours" className="btn-primary">
              {t('popular.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Past Trips Photos Carousel */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-100 mb-4 tracking-tight">
              {t('pastTrips.title')}
            </h2>
            <div className="w-24 h-1.5 mx-auto rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #7c5cff, #22d3ee)' }}></div>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              {t('pastTrips.subtitle')}
            </p>
          </div>

          <Swiper
            spaceBetween={30}
            centeredSlides={false}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true
            }}
            navigation={true}
            modules={[Autoplay, Pagination, Navigation]}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 20
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 40
              },
            }}
            className="pb-16 !px-4"
          >
            {pastTrips.map((trip) => (
              <SwiperSlide key={trip.id}>
                <div className="relative group rounded-3xl overflow-hidden shadow-2xl h-[450px] transform transition-all duration-500 hover:-translate-y-2 border" style={{ borderColor: 'var(--color-border)' }}>
                  <img
                    src={trip.image}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Premium Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 text-white">
                    <div className="transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                      <span className="inline-block px-3 py-1 backdrop-blur-md rounded-full text-xs font-bold mb-3 uppercase tracking-widest" style={{ background: 'rgba(124,92,255,0.5)' }}>
                        {t('pastTrips.customerStory')}
                      </span>
                      <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">{trip.title}</h3>
                      <p className="text-slate-300 font-medium italic opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#22d3ee]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {t('pastTrips.visitedBy')} {trip.family}
                      </p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              {t('features.title')}
            </h2>
            <p className="text-slate-400 text-lg">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="panel card-hover">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(124,92,255,0.12)' }}>
                <svg className="w-8 h-8 text-[#7c5cff]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                {t('features.guidance.title')}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {t('features.guidance.desc')}
              </p>
            </div>

            <div className="panel card-hover">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(124,92,255,0.12)' }}>
                <svg className="w-8 h-8 text-[#7c5cff]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                {t('features.price.title')}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {t('features.price.desc')}
              </p>
            </div>

            <div className="panel card-hover">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(124,92,255,0.12)' }}>
                <svg className="w-8 h-8 text-[#7c5cff]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">
                {t('features.support.title')}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {t('features.support.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-2xl p-8 text-center text-white border glow" style={{ background: 'linear-gradient(135deg, rgba(124,92,255,0.15), rgba(34,211,238,0.1))', borderColor: 'var(--color-border-strong)' }}>
              <h2 className="text-3xl font-bold mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-xl mb-8 text-slate-300">
                {t('cta.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary">
                  {t('cta.signup')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home
