import React, { useEffect, useState } from 'react';
import { adminTourAPI } from '../../api';
import { toast } from 'react-toastify';

const emptyForm = {
  categoryName: '',
  catCode: '',
  subcatCode: '^',
  imagePath: '',
  jumpFlag: true,
  singlePersonCost: '',
  extraPersonCost: '',
  childWithBedCost: '',
  childWithoutBedCost: '',
  validFrom: '',
  validTo: '',
  departDate: '',
  endDate: '',
  noOfDays: '',
  itineraries: [{ dayNo: 1, itineraryDetail: '', dayWiseImage: '' }],
};

const AdminTours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await adminTourAPI.list();
      setTours(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleItineraryChange = (index, field, value) => {
    setForm((f) => {
      const itineraries = [...f.itineraries];
      itineraries[index] = { ...itineraries[index], [field]: value };
      return { ...f, itineraries };
    });
  };

  const addItineraryDay = () => {
    setForm((f) => ({
      ...f,
      itineraries: [...f.itineraries, { dayNo: f.itineraries.length + 1, itineraryDetail: '', dayWiseImage: '' }],
    }));
  };

  const removeItineraryDay = (index) => {
    setForm((f) => ({ ...f, itineraries: f.itineraries.filter((_, i) => i !== index) }));
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (tour) => {
    setForm({
      categoryName: tour.categoryName || '',
      catCode: tour.categoryCode || '',
      subcatCode: tour.subCategoryCode || '^',
      imagePath: tour.imagePath || '',
      jumpFlag: tour.jumpFlag ?? true,
      singlePersonCost: tour.costs?.[0]?.singlePersonCost ?? '',
      extraPersonCost: tour.costs?.[0]?.extraPersonCost ?? '',
      childWithBedCost: tour.costs?.[0]?.childWithBedCost ?? '',
      childWithoutBedCost: tour.costs?.[0]?.childWithoutBedCost ?? '',
      validFrom: tour.costs?.[0]?.validFrom ?? '',
      validTo: tour.costs?.[0]?.validTo ?? '',
      departDate: tour.departures?.[0]?.departDate ?? '',
      endDate: tour.departures?.[0]?.endDate ?? '',
      noOfDays: tour.departures?.[0]?.noOfDays ?? '',
      itineraries: tour.itineraries?.length
        ? tour.itineraries.map((i) => ({ dayNo: i.dayNo, itineraryDetail: i.itineraryDetail, dayWiseImage: i.dayWiseImage || '' }))
        : emptyForm.itineraries,
    });
    setEditingId(tour.categoryId);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        singlePersonCost: Number(form.singlePersonCost),
        extraPersonCost: Number(form.extraPersonCost),
        childWithBedCost: Number(form.childWithBedCost),
        childWithoutBedCost: Number(form.childWithoutBedCost),
        noOfDays: Number(form.noOfDays),
      };

      if (editingId) {
        await adminTourAPI.update(editingId, payload);
        toast.success('Tour updated');
      } else {
        await adminTourAPI.create(payload);
        toast.success('Tour created');
      }
      setShowForm(false);
      fetchTours();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save tour');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Delete this tour package? This cannot be undone.')) return;
    try {
      await adminTourAPI.remove(categoryId);
      toast.success('Tour deleted');
      fetchTours();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete tour (it may have existing bookings)');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent" style={{ borderColor: '#7c5cff', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-100">Manage Tour Packages</h2>
        <button onClick={openCreateForm} className="btn-primary text-sm py-2">+ Add New Tour</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-8 space-y-4 animate-slide-up">
          <h3 className="font-semibold text-slate-100">{editingId ? 'Edit Tour' : 'New Tour'}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required placeholder="Tour name (e.g. Bali Getaway)" value={form.categoryName}
              onChange={(e) => handleChange('categoryName', e.target.value)} className="input-field" />
            <input required placeholder="Category code (e.g. BAL)" value={form.catCode}
              onChange={(e) => handleChange('catCode', e.target.value)} className="input-field" />
            <input placeholder="Image URL" value={form.imagePath}
              onChange={(e) => handleChange('imagePath', e.target.value)} className="input-field md:col-span-2" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input required type="number" placeholder="Single person cost" value={form.singlePersonCost}
              onChange={(e) => handleChange('singlePersonCost', e.target.value)} className="input-field" />
            <input required type="number" placeholder="Extra person cost" value={form.extraPersonCost}
              onChange={(e) => handleChange('extraPersonCost', e.target.value)} className="input-field" />
            <input required type="number" placeholder="Child (w/ bed) cost" value={form.childWithBedCost}
              onChange={(e) => handleChange('childWithBedCost', e.target.value)} className="input-field" />
            <input required type="number" placeholder="Child (no bed) cost" value={form.childWithoutBedCost}
              onChange={(e) => handleChange('childWithoutBedCost', e.target.value)} className="input-field" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-xs text-slate-500">Price valid from</label>
              <input required type="date" value={form.validFrom} onChange={(e) => handleChange('validFrom', e.target.value)} className="input-field [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Price valid to</label>
              <input required type="date" value={form.validTo} onChange={(e) => handleChange('validTo', e.target.value)} className="input-field [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Departure date</label>
              <input required type="date" value={form.departDate} onChange={(e) => handleChange('departDate', e.target.value)} className="input-field [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Return date</label>
              <input required type="date" value={form.endDate} onChange={(e) => handleChange('endDate', e.target.value)} className="input-field [color-scheme:dark]" />
            </div>
            <div>
              <label className="text-xs text-slate-500">No. of days</label>
              <input required type="number" value={form.noOfDays} onChange={(e) => handleChange('noOfDays', e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-400">Itinerary</label>
              <button type="button" onClick={addItineraryDay} className="text-xs gradient-text font-medium">+ Add Day</button>
            </div>
            <div className="space-y-2">
              {form.itineraries.map((day, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input type="number" value={day.dayNo} onChange={(e) => handleItineraryChange(index, 'dayNo', Number(e.target.value))}
                    className="input-field w-16 py-1.5 text-sm" title="Day #" />
                  <input value={day.itineraryDetail} onChange={(e) => handleItineraryChange(index, 'itineraryDetail', e.target.value)}
                    placeholder={`Day ${day.dayNo} activity details`} className="input-field flex-1 py-1.5 text-sm" required />
                  {form.itineraries.length > 1 && (
                    <button type="button" onClick={() => removeItineraryDay(index)} className="text-rose-400 hover:text-rose-300 px-2">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary text-sm py-2">
              {saving ? 'Saving...' : editingId ? 'Update Tour' : 'Create Tour'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm py-2">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tours.map((tour) => (
          <div key={tour.categoryId} className="card p-4 flex gap-4">
            {tour.imagePath && (
              <img src={tour.imagePath} alt={tour.categoryName} className="w-20 h-20 rounded-lg object-cover shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-100 truncate">{tour.categoryName}</p>
              <p className="text-xs text-slate-500 mb-2">{tour.categoryCode} · {tour.departures?.[0]?.noOfDays || '—'} days</p>
              {tour.costs?.[0] && (
                <p className="text-sm gradient-text font-semibold">₹{tour.costs[0].singlePersonCost}</p>
              )}
              <div className="flex gap-3 mt-2">
                <button onClick={() => openEditForm(tour)} className="text-xs text-[#22d3ee] hover:opacity-80">Edit</button>
                <button onClick={() => handleDelete(tour.categoryId)} className="text-xs text-rose-400 hover:text-rose-300">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {tours.length === 0 && (
        <p className="text-center text-slate-500 py-8">No tours yet. Add your first one above.</p>
      )}
    </div>
  );
};

export default AdminTours;
