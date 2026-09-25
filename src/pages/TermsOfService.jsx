import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-slate-100 mb-2">{title}</h2>
    <div className="text-slate-400 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsOfService = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">Terms of Service</h1>
    <p className="text-slate-500 text-sm mb-10">Last updated: January 2026</p>

    <Section title="Booking Confirmation">
      <p>A booking is confirmed only after full payment is received and processed successfully through our payment gateway. You will receive an email confirmation once your booking is confirmed.</p>
    </Section>

    <Section title="Cancellations & Refunds">
      <p>You may cancel a booking at any time from "My Bookings." If payment was already made, a refund is initiated automatically to your original payment method and typically reflects within 5-7 business days.</p>
    </Section>

    <Section title="Pricing">
      <p>All prices are displayed in Indian Rupees (₹) and are per person unless stated otherwise. Prices are subject to change until a booking is confirmed with payment.</p>
    </Section>

    <Section title="Traveler Responsibilities">
      <p>You are responsible for ensuring all passenger details (name, date of birth) are accurate at the time of booking, and for holding valid travel documents required for your destination.</p>
    </Section>

    <Section title="Limitation of Liability">
      <p>Virtugo acts as a booking platform connecting travelers with tour packages. We are not liable for delays, cancellations, or events outside our reasonable control (weather, third-party operators, force majeure).</p>
    </Section>

    <Section title="Changes to These Terms">
      <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
    </Section>
  </div>
);

export default TermsOfService;
