import { useState, useEffect, useRef } from 'react';
import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import gsap from 'gsap';
import {
  User, Mail, School, MapPin,
  Upload, CheckCircle, FileText, Loader2, Search, ChevronDown, CreditCard
} from 'lucide-react';

const sports = [
  'Cricket', 'Volleyball', 'Wrestling', 'Athletics', 'Tug of War', 
  'Kabaddi', 'Football', 'Kho-Kho', 'Boxing', 'Judo', 'Badminton', 'Weightlifting'
];

// Comprehensive Official Dataset for Nuh District Blocks and Villages
const blockVillageData: Record<string, string[]> = {
  Nuh: [
    "Untka", "Adbar", "Akera", "Alawal Pur", "Babupur", "Bai", "Bajhera", 
    "Barka Alimudin", "Bar Oji", "Bhapawali", "Bibipur", "Binwa", "Birsika", 
    "Chandeni", "Devlanangli", "Dhanduka", "Dihana", "Firozepur Namak", "Ghasera", 
    "Husainpur", "Kalinjar", "Kherla", "Kotla", "Malab", "Marora", "Meoli", 
    "Muradbas", "Nalhar", "Palla", "Rai Puri", "Ranika", "Rehna", "Rithora", 
    "Sahpur Nangli", "Salaheri", "Salamba", "Sangail", "Shadai", "Sonkh", 
    "Tain", "Tapkan", "Ujina"
  ],
  Punahana: [
    "Aminabad", "Andhaki", "Badli", "Bandholi", "Bhuriyaki", "Bichhor", "Bisru", 
    "Chandanki", "Dudoli", "Fardari", "Gheeda", "Godhola", "Gubradi", "Gulalta", 
    "Hathangaon", "Hazipur", "Indana", "Jadoli", "Jaiwant", "Jakhokar", "Jamalgarh", 
    "Jehtana", "Jharokari", "Kherla Punhana", "Lafoori", "Leharwari", "Luhinga Kalan", 
    "Madhiyaki", "Mubarikpur", "Naharpur", "Naheda", "Nai", "Neemka", "Newana", 
    "Pemakhera", "Piproli", "Raipur", "Rajpur", "Samsabad Khurd", "Sihiri Singal Heri", 
    "Singar", "Siroli", "Sunheda", "Thek", "Tirwara", "Tundlaka", "Tusaini", 
    "Rahida", "Shikrawa", "Falendi", "Khori Shah Choka", "Badka", "Samsabad"
  ],
  Pingwan: [
    "Akbarpur", "Anchwari", "Aoutha", "Baded", "Basai Khanzada", "Bazidpur", 
    "Bubalheri", "Chandraka", "Dhadolikalan", "Dhana", "Dondal", "Dungeja", 
    "Dungra Shahazadpur", "Firozpur Meo", "Flendi", "Gangwani", "Gokalpur", 
    "Hinganpur", "Jalika", "Jharpuri", "Jhimrawat", "Khanpur Ghati", "Khawajli Kalan", 
    "Khedli Kalan", "Khori Shah Chokha", "Lahabas", "Malhaka", "Mamlika", "Manota", 
    "Mohd. Pur Ter", "Mohlaka", "Mundheta", "Neemkhera", "Papra", "Pinagwan", 
    "Raniyalapatakpur", "Rehpura", "Rithad", "Sikrawa", "Sultanpur Punhana", "Ter"
  ],
  Tauru: [
    "Bawla", "Beri Nisfi", "Bhajlaka", "Bhangoh", "Bissarakbarpur", "Buraka Tauru", 
    "Chahalka", "Cheela", "Chharora", "Chilawali", "Dadu", "Dalawas", "Dhulawat", 
    "Didhara", "Dingerheri", "Fatehpur", "Gogjaka", "Goyla", "Gudhi", "Gwarka", 
    "Hasanpur", "Jafrab...", "Jalalpur Sohna", "Jaurasi", "Jhamuwas", "Kalarpuri", 
    "Kaliyaka", "Kalwari", "Kharkhari", "Khori Kalan", "Khori Khurd", "Kota Khandewla", 
    "M.P.Ahir", "Malhaka", "Mandarka", "Nizampur", "Pachgaon", "Padheni", "Para", 
    "Raheri", "Rangala", "Raniyaki", "Rathwas", "Sabras", "Sahsola", "Salhaka", 
    "Sarai", "Sewka", "Sheelkho", "Shikarpur", "Subaseri", "Sunari", "Sundh", "Uton"
  ],
  "Ferozepur Jhirka": [
    "Agon", "Ahmedbass", "Akhnaka", "Alipur Tigra", "Baghola", "Baikhera", 
    "Basai Meo", "Bhakroj", "Bhond", "Biwan", "Chitora", "Dhamala", "Doha", 
    "F. Jhirka", "Ghata Samsabad", "Gujar Nangla", "Hamjapur", "Hasanpur Bilonda", 
    "Hirwari Bawanteri", "Ibrahimbass", "Kameda", "Kherla Khurd", "Kolgaon", 
    "Luhinga Khurd", "Madapur", "Maholi", "Mahun", "Mohd. Bass (Buchaka)", 
    "Mohd. Bass (Pol)", "Nasirbass", "Nawli", "Padla Shahpuri", "Patan Udaypuri", 
    "Pathrali", "Patkhori", "Ranyala Ferozpur", "Ranyali", "Rawa", "Rawli", 
    "Reegarh", "Sahapur", "Saimeerbass", "Sakarpuri", "Sakras", "Shekhpur", 
    "Sidhrawat", "Sulela", "Tigaon"
  ],
  Nagina: [
    "Aklimpur", "Aklimpur Nuh", "Aterna Samsabad", "Badarpur", "Balai", "Banarsi", 
    "Bhadas", "Bukharaka", "Ganduri", "Ghagas", "Gohana", "Gumat Bihari", 
    "Hasanpur Nuh", "Imam Nagar", "Jaitaka", "Jalalpur Firozpur", "Jalalpur Nuh", 
    "Kansali", "Karheda", "Karhedi", "Khan Mohammadpur", "Khedli Khurd", "Khedli Nuh", 
    "Khushpuri", "Kultajpur Kalan", "Madhi", "Mandi Kheda", "Maroda", "Mohammad Nagar", 
    "Moolthan", "Nagina", "Nai Nangla", "Nangal Mubarikpur", "Notki", "Rajaka", 
    "Ranika", "Sadipur", "Santhawari", "Siswana Jatka", "Sukhpuri", "Sultanpur Nuh", 
    "Uleta", "Umra", "Umri", "Basai"
  ],
  Indri: [
    "Alduka", "Atta", "Bainsi", "Bajarka", "Barota", "Basai", "Bhirawati", 
    "Chhachera", "Chhapera", "Dhenkli", "Dubalu", "Gajarpur", "Gangoli", "Golpuri", 
    "Hasanpur Sohana", "Hilalpur", "Hirmathla", "Indri", "Jai Singh Pur", "Kairaka", 
    "Kaliyaka", "Kanwarsika", "Khanpur", "Khera Khalilpur", "Kheri Kankar", "Kherli Dosa", 
    "Kira", "Kiranj", "Kiranj Patti Jattan", "Kontlaka", "Kurthala", "Kutubgarh", 
    "Mahrola", "Manuwas", "Naushera", "Rahuka", "Rewasan", "Rozkameo", "Sudaka", 
    "Udaka", "Uleta"
  ],
};

