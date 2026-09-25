import React, { useState, useEffect } from 'react';
import { useBooking } from '../../context/BookingContext';
import Card from '../UI/Card';
import TextInput from './TextInput';
import DatePicker from './DatePicker';
import RadioGroup from './RadioGroup';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const PassengerForm = () => {
  const { passengers, addPassenger, updatePassenger, removePassenger, setStep, selectedDeparture: departure, travelerCounts } = useBooking();
  const [errors, setErrors] = useState({});

  // Prefill passenger rows from the adults/children counts carried over from
  // search, so the user isn't starting from a blank list. They can still
  // add/remove rows afterward.
  useEffect(() => {
    if (passengers.length > 0) return;

    const adults = Math.max(1, travelerCounts?.adults || 1);
    const children = Math.max(0, travelerCounts?.children || 0);

    for (let i = 0; i < adults; i++) {
      addPassenger({
        pax_name: '',
        pax_birthdate: '',
        pax_type: 'adult',
        is_extra: i > 0,
        isSingleRoom: false,
      });
    }
    for (let i = 0; i < children; i++) {
      addPassenger({
        pax_name: '',
        pax_birthdate: '',
        pax_type: 'child_with_bed',
        is_extra: true,
        isSingleRoom: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passengerTypes = [
    { value: 'adult', label: 'Adult' },
    { value: 'child_with_bed', label: 'Child (with bed)' },
    { value: 'child_without_bed', label: 'Child (without bed)' },
  ];

  // [NEW] Helper to calculate age
  const calculateAge = (dob, departureDate) => {
    if (!dob || !departureDate) return 0;
    const birthDate = new Date(dob);
    const depDate = new Date(departureDate);
    let age = depDate.getFullYear() - birthDate.getFullYear();
    const m = depDate.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && depDate.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validatePassenger = (passenger) => {
    const newErrors = {};

    if (!passenger.pax_name.trim()) {
      newErrors.pax_name = 'Name is required';
    }

    if (!passenger.pax_birthdate) {
      newErrors.pax_birthdate = 'Birth date is required';
    }

    if (!passenger.pax_type) {
      newErrors.pax_type = 'Passenger type is required';
    }

    return newErrors;
  };

  const handlePassengerChange = (index, field, value) => {
    // [NEW] Auto-Calculate Type Logic
    let updatedPassenger = { ...passengers[index], [field]: value };

    if (field === 'pax_birthdate' && departure?.departDate) {
       const age = calculateAge(value, departure.departDate);
       let type = 'adult';
       
       if (age < 1) type = 'infant';
       else if (age <= 12) type = 'child_with_bed'; 
       
       updatedPassenger.pax_type = type;
    }

    updatePassenger(index, updatedPassenger);

    if (errors[index] && errors[index][field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const addNewPassenger = () => {
    const newPassenger = {
      pax_name: '',
      pax_birthdate: '',
      pax_type: 'adult',
      is_extra: passengers.length > 0,
      isSingleRoom: false // [NEW] Default to sharing
    };
    addPassenger(newPassenger);
  };

  const removePassengerHandler = (index) => {
    removePassenger(index);
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const validateAllPassengers = () => {
    const newErrors = {};
    let isValid = true;

    passengers.forEach((passenger, index) => {
      const passengerErrors = validatePassenger(passenger);
      if (Object.keys(passengerErrors).length > 0) {
        newErrors[index] = passengerErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateAllPassengers()) {
      setStep(3);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-6">
          Passenger Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {passengers.map((passenger, index) => (
            <div key={index} className="border rounded-xl p-4" style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-slate-100">
                  Passenger {index + 1}
                  {passenger.is_extra && (
                    <span className="ml-2 text-sm text-[#22d3ee]">(Extra)</span>
                  )}
                </h3>
                {passengers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePassengerHandler(index)}
                    className="text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextInput
                  label="Full Name"
                  name={`pax_name_${index}`}
                  value={passenger.pax_name}
                  onChange={(e) => handlePassengerChange(index, 'pax_name', e.target.value)}
                  error={errors[index]?.pax_name}
                  placeholder="Enter passenger name"
                  required
                />

                {/* Gender Removed as per user request */}

                <DatePicker
                  label="Birth Date"
                  name={`pax_birthdate_${index}`}
                  value={passenger.pax_birthdate}
                  onChange={(e) => handlePassengerChange(index, 'pax_birthdate', e.target.value)}
                  error={errors[index]?.pax_birthdate}
                  required
                />
              </div>

                {/* [NEW] Type Display & Bed Option */}
                <div className="p-3 rounded-lg border mt-4" style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Type</span>
                      <p className="font-medium text-slate-200 capitalize">
                         {passenger.pax_type.replace(/_/g, ' ')}
                      </p>
                    </div>

                    {/* Show 'Extra Bed' Toggle ONLY for Children (1-12) */}
                    {(passenger.pax_type === 'child_with_bed' || passenger.pax_type === 'child_without_bed') && (
                      <div className="flex items-center">
                        <input
                          id={`bed-${index}`}
                          type="checkbox"
                          checked={passenger.pax_type === 'child_with_bed'}
                          onChange={(e) => {
                            const newType = e.target.checked ? 'child_with_bed' : 'child_without_bed';
                            handlePassengerChange(index, 'pax_type', newType);
                          }}
                          className="h-4 w-4 accent-[#7c5cff] rounded"
                        />
                        <label htmlFor={`bed-${index}`} className="ml-2 block text-sm text-slate-300 cursor-pointer">
                          Need Extra Bed?
                        </label>
                      </div>
                    )}

                    {/* [NEW] 'Separate Room' Toggle for Adults (Only for Co-Passengers) */}
                    {passenger.pax_type === 'adult' && index > 0 && (
                      <div className="flex items-center">
                        <input
                          id={`room-${index}`}
                          type="checkbox"
                          checked={passenger.isSingleRoom || false}
                          onChange={(e) => {
                            handlePassengerChange(index, 'isSingleRoom', e.target.checked);
                          }}
                          className="h-4 w-4 accent-[#7c5cff] rounded"
                        />
                        <label htmlFor={`room-${index}`} className="ml-2 block text-sm text-slate-300 cursor-pointer">
                          Separate Room?
                        </label>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              type="button"
              onClick={addNewPassenger}
              className="flex items-center gradient-text font-medium px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Another Passenger
            </button>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary w-full sm:w-auto text-center justify-center"
              >
                Back
              </button>
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto text-center justify-center"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default PassengerForm;
