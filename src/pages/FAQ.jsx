import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const FAQS = [
  {
    q: 'How do I book a tour?',
    a: 'Browse tours, pick a package, choose your departure date, add passenger details, and pay securely via Razorpay. You\'ll get instant confirmation.',
  },
  {
    q: 'Can I cancel my booking?',
    a: 'Yes. Go to "My Bookings" and click Cancel on any upcoming booking. If you already paid, a refund is initiated automatically to your original payment method.',
  },
  {
    q: 'How long does a refund take?',
    a: 'Refunds are initiated immediately on cancellation and typically reflect in your account within 5-7 business days, depending on your bank.',
  },
  {
    q: 'Is my payment information safe?',
    a: 'Yes. All payments are processed through Razorpay, a PCI-DSS compliant payment gateway. We never store your card details.',
  },
  {
    q: 'How do I get my invoice?',
    a: 'Open "My Bookings", find your booking, and click Invoice to download a PDF, or Send Mail to have it emailed to you.',
  },
  {
    q: 'Can I change my travel dates after booking?',
    a: 'Currently date changes require cancelling the existing booking and creating a new one for your preferred date.',
  },
  {
    q: 'Do children get a discount?',
    a: 'Yes, child pricing (with or without an extra bed) is shown separately from adult pricing on every tour\'s package details.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3">Help Center</h1>
        <p className="text-slate-400">Answers to common questions about booking, payments, and cancellations</p>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, index) => (
          <div key={index} className="card overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-medium text-slate-100">{item.q}</span>
              <ChevronDownIcon
                className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
              />
            </button>
            {openIndex === index && (
              <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed animate-fade-in">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 text-center text-sm text-slate-500">
        Still need help? Reach us at{' '}
        <a href="mailto:etourvirtugo@gmail.com" className="gradient-text font-medium">etourvirtugo@gmail.com</a>
      </div>
    </div>
  );
};

export default FAQ;
