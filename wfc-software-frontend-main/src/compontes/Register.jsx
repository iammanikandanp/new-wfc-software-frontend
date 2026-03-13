import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Upload, X } from "lucide-react";

export const Register = () => {
  const [step, setStep] = useState(1);
  const [bmiStatus, setBmiStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({
    frontBodyImage: null,
    sideBodyImage: null,
    backBodyImage: null
  });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Step 1: Basic Information
    fullName: "",
    age: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    emergencyContact: "",
    medicalConditions: "",
    
    // Step 2: Body Measurements
    gender: "",
    height: "",
    weight: "",
    waist: "",
    hip: "",
    chest: "",
    arm: "",
    thigh: "",
    
    // Calculated fields
    bmi: "",
    waistHipRatio: "",
    fitnessCategory: "",
    
    // Step 3: Address Details
    profession: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    
    // Step 4: Progress Photos
    frontBodyImage: null,
    sideBodyImage: null,
    backBodyImage: null
  });

  useEffect(() => {
    const { height, weight } = formData;
    if (height && weight) {
      const h = parseFloat(height) / 100; // convert cm to meters
      const w = parseFloat(weight);
      const bmi = w / (h * h);
      const bmiVal = bmi.toFixed(1);
      let category = "";
      if (bmi < 18.5) category = "Underweight";
      else if (bmi < 24.9) category = "Normal";
      else if (bmi < 29.9) category = "Overweight";
      else category = "Obese";
      setFormData(prev => ({ ...prev, bmi: bmiVal, fitnessCategory: category }));
      setBmiStatus(category);
    }
  }, [formData.height, formData.weight]);

  useEffect(() => {
    const { waist, hip } = formData;
    if (waist && hip) {
      const waistHipRatio = (parseFloat(waist) / parseFloat(hip)).toFixed(2);
      setFormData(prev => ({ ...prev, waistHipRatio }));
    }
  }, [formData.waist, formData.hip]);

  const getCurrentFields = () => {
    // All fields are optional, so we just return empty array
    // This allows users to proceed without filling all fields
    return [];
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const removeImage = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: null }));
    setImagePreviews(prev => ({ ...prev, [fieldName]: null }));
  };

  const isValidPhone = phone => /^\d{10}$/.test(phone);

  const handleNext = () => {
    // Validate phone numbers only if they are filled
    if (step === 1) {
      if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
        return toast.error("Invalid 10-digit phone number");
      }
      if (formData.emergencyContact && formData.emergencyContact.trim() && !isValidPhone(formData.emergencyContact)) {
        return toast.error("Invalid emergency contact phone number");
      }
    }
    
    if (step < 4) setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      
      // Map the form data to backend expected fields
      data.append('name', formData.fullName);
      data.append('age', formData.age);
      data.append('gender', formData.gender);
      data.append('emails', formData.email);
      data.append('phone', formData.phoneNumber);
      data.append('profession', formData.profession);
      data.append('address', `${formData.address}, ${formData.city}, ${formData.state}`); // Combine address fields
      data.append('pincode', formData.pincode);
      data.append('height', formData.height);
      data.append('weight', formData.weight);
      data.append('bmi', formData.bmi || '');
      data.append('waist', formData.waist);
      data.append('hip', formData.hip);
      data.append('description', formData.medicalConditions || 'None'); // Map medical conditions to description
      
      // Add images
      if (formData.frontBodyImage) data.append('frontBodyImage', formData.frontBodyImage);
      if (formData.sideBodyImage) data.append('sideBodyImage', formData.sideBodyImage);
      if (formData.backBodyImage) data.append('backBodyImage', formData.backBodyImage);
      
      // Add required fields with defaults
      data.append('bloodGroup', 'O+');
      data.append('issues', 'None');
      data.append('packages', 'Basic');
      data.append('duration', '1');
      data.append('services', 'No');
      data.append('startDate', new Date().toISOString().split('T')[0]);
      data.append('endDate', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 30 days from now
      data.append('bloodPressure', '120/80');
      data.append('sugarLevel', '100');
      data.append('neck', '30'); // Default neck measurement
      data.append('bodyFat', '15'); // Default body fat percentage

      const response = await axios.post("https://wfc-backend-software.onrender.com/api/v1/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response) toast.success(response.data.message);
      navigate("/dashboard");
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || "Submission failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-gray-800 font-bold text-2xl sm:text-xl mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" />
              <Input label="Age" name="age" value={formData.age} onChange={handleChange} type="number" placeholder="Enter your age" />
              <Input label="Date of Birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} type="date" />
              <Input label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} type="tel" placeholder="10-digit phone number" />
              <Input label="Email" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Enter your email" />
              <Input label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} type="tel" placeholder="Emergency contact number" required={false} />
            </div>
            <div className="mt-4">
              <Input label="Medical Conditions" name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} placeholder="List any medical conditions or leave blank" required={false} isTextArea={true} />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="text-gray-800 font-bold text-2xl sm:text-xl mb-6">Body Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
              <Input label="Height (cm)" name="height" value={formData.height} onChange={handleChange} type="number" placeholder="e.g., 180" />
              <Input label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} type="number" placeholder="e.g., 75" />
              <Input label="Waist (cm)" name="waist" value={formData.waist} onChange={handleChange} type="number" placeholder="e.g., 85" />
              <Input label="Hip (cm)" name="hip" value={formData.hip} onChange={handleChange} type="number" placeholder="e.g., 95" />
              <Input label="Chest (cm)" name="chest" value={formData.chest} onChange={handleChange} type="number" placeholder="e.g., 100" />
              <Input label="Arm (cm)" name="arm" value={formData.arm} onChange={handleChange} type="number" placeholder="e.g., 32" />
              <Input label="Thigh (cm)" name="thigh" value={formData.thigh} onChange={handleChange} type="number" placeholder="e.g., 55" />
            </div>
            
            {formData.bmi && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-3">📊 Auto Calculations</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-gray-600">BMI</p>
                    <p className="text-lg font-bold text-gray-800">{formData.bmi}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg col-span-2 md:col-span-1">
                    <p className="text-xs text-gray-600">Fitness</p>
                    <p className={`text-lg font-bold ${bmiStatus === "Normal" ? "text-green-600" : bmiStatus === "Underweight" ? "text-blue-600" : "text-orange-600"}`}>
                      {bmiStatus}
                    </p>
                  </div>
                  {formData.waistHipRatio && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Waist-Hip</p>
                      <p className="text-lg font-bold text-gray-800">{formData.waistHipRatio}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        );
      case 3:
        return (
          <>
            <h3 className="text-gray-800 font-bold text-2xl sm:text-xl mb-6">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Profession" name="profession" value={formData.profession} onChange={handleChange} placeholder="Enter your profession" />
              <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Enter city name" />
              <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="Enter state name" />
              <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="Enter pincode" />
            </div>
            <div className="mt-4">
              <Input label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Enter full address" isTextArea={true} />
            </div>
          </>
        );
      case 4:
        return (
          <>
            <h3 className="text-gray-800 font-bold text-2xl sm:text-xl mb-6">Progress Photos</h3>
            <p className="text-sm text-gray-600 mb-6">Upload photos of your body from different angles for transformation tracking</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageUploadField 
                label="Front Body Photo" 
                name="frontBodyImage" 
                onChange={handleImageChange}
                preview={imagePreviews.frontBodyImage}
                onRemove={() => removeImage('frontBodyImage')}
              />
              <ImageUploadField 
                label="Side Body Photo" 
                name="sideBodyImage" 
                onChange={handleImageChange}
                preview={imagePreviews.sideBodyImage}
                onRemove={() => removeImage('sideBodyImage')}
              />
              <ImageUploadField 
                label="Back Body Photo" 
                name="backBodyImage" 
                onChange={handleImageChange}
                preview={imagePreviews.backBodyImage}
                onRemove={() => removeImage('backBodyImage')}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {[1, 2, 3, 4].map((num) => (
          <React.Fragment key={num}>
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all
              ${step === num
                  ? "bg-blue-600 text-white shadow-lg scale-110"
                  : step > num
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-gray-600"}`}>
              {step > num ? "✓" : num}
            </div>
            {num < 4 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                step > num ? "bg-green-500" : "bg-gray-300"
              }`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Basic Info</span>
        <span>Measurements</span>
        <span>Address</span>
        <span>Photos</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Join Our Fitness Family</h1>
            <p className="text-gray-600">Complete your registration in 4 simple steps</p>
          </div>

          {/* Step Indicator */}
          <StepIndicator />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="bg-gray-50 p-6 sm:p-8 rounded-xl">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  ← Back
                </button>
              )}
              <div className="flex-1"></div>
              {step < 4 ? (
                <button 
                  type="button" 
                  onClick={handleNext}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Next →
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Registering...
                    </span>
                  ) : (
                    "✓ Complete Registration"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Progress text */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>Step {step} of 4</p>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, isTextArea, ...props }) => (
  <div className="mb-3">
    <label className="block mb-2 text-sm font-semibold text-gray-700">{label}</label>
    {isTextArea ? (
      <textarea
        className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        rows="4"
        {...props}
      />
    ) : (
      <input
        className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        {...props}
      />
    )}
  </div>
);

const Select = ({ label, name, value, onChange, options }) => (
  <div className="mb-3">
    <label className="block mb-2 text-sm font-semibold text-gray-700">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border-2 border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white cursor-pointer"
    >
      <option value="" disabled hidden>
        Select an option
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

const ImageUploadField = ({ label, name, onChange, preview, onRemove }) => (
  <div className="bg-white p-4 rounded-lg border-2 border-gray-300 transition-all hover:border-blue-500">
    <label className="block mb-3 text-sm font-semibold text-gray-700">{label}</label>
    
    {preview ? (
      <div className="relative">
        <img 
          src={preview} 
          alt={label} 
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
        >
          <X size={18} />
        </button>
        <label className="block">
          <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-semibold">
            Change Image
          </span>
          <input
            type="file"
            name={name}
            onChange={onChange}
            accept="image/*"
            className="hidden"
          />
        </label>
      </div>
    ) : (
      <label className="block cursor-pointer">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all">
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">Click to upload or drag & drop</p>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
        <input
          type="file"
          name={name}
          onChange={onChange}
          accept="image/*"
          className="hidden"
        />
      </label>
    )}
  </div>
);

export default Register;
