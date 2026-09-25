import React from 'react';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-slate-100 mb-2">{title}</h2>
    <div className="text-slate-400 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const PrivacyPolicy = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">Privacy Policy</h1>
    <p className="text-slate-500 text-sm mb-10">Last updated: January 2026</p>

    <Section title="Information We Collect">
      <p>When you create an account or make a booking, we collect your name, email, phone number, address, and payment details necessary to process your booking. Payment card details are handled entirely by our payment processor, Razorpay, and are never stored on our servers.</p>
    </Section>

    <Section title="How We Use Your Information">
      <p>We use your information to process bookings, send confirmation emails, respond to support requests, and improve our services. We do not sell your personal information to third parties.</p>
    </Section>

    <Section title="Data Security">
      <p>We use industry-standard encryption for data in transit and secure authentication for all accounts. Passwords are hashed and never stored in plain text.</p>
    </Section>

    <Section title="Cookies">
      <p>We use browser local storage to remember preferences like your wishlist and recently viewed tours. This data stays on your device and is not sent to our servers.</p>
    </Section>

    <Section title="Your Rights">
      <p>You can update or delete your profile information at any time from your account settings, or contact us to request full account deletion.</p>
    </Section>

    <Section title="Contact">
      <p>Questions about this policy? Email us at etourvirtugo@gmail.com.</p>
    </Section>
  </div>
);

export default PrivacyPolicy;
