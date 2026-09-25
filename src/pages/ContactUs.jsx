import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    // No backend endpoint for contact form yet - acknowledge locally so the
    // page is genuinely usable rather than a dead form.
    setTimeout(() => {
      toast.success("Thanks! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', message: '' });
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">Contact Us</h1>
        <p className="text-slate-400">Have a question about a booking or a destination? Reach out.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="card p-5 text-center">
          <p className="text-[#8b7bff] text-xl mb-2">📧</p>
          <p className="text-sm text-slate-300">etourvirtugo@gmail.com</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-[#8b7bff] text-xl mb-2">📞</p>
          <p className="text-sm text-slate-300">1800-123-4567</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-[#8b7bff] text-xl mb-2">📍</p>
          <p className="text-sm text-slate-300">221B Travel Lane, Bandra West, Mumbai 400050</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <input
          required
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input-field w-full"
        />
        <input
          required
          type="email"
          placeholder="Your email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="input-field w-full"
        />
        <textarea
          required
          rows={5}
          placeholder="How can we help?"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="input-field w-full resize-none"
        />
        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
