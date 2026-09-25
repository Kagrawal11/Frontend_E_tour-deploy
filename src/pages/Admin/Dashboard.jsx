import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Card from '../../components/UI/Card';
import Table from '../../components/UI/Table';
import { adminAPI } from '../../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Tours', value: '...', change: '', changeType: 'positive' },
    { label: 'Total Bookings', value: '...', change: '', changeType: 'positive' },
    { label: 'Active Users', value: '...', change: '', changeType: 'positive' },
    { label: 'Revenue', value: '...', change: '', changeType: 'positive' }
  ]);

  const [csvFile, setCsvFile] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');
  const [recentBookingsData, setRecentBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          adminAPI.getDashboardStats(),
          adminAPI.getRecentBookings()
        ]);

        const s = statsRes.data;
        // Check if s.error exists (from my Java fallback)
        if (s.error) {
          console.warn("Backend reported an error, using fallbacks:", s.error);
        }

        setStats([
          { label: 'Total Tours', value: s.totalTours ?? 0, change: '+12%', changeType: 'positive' },
          { label: 'Total Bookings', value: s.totalBookings ?? 0, change: '+23%', changeType: 'positive' },
          { label: 'Active Users', value: s.totalCustomers ?? 0, change: '+18%', changeType: 'positive' },
          { label: 'Revenue', value: `₹${(s.totalRevenue ?? 0).toLocaleString()}`, change: '+31%', changeType: 'positive' }
        ]);

        if (Array.isArray(bookingsRes.data)) {
          setRecentBookingsData(bookingsRes.data.map(b => [
            `B${b.bookingId}`,
            b.customerName || `Customer #${b.customerId || '?'}`,
            b.tourName || `Tour #${b.tourId || '?'}`,
            b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'N/A',
            `₹${(b.totalAmount ?? 0).toLocaleString()}`,
            b.statusName || b.status || 'Confirmed'
          ]));
        }

      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const bookingHeaders = ['ID', 'Customer', 'Tour', 'Date', 'Amount', 'Status'];

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setUploadMsg("Please select a CSV file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      setUploadMsg("Uploading...");
      await adminAPI.uploadItinerary(formData);
      setUploadMsg("CSV uploaded successfully ✅");
    } catch (err) {
      console.error(err);
      setUploadMsg(err.response?.data?.message || "Upload failed ❌");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-100 mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 mb-8">Manage tours, bookings, and customers</p>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: '#7c5cff', borderTopColor: 'transparent' }}></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 card-hover">
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                  <span className={`text-sm font-medium ${stat.changeType === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stat.change}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Bookings Table */}
            <div className="lg:col-span-2 card p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Recent Bookings</h2>
              {recentBookingsData.length > 0 ? (
                <Table
                  headers={bookingHeaders}
                  data={recentBookingsData}
                  className="text-sm"
                />
              ) : (
                <p className="text-center py-8 text-slate-500 italic">No bookings found yet.</p>
              )}
            </div>

            {/* Admin Actions */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-100 mb-4">Upload Itinerary</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed rounded-xl p-4 text-center" style={{ borderColor: 'var(--color-border-strong)' }}>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files[0])}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <div className="gradient-text font-medium hover:opacity-80">
                        {csvFile ? csvFile.name : 'Choose CSV File'}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Maximum size: 5MB</p>
                    </label>
                  </div>
                  <button
                    onClick={handleCsvUpload}
                    disabled={!csvFile}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    Upload Itinerary
                  </button>
                  {uploadMsg && (
                    <p className={`text-sm text-center ${uploadMsg.includes('❌') ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {uploadMsg}
                    </p>
                  )}
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-4">
                <button className="btn-secondary w-full text-left flex justify-between items-center group">
                  <span>Add New Tour</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
                <button className="btn-secondary w-full text-left flex justify-between items-center group">
                  <span>Manage Users</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
                <button className="btn-secondary w-full text-left flex justify-between items-center group">
                  <span>View Reports</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <Routes>
        <Route path="/tours" element={<div>Tour Management</div>} />
        <Route path="/categories" element={<div>Category Management</div>} />
        <Route path="/bookings" element={<div>Booking Management</div>} />
        <Route path="/customers" element={<div>Customer Management</div>} />
        <Route path="/reports" element={<div>Reports</div>} />
      </Routes>
    </div>
  );
};

export default AdminDashboard;
