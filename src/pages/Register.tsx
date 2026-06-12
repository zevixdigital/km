import { useState, useEffect, useRef } from 'react';
import { ref, push, set, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';
import gsap from 'gsap';
import {
  User, Mail, School, Users, MapPin,
  Upload, AlertCircle, CheckCircle, FileText, Image, Loader2, Search, ChevronDown
} from 'lucide-react';

const sports = [
  'Cricket', 'Volleyball', 'Wrestling', 'Athletics', 'Tug of War', 
  'Kabaddi', 'Football', 'Kho-Kho', 'Boxing', 'Judo', 'Badminton', 'Weightlifting'
];

// 7 Official Blocks of Nuh District
const NUH_BLOCKS = [
  'Nuh', 'Taoru', 'Nagina', 'Ferozepur Jhirka', 'Punahana', 'Pinangwan', 'Indri'
];

export default function Register() {
  const formRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState({ lastDate: '', formEnabled: true });
  const [loading, setLoading] = useState(false);

  // Dropdown & Search UI States
  const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);
  const [blockSearch, setBlockSearch] = useState('');
  const [manualBlock, setManualBlock] = useState(false);

  const [uploadProgress, setUploadProgress] = useState({
    idProof: false,
    photo: false,
    certificate: false,
  });

  const [form, setForm] = useState({
    studentName: '',
    fatherName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    schoolName: '',
    state: 'Haryana',       // Fixed natively
    district: 'Nuh (Mewat)', // Fixed natively
    block: '',
    village: '',             // 100% Manual input text
    pincode: '',             // 100% Manual input text
    address: '',
    sport: '',
  });

  const [urls, setUrls] = useState({
    idProofUrl: '',
    photoUrl: '',
    certificateUrl: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snapshot = await get(ref(db, 'settings'));
        if (snapshot.exists()) setSettings(snapshot.val());
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!formRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(formRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }, formRef.current);
    return () => ctx.revert();
  }, []);

  // Close custom block panel on clicking outside window viewport area
  useEffect(() => {
    const closeDropdown = () => setBlockDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, []);

  const handleFileChange = async (field: 'idProof' | 'photo' | 'certificate', file: File | null) => {
    if (!file) return;
    try {
      setUploadProgress(prev => ({ ...prev, [field]: true }));
      const url = await uploadToCloudinary(file, field);
      setUrls(prev => ({ ...prev, [`${field}Url`]: url }));
      toast.success("Document uploaded successfully.");
    } catch (err) {
      toast.error("Failed to upload document.");
    } finally {
      setUploadProgress(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentName || !form.fatherName || !form.dateOfBirth || !form.gender ||
        !form.email || !form.phone || !form.schoolName || !form.district || 
        !form.block || !form.village || !form.pincode || !form.address || !form.sport || 
        !urls.idProofUrl || !urls.photoUrl) {
      toast.error('Please complete all required fields and upload files.');
      return;
    }

    setLoading(true);
    try {
      const registrationRef = push(ref(db, 'registrations'));
      await set(registrationRef, {
        id: registrationRef.key,
        ...form,
        idProofUrl: urls.idProofUrl,
        photoUrl: urls.photoUrl,
        certificateUrl: urls.certificateUrl,
        submittedAt: Date.now(),
        status: 'pending',
      });

      toast.success('Registration submitted successfully!');
      setForm({
        studentName: '', fatherName: '', dateOfBirth: '', gender: '',
        email: '', phone: '', schoolName: '', state: 'Haryana', district: 'Nuh (Mewat)',
        block: '', village: '', pincode: '', address: '', sport: '',
      });
      setUrls({ idProofUrl: '', photoUrl: '', certificateUrl: '' });
      setManualBlock(false);
    } catch (err) {
      toast.error('Failed to save registration details.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBlocks = NUH_BLOCKS.filter(b => b.toLowerCase().includes(blockSearch.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#F7F2E9] pt-24 pb-16 font-sans">
      <div ref={formRef} className="max-w-[800px] mx-auto px-4 sm:px-6 w-full">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Student Registration Form
          </h1>
          <p className="text-slate-600 text-sm">
            Please fill out the form carefully with valid information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-8 shadow-sm">
          
          {/* Section 1: Personal Details */}
          <div>
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-[#f37022]" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Student Name *</label>
                <input
                  type="text"
                  value={form.studentName}
                  onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Father's Name *</label>
                <input
                  type="text"
                  value={form.fatherName}
                  onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                  placeholder="Enter father's name"
                  required
                />
              </div>
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Date of Birth *</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Gender *</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div>
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="w-4 h-4 text-[#f37022]" />
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Mobile Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                  placeholder="10-digit phone number"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Address Details */}
          <div>
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-[#f37022]" />
              Address Details
            </h3>
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* State Input - Fixed and Disabled */}
                <div>
                  <label className="text-slate-400 text-xs font-semibold mb-1 block">State</label>
                  <input
                    type="text"
                    value={form.state}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-500 text-sm font-medium cursor-not-allowed"
                  />
                </div>

                {/* District Input - Fixed and Disabled */}
                <div>
                  <label className="text-slate-400 text-xs font-semibold mb-1 block">District</label>
                  <input
                    type="text"
                    value={form.district}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-500 text-sm font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Searchable Block Picker Dropdown */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <label className="text-slate-700 text-xs font-semibold mb-1 block">Block / Tehsil *</label>
                  {manualBlock ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={form.block}
                        onChange={(e) => setForm({ ...form, block: e.target.value })}
                        placeholder="Type Block Name Manually"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => { setManualBlock(false); setForm(prev => ({ ...prev, block: '' })); }}
                        className="absolute right-3 top-2 text-xs text-[#f37022] hover:underline font-semibold"
                      >
                        Reset List
                      </button>
                    </div>
                  ) : (
                    <>
                      <div 
                        onClick={() => setBlockDropdownOpen(!blockDropdownOpen)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm flex items-center justify-between cursor-pointer select-none"
                      >
                        <span className={form.block ? 'text-slate-900' : 'text-slate-400'}>
                          {form.block || 'Search or Select Block'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>

                      {blockDropdownOpen && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input 
                              type="text"
                              value={blockSearch}
                              onChange={(e) => setBlockSearch(e.target.value)}
                              placeholder="Search block..."
                              className="w-full bg-transparent text-xs text-slate-800 outline-none"
                            />
                          </div>
                          {filteredBlocks.map(b => (
                            <div 
                              key={b}
                              onClick={() => { setForm(prev => ({ ...prev, block: b })); setBlockDropdownOpen(false); setBlockSearch(''); }}
                              className="px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              {b}
                            </div>
                          ))}
                          <div 
                            onClick={() => { setManualBlock(true); setBlockDropdownOpen(false); setForm(prev => ({ ...prev, block: '' })); }}
                            className="px-3.5 py-2 text-sm text-[#f37022] font-bold border-t border-slate-100 hover:bg-orange-50 cursor-pointer"
                          >
                            Can't find? Type manually
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Village Input - Changed to 100% Manual Plain Text Input */}
                <div>
                  <label className="text-slate-700 text-xs font-semibold mb-1 block">Village / Area *</label>
                  <input
                    type="text"
                    value={form.village}
                    onChange={(e) => setForm({ ...form, village: e.target.value })}
                    placeholder="Enter your Village name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Pincode Input - Manual Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 text-xs font-semibold mb-1 block">Pincode *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                    placeholder="Enter 6-digit pincode"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Full Street Address *</label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none resize-none"
                  rows={2}
                  placeholder="House number, landmark, sector, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: School & Sport Details */}
          <div>
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <School className="w-4 h-4 text-[#f37022]" />
              School & Sport Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">School Name *</label>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                  placeholder="Enter school name"
                  required
                />
              </div>
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Select Sport *</label>
                <select
                  value={form.sport}
                  onChange={(e) => setForm({ ...form, sport: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                  required
                >
                  <option value="">Choose a sport</option>
                  {sports.map((sport) => (
                    <option key={sport} value={sport.toLowerCase()}>{sport}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Document Upload */}
          <div>
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Upload className="w-4 h-4 text-[#f37022]" />
              Upload Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* ID Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors hover:border-slate-300">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <FileText className="w-6 h-6 text-[#f37022]" />
                  <span className="text-slate-800 text-xs font-semibold text-center">ID Proof *</span>
                  <p className="text-[10px] text-slate-400 text-center">Aadhar or School ID</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('idProof', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {uploadProgress.idProof ? (
                    <Loader2 className="w-4 h-4 text-[#f37022] animate-spin mt-1" />
                  ) : urls.idProofUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  ) : (
                    <span className="text-[#f37022] text-xs font-bold mt-1">Upload File</span>
                  )}
                </label>
              </div>

              {/* Photo */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors hover:border-slate-300">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Image className="w-6 h-6 text-[#f37022]" />
                  <span className="text-slate-800 text-xs font-semibold text-center">Passport Photo *</span>
                  <p className="text-[10px] text-slate-400 text-center">Recent passport size</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('photo', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {uploadProgress.photo ? (
                    <Loader2 className="w-4 h-4 text-[#f37022] animate-spin mt-1" />
                  ) : urls.photoUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  ) : (
                    <span className="text-[#f37022] text-xs font-bold mt-1">Upload Image</span>
                  )}
                </label>
              </div>

              {/* Sports Certificate */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors hover:border-slate-300">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <FileText className="w-6 h-6 text-[#f37022]" />
                  <span className="text-slate-800 text-xs font-semibold text-center">Sports Certificate</span>
                  <p className="text-[10px] text-slate-400 text-center">Previous record (Optional)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('certificate', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {uploadProgress.certificate ? (
                    <Loader2 className="w-4 h-4 text-[#f37022] animate-spin mt-1" />
                  ) : urls.certificateUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  ) : (
                    <span className="text-[#f37022] text-xs font-bold mt-1">Upload File</span>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Form Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f37022] text-white py-3 rounded-lg font-bold text-sm transition-colors hover:bg-[#e26212] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Registration...
              </>
            ) : (
              'Submit Registration'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}