export default function Register() {
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // Dropdown Filtering and Search Logic States
  const [blockDropdownOpen, setBlockDropdownOpen] = useState(false);
  const [blockSearch, setBlockSearch] = useState('');
  const [manualBlock, setManualBlock] = useState(false);

  const [villageDropdownOpen, setVillageDropdownOpen] = useState(false);
  const [villageSearch, setVillageSearch] = useState('');
  const [manualVillage, setManualVillage] = useState(false);

  // Updated Document Target Upload Trackers
  const [uploadProgress, setUploadProgress] = useState({
    entryForm: false,
    sarpanchPerforma: false,
    govId: false,
  });

  const [form, setForm] = useState({
    studentName: '',
    fatherName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    schoolName: '',
    state: 'Haryana',       
    district: 'Nuh (Mewat)', 
    block: '',
    village: '',             
    pincode: '',             
    address: '',
    sport: '',
  });

  // Updated Document Storage States
  const [urls, setUrls] = useState({
    entryFormUrl: '',
    sarpanchPerformaUrl: '',
    govIdUrl: '',
  });

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/de3vcuioj/upload";
  const UPLOAD_PRESET = "PDF_Hai";
  const MAX_FILE_SIZE = 300 * 1024; // 300KB Strict Size Limit

  useEffect(() => {
    if (!formRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(formRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }, formRef.current);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const closeDropdowns = () => {
      setBlockDropdownOpen(false);
      setVillageDropdownOpen(false);
    };
    window.addEventListener('click', closeDropdowns);
    return () => window.removeEventListener('click', closeDropdowns);
  }, []);

  // Native File Upload Handler with Cloudinary Integration & Sizing Filters
  const handleFileChange = async (field: 'entryForm' | 'sarpanchPerforma' | 'govId', file: File | null) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      const fieldLabel = field === 'entryForm' ? 'Entry Form' : field === 'sarpanchPerforma' ? 'Sarpanch Performa' : 'Government ID';
      toast.error(`${fieldLabel} exceeds file size limit. Must be strictly below 300KB.`);
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [field]: true }));
      
      const fileData = new FormData();
      fileData.append("file", file);
      fileData.append("upload_preset", UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: fileData,
      });

      const data = await response.json();

      if (!data.secure_url) {
        throw new Error(data.error?.message || "Cloudinary upload core engine mapping error");
      }

      setUrls(prev => ({ ...prev, [`${field}Url`]: data.secure_url }));
      toast.success(`${field === 'entryForm' ? 'Entry Form' : field === 'sarpanchPerforma' ? 'Sarpanch Performa' : 'Government ID'} attached successfully.`);
    } catch (err: any) {
      console.error(`Upload pipeline error for context field [${field}]:`, err);
      toast.error(`Upload error configuration mismatch: ${err.message || 'Network exception'}`);
    } finally {
      setUploadProgress(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Strict Validation Validation Logic for all fields including updated 3 mandatory files
    if (!form.studentName.trim() || !form.fatherName.trim() || !form.dateOfBirth || !form.gender ||
        !form.email.trim() || !form.phone.match(/^\d{10}$/) || !form.schoolName.trim() || !form.district || 
        !form.block || !form.village.trim() || !form.pincode.match(/^\d{6}$/) || !form.address.trim() || !form.sport || 
        !urls.entryFormUrl || !urls.sarpanchPerformaUrl || !urls.govIdUrl) {
      toast.error('Validation failure: Complete all fields and ensure Entry Form, Sarpanch Performa, and Government ID are correctly uploaded under 300KB.');
      return;
    }

    setLoading(true);
    try {
      const registrationRef = push(ref(db, 'registrations'));
      
      const schemaPayload = {
        id: registrationRef.key,
        studentName: form.studentName,
        fatherName: form.fatherName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        email: form.email,
        phone: form.phone,
        schoolName: form.schoolName,
        state: form.state,
        district: form.district,
        block: form.block,
        village: form.village,
        pincode: form.pincode,
        address: form.address,
        sport: form.sport,
        entryFormUrl: urls.entryFormUrl,
        sarpanchPerformaUrl: urls.sarpanchPerformaUrl,
        govIdUrl: urls.govIdUrl,
        submittedAt: Date.now(),
        status: 'pending',
      };

      await set(registrationRef, schemaPayload);

      toast.success('Registration data submitted successfully into database infrastructure!');
      
      // Clear data fields
      setForm({
        studentName: '', fatherName: '', dateOfBirth: '', gender: '',
        email: '', phone: '', schoolName: '', state: 'Haryana', district: 'Nuh (Mewat)',
        block: '', village: '', pincode: '', address: '', sport: '',
      });
      setUrls({ entryFormUrl: '', sarpanchPerformaUrl: '', govIdUrl: '' });
      setManualBlock(false);
      setManualVillage(false);
    } catch (err: any) {
      console.error("Firebase database layer runtime mismatch:", err);
      toast.error(`Database layer rejection: ${err.message || 'Fatal execution payload mismatch'}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredBlocks = Object.keys(blockVillageData).filter(b => b.toLowerCase().includes(blockSearch.toLowerCase()));
  const currentVillagesList = form.block && blockVillageData[form.block] ? blockVillageData[form.block] : [];
  const filteredVillages = currentVillagesList.filter(v => v.toLowerCase().includes(villageSearch.toLowerCase()));

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
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
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
                <div>
                  <label className="text-slate-400 text-xs font-semibold mb-1 block">State</label>
                  <input
                    type="text"
                    value={form.state}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-500 text-sm font-medium cursor-not-allowed"
                  />
                </div>

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
                {/* Searchable Block Picker Dropdown Engine */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <label className="text-slate-700 text-xs font-semibold mb-1 block">Block / Tehsil *</label>
                  {manualBlock ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={form.block}
                        onChange={(e) => setForm({ ...form, block: e.target.value, village: '' })}
                        placeholder="Type Block Name Manually"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => { setManualBlock(false); setManualVillage(false); setForm(prev => ({ ...prev, block: '', village: '' })); }}
                        className="absolute right-3 top-2 text-xs text-[#f37022] hover:underline font-semibold"
                      >
                        Reset List
                      </button>
                    </div>
                  ) : (
                    <>
                      <div 
                        onClick={() => { setBlockDropdownOpen(!blockDropdownOpen); setVillageDropdownOpen(false); }}
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
                              onClick={() => { 
                                setForm(prev => ({ ...prev, block: b, village: '' })); 
                                setBlockDropdownOpen(false); 
                                setBlockSearch('');
                                setManualVillage(false);
                              }}
                              className="px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              {b}
                            </div>
                          ))}
                          <div 
                            onClick={() => { 
                              setManualBlock(true); 
                              setManualVillage(true); 
                              setBlockDropdownOpen(false); 
                              setForm(prev => ({ ...prev, block: '', village: '' })); 
                            }}
                            className="px-3.5 py-2 text-sm text-[#f37022] font-bold border-t border-slate-100 hover:bg-orange-50 cursor-pointer"
                          >
                            Can't find? Type manually
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Searchable Village Picker Dropdown Engine */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <label className="text-slate-700 text-xs font-semibold mb-1 block">Village / Area *</label>
                  {manualVillage || manualBlock ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={form.village}
                        onChange={(e) => setForm({ ...form, village: e.target.value })}
                        placeholder="Type Village Name Manually"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                        required
                      />
                      {!manualBlock && (
                        <button
                          type="button"
                          onClick={() => { setManualVillage(false); setForm(prev => ({ ...prev, village: '' })); }}
                          className="absolute right-3 top-2 text-xs text-[#f37022] hover:underline font-semibold"
                        >
                          Reset List
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div 
                        onClick={() => { 
                          if(!form.block) {
                            toast.error("Please choose a Block first.");
                            return;
                          }
                          setVillageDropdownOpen(!villageDropdownOpen); 
                          setBlockDropdownOpen(false);
                        }}
                        className={`w-full border rounded-lg px-3.5 py-2 text-sm flex items-center justify-between cursor-pointer select-none ${
                          form.block ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span className={form.village ? 'text-slate-900' : 'text-slate-400'}>
                          {form.village || (form.block ? 'Search or Select Village' : 'Choose Block First')}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </div>

                      {villageDropdownOpen && form.block && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 flex items-center gap-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input 
                              type="text"
                              value={villageSearch}
                              onChange={(e) => setVillageSearch(e.target.value)}
                              placeholder="Search village..."
                              className="w-full bg-transparent text-xs text-slate-800 outline-none"
                            />
                          </div>
                          {filteredVillages.map(v => (
                            <div 
                              key={v}
                              onClick={() => { setForm(prev => ({ ...prev, village: v })); setVillageDropdownOpen(false); setVillageSearch(''); }}
                              className="px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                              {v}
                            </div>
                          ))}
                          <div 
                            onClick={() => { setManualVillage(true); setVillageDropdownOpen(false); setForm(prev => ({ ...prev, village: '' })); }}
                            className="px-3.5 py-2 text-sm text-[#f37022] font-bold border-t border-slate-100 hover:bg-orange-50 cursor-pointer"
                          >
                            Can't find? Type manually
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

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

          {/* Section 5: Document Upload (Modified to handle Entry Form, Sarpanch Performa, and Govt ID) */}
          <div>
            <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Upload className="w-4 h-4 text-[#f37022]" />
              Upload Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Card 1: Entry Form */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors hover:border-slate-300">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <FileText className="w-6 h-6 text-[#f37022]" />
                  <span className="text-slate-800 text-xs font-semibold text-center">Entry Form *</span>
                  <p className="text-[10px] text-slate-400 text-center">PDF, JPG, JPEG (Max 300KB)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={(e) => handleFileChange('entryForm', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {uploadProgress.entryForm ? (
                    <Loader2 className="w-4 h-4 text-[#f37022] animate-spin mt-1" />
                  ) : urls.entryFormUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  ) : (
                    <span className="text-[#f37022] text-xs font-bold mt-1">Upload File</span>
                  )}
                </label>
              </div>

              {/* Card 2: Sarpanch Performa */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors hover:border-slate-300">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <FileText className="w-6 h-6 text-[#f37022]" />
                  <span className="text-slate-800 text-xs font-semibold text-center">Sarpanch Performa *</span>
                  <p className="text-[10px] text-slate-400 text-center">PDF, JPG, JPEG (Max 300KB)</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    onChange={(e) => handleFileChange('sarpanchPerforma', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {uploadProgress.sarpanchPerforma ? (
                    <Loader2 className="w-4 h-4 text-[#f37022] animate-spin mt-1" />
                  ) : urls.sarpanchPerformaUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  ) : (
                    <span className="text-[#f37022] text-xs font-bold mt-1">Upload File</span>
                  )}
                </label>
              </div>

              {/* Card 3: Government ID */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors hover:border-slate-300">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <CreditCard className="w-6 h-6 text-[#f37022]" />
                  <span className="text-slate-800 text-xs font-semibold text-center">Government ID *</span>
                  <p className="text-[10px] text-slate-400 text-center">Aadhar, Voter or PAN Card</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('govId', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {uploadProgress.govId ? (
                    <Loader2 className="w-4 h-4 text-[#f37022] animate-spin mt-1" />
                  ) : urls.govIdUrl ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  ) : (
                    <span className="text-[#f37022] text-xs font-bold mt-1">Upload ID</span>
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