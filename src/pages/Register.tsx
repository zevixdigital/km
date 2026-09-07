import { useState, useEffect, useRef } from 'react';
import { ref, push, set, onValue, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import gsap from 'gsap';
import {
  User, Mail, School, MapPin,
  Upload, CheckCircle, FileText, Loader2, Search, ChevronDown, CreditCard, PartyPopper, ShieldCheck, XCircle, SearchCode
} from 'lucide-react';

// Bypassing strict TypeScript JSX compiler for legacy marquee element safely
const MarqueeElement = 'marquee' as any;

const sports = [
  'Cricket', 'Volleyball', 'Athletics', 
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
    "Mahrola", "Manuwas", "Naushera", "Rewasan", "Rozkameo", "Sudaka", 
    "Udaka", "Uleta"
  ],
  Hathin: [
    "Ali Brahman", "Ali Meo", "Andhop", "Bahin", "Dhakalpur", "Ghurawali", "Khaika Hathin", 
    "Kot", "Mahulka", "Manpur", "Nangal Jat", "Nangal Sabha", "Pahari", "Paosar", 
    "Raniala Khurd", "Rupnagar Natoli", "Tonka", "Udepur Bhanguri", "Akbarpur Natol", 
    "Aluka", "Andhrola", "Babupur Hathin", "Bajada Pahari", "Bamnola Jogi", "Bhanguri Palwal", 
    "Bhimsika", "Bhodpur", "Bichpuri", "Bighawali", "Buraka Hathin", "Chandaka", "Chhainsa", 
    "Chilli", "Dhiranka", "Dumka", "Durenchi", "Ferozepur Rajput", "Gahlab", "Garhi Binoda", 
    "Gharot", "Ghigraka", "Gohpur", "Gulesra", "Guraksar", "Hathin (rural)(part)", 
    "Huchpuri Kalan", "Hudithal", "Jainpur", "Jalalpur Hathin", "Janacholi", "Jarari", 
    "Kalsara", "Kanoli", "Khanda Wali", "Kherli Brahman", "Kherli Jita", "Khilluka", 
    "Khokiaka", "Kondal", "Kourali Hathin", "Kukkar Chati", "Kumrera", "Ladmaki", "Lakaka", 
    "Lakhnaka", "Malai", "Malokhra", "Mandhnaka", "Mandkola", "Mandori", "Mangoraka", 
    "Mankaka", "Mathepur", "Mehluka", "Mirka", "Mohdamka", "Pachanka", "Paharpur", "Pondri", 
    "Pothli", "Ranika Hathin", "Ransika", "Ribar", "Rindka", "Rupraka", "Sanpal", "Saroli", 
    "Swamika", "Utawar"
  ]
};

export default function Register() {
  const formRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); 
  const [generatedId, setGeneratedId] = useState(''); 

  // Live Realtime Verification State Arrays
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingSearchInput, setTrackingSearchInput] = useState('');
  const [trackingLookupRecord, setTrackingLookupRecord] = useState<any | null>(null);
  const [trackingQueryRunning, setTrackingQueryRunning] = useState(false);

  // Administrative Settings State Integration
  const [settings, setSettings] = useState({ startDate: '', lastDate: '', formEnabled: true });

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
    subSport: '', 
  });

  // Updated Document Storage States
  const [urls, setUrls] = useState({
    entryFormUrl: '',
    sarpanchPerformaUrl: '',
    govIdUrl: '',
  });

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/de3vcuioj/upload";
  const UPLOAD_PRESET = "PDF_Hai";
  const MAX_FILE_SIZE = 300 * 1024; 

  // Helper Utility function to map strict conditional sub-sports categories mapping dynamically
  const getSubSportsOptions = (sport: string, gender: string): string[] => {
    switch (sport.toLowerCase()) {
      case 'athletics':
        return ['100m Sprint', '200m Sprint', '400m Sprint', '4 × 100m Relay Track', 'Long Jump Event', 'Shot Put Showcase'];
      case 'boxing':
        return ['30–35 kg Divisions', '40–45 kg Divisions', '45–50 kg Divisions', '50–55 kg Divisions', '55–60 kg Divisions', '60–65 kg Divisions', 'Above 65 kg Heavyweight'];
      case 'judo':
        if (gender === 'male') {
          return ['35kg', '40kg', '45kg', '50kg', '55kg', '60kg', '66kg', 'Above 66kg'];
        } else if (gender === 'female') {
          return ['27kg', '32kg', '36kg', '40kg', '44kg', '48kg', '52kg', 'Above 52kg'];
        }
        return [];
      case 'weightlifting':
        if (gender === 'male') {
          return ['55kg', '60kg', '65kg', '70kg', '75kg', '85kg', '95kg', '110kg', 'Above 110kg'];
        } else if (gender === 'female') {
          return ['49kg', '53kg', '57kg', '61kg', '69kg', '77kg', '86kg', 'Above 86kg'];
        }
        return [];
      default:
        return [];
    }
  };

  // Live Database Absolute Reference Single Path Tracking Pipeline
  const executeStatusVerificationLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingSearchInput.trim()) {
      toast.error("Please insert a valid Registration Reference ID token.");
      return;
    }
    setTrackingQueryRunning(true);
    setTrackingLookupRecord(null);
    try {
      const directRecordSnapshotRef = await get(ref(db, `registrations/${trackingSearchInput.trim()}`));
      if (directRecordSnapshotRef.exists()) {
        setTrackingLookupRecord(directRecordSnapshotRef.val());
        toast.success("Profile reference packet mapped successfully!");
      } else {
        setTrackingLookupRecord("not_found");
        toast.error("No athlete registration match discovered under this tracking token key.");
      }
    } catch (err: any) {
      console.error("Tracking runtime execution catch failure block:", err);
      toast.error("System structural database layer read mismatch error occurred.");
    } finally {
      setTrackingQueryRunning(false);
    }
  };

  // Fetch Settings Object for Realtime Marquee Synchronization
  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsub = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.val());
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!formRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(formRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power2.out' });
    }, formRef.current);
    return () => ctx.revert();
  }, [isSubmitted]); 

  useEffect(() => {
    const closeDropdowns = () => {
      setBlockDropdownOpen(false);
      setVillageDropdownOpen(false);
    };
    window.addEventListener('click', closeDropdowns);
    return () => window.removeEventListener('click', closeDropdowns);
  }, []);

  const formatIndianDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const parts = dateStr.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const parsedDate = new Date(dateStr);
    return isNaN(parsedDate.getTime()) ? dateStr : parsedDate.toLocaleDateString("en-IN");
  };

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

    if (!settings.formEnabled) {
      toast.error('Submission Blocked: The registration window is closed or paused by the administration.');
      return;
    }

    if (!form.studentName.trim()) { toast.error('Please enter Student Name'); return; }
    if (!form.fatherName.trim()) { toast.error("Please enter Father's Name"); return; }
    if (!form.dateOfBirth) { toast.error('Please select Date of Birth'); return; }
    if (!form.gender) { toast.error('Please select Gender'); return; }
    if (!form.email.trim()) { toast.error('Please enter a valid Email Address'); return; }
    if (!form.phone.match(/^\d{10}$/)) { toast.error('Please enter a valid 10-digit Mobile Number'); return; }
    if (!form.schoolName.trim()) { toast.error('Please enter School Name'); return; }
    if (!form.block) { toast.error('Please select or type your Block'); return; }
    if (!form.village.trim()) { toast.error('Please select or type your Village'); return; }
    if (!form.pincode.match(/^\d{6}$/)) { toast.error('Please enter a valid 6-digit Pincode'); return; }
    if (!form.address.trim()) { toast.error('Please enter Full Street Address'); return; }
    if (!form.sport) { toast.error('Please select a Sport'); return; }
    
    const conditionalOptions = getSubSportsOptions(form.sport, form.gender);
    if (conditionalOptions.length > 0 && !form.subSport) {
      toast.error('Please select your specific Event or Weight Division category');
      return;
    }

    if (!urls.entryFormUrl) { toast.error('Validation failure: Please upload the Entry Form (under 300KB)'); return; }
    if (!urls.sarpanchPerformaUrl) { toast.error('Validation failure: Please upload the Sarpanch Performa (under 300KB)'); return; }
    if (!urls.govIdUrl) { toast.error('Validation failure: Please upload your Government ID (under 300KB)'); return; }

    setLoading(true);
    try {
      // --- NEW FEATURE: DUPLICATE CHECK ---
      const snapshot = await get(ref(db, 'registrations'));
      if (snapshot.exists()) {
        const registrationsData = snapshot.val();
        const isDuplicate = Object.values(registrationsData).some(
          (record: any) => record.phone === form.phone && record.dateOfBirth === form.dateOfBirth
        );

        if (isDuplicate) {
          toast.error('A registration with this Mobile Number and Date of Birth already exists.');
          setLoading(false);
          return;
        }
      }
      // ------------------------------------

      const registrationRef = push(ref(db, 'registrations'));
      const trackingKey = registrationRef.key || `REG-${Date.now()}`;
      setGeneratedId(trackingKey);
      
      const schemaPayload = {
        id: trackingKey,
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
        subSport: form.subSport || 'N/A', 
        entryFormUrl: urls.entryFormUrl,
        sarpanchPerformaUrl: urls.sarpanchPerformaUrl,
        govIdUrl: urls.govIdUrl,
        submittedAt: Date.now(),
        status: 'pending',
      };

      await set(registrationRef, schemaPayload);
      toast.success('Registration data submitted successfully into database infrastructure!');

      // Isolated Non-Blocking Background Email Dispatch Engine
      try {
        fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            studentName: form.studentName,
            id: trackingKey,
            sport: form.sport,
            subSport: form.subSport || 'N/A'
          })
        });
      } catch (emailErr) {
        console.error("Background email execution failed silently:", emailErr);
      }

      setIsSubmitted(true); 
    } catch (err: any) {
      console.error("Firebase database layer runtime mismatch:", err);
      toast.error(`Database layer rejection: ${err.message || 'Fatal execution payload mismatch'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetRegistrationForm = () => {
    setForm({
      studentName: '', fatherName: '', dateOfBirth: '', gender: '',
      email: '', phone: '', schoolName: '', state: 'Haryana', district: 'Nuh (Mewat)',
      block: '', village: '', pincode: '', address: '', sport: '', subSport: '',
    });
    setUrls({ entryFormUrl: '', sarpanchPerformaUrl: '', govIdUrl: '' });
    setManualBlock(false);
    setManualVillage(false);
    setGeneratedId('');
    setIsSubmitted(false);
  };

  const filteredBlocks = Object.keys(blockVillageData).filter(b => b.toLowerCase().includes(blockSearch.toLowerCase()));
  const currentVillagesList = form.block && blockVillageData[form.block] ? blockVillageData[form.block] : [];
  const filteredVillages = currentVillagesList.filter(v => v.toLowerCase().includes(villageSearch.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#F7F2E9] pt-24 pb-16 font-sans">
      <div ref={formRef} className="max-w-[800px] mx-auto px-4 sm:px-6 w-full">
        
        {/* Dynamic Professional Marquee Notification Banner */}
        <div className={`w-full text-white text-xs font-inter py-3 px-4 mb-8 rounded-xl shadow-sm overflow-hidden whitespace-nowrap relative flex items-center border ${
          settings.formEnabled 
            ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-500' 
            : 'bg-gradient-to-r from-red-600 to-rose-600 border-red-500'
        }`}>
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mr-3 z-10 shrink-0 select-none shadow-sm ${
            settings.formEnabled ? 'bg-orange-800' : 'bg-red-800'
          }`}>
            {settings.formEnabled ? 'LIVE UPDATES' : 'NOTICE'}
          </div>
          <MarqueeElement className="cursor-default" behavior="scroll" direction="left" scrollamount="5">
            {!settings.formEnabled ? (
              "⚠️ ATTENTION APPLICANTS: The online registration portal is temporarily PAUSED by the administration. New form submissions are currently locked."
            ) : (
              `📢 OFFICIAL NOTIFICATION: Online registration window is actively OPEN. Timeframe: From ${formatIndianDate(settings.startDate)} up to ${formatIndianDate(settings.lastDate)}. Please complete validations and upload verified document variants strictly below 300KB.`
            )}
          </MarqueeElement>
        </div>

        {/* Dynamic Conditional Rendering Sequence */}
        {!isSubmitted ? (
          <>
            {/* Form Heading & Verification Button Inline Row Layout */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-slate-200/60 pb-5">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                  Student Registration Form
                </h1>
                <p className="text-slate-600 text-sm">
                  Please fill out the form carefully with valid information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setTrackingModalOpen(true); setTrackingLookupRecord(null); setTrackingSearchInput(''); }}
                className="flex items-center gap-1.5 bg-[#0A1628] hover:bg-[#1E293B] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm border border-slate-700 shrink-0 select-none hover:scale-[1.02]"
              >
                <ShieldCheck className="w-4 h-4 text-[#f37022]" />
                Verify Enrolment Status
              </button>
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
                    <label className="text-slate-700 text-xs font-semibold mb-1 block">Player Name *</label>
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
                      onChange={(e) => setForm({ ...form, gender: e.target.value, subSport: '' })}
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
                      onChange={(e) => setForm({ ...form, sport: e.target.value, subSport: '' })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                      required
                    >
                      <option value="">Choose a sport</option>
                      {sports.map((sport) => (
                        <option key={sport} value={sport.toLowerCase()}>{sport}</option>
                      ))}
                    </select>
                  </div>

                  {['athletics', 'boxing', 'judo', 'weightlifting'].includes(form.sport.toLowerCase()) && (
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 text-xs font-semibold mb-1 block">Select Event / Weight Division *</label>
                      {((form.sport === 'judo' || form.sport === 'weightlifting') && !form.gender) ? (
                        <div className="w-full bg-orange-50 text-orange-700 border border-orange-200 rounded-lg px-3.5 py-2 text-xs font-medium">
                          ⚠️ Please select your Gender under "Personal Details" to unlock corresponding divisions.
                        </div>
                      ) : (
                        <select
                          value={form.subSport}
                          onChange={(e) => setForm({ ...form, subSport: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-slate-900 text-sm focus:border-[#f37022] focus:bg-white focus:outline-none"
                          required
                        >
                          <option value="">Select Category/Division</option>
                          {getSubSportsOptions(form.sport, form.gender).map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Document Upload */}
              <div>
                <h3 className="text-slate-900 font-bold text-base mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Upload className="w-4 h-4 text-[#f37022]" />
                  Upload Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
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

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors hover:border-slate-300">
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <FileText className="w-6 h-6 text-[#f37022]" />
                      <span className="text-slate-800 text-xs font-semibold text-center">School Management * <br /> Sarpanch Performa *</span>
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

              <button
                type="submit"
                disabled={loading || !settings.formEnabled}
                className={`w-full text-white py-3 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-4 ${
                  settings.formEnabled 
                    ? 'bg-[#f37022] hover:bg-[#e26212] disabled:opacity-50' 
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Registration...
                  </>
                ) : !settings.formEnabled ? (
                  'Form Submission Paused'
                ) : (
                  'Submit Registration'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-lg space-y-6 animate-fadeIn">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
              <PartyPopper className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Registration Submitted Successfully!</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Your enrolment details have been securely logged into the database engine index system for administrative verification.
              </p>
              <p className="text-green-600 text-xs font-medium">📧 Confirmation receipt pipeline dispatched.</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-w-md mx-auto text-left space-y-2.5">
              <div className="text-xs text-slate-400 font-mono tracking-wider uppercase border-b border-slate-200 pb-1.5">
                Registration Receipt Metadata
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Player Name:</span>
                <span className="font-semibold text-slate-800">{form.studentName || 'Verified Athlete'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Tracking Reference UID:</span>
                <span className="font-mono text-xs font-bold text-[#f37022] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                  {generatedId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Sport Discipline:</span>
                <span className="font-semibold text-slate-800 capitalize">{form.sport}</span>
              </div>
              {form.subSport && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Category / Event Division:</span>
                  <span className="font-semibold text-slate-700">{form.subSport}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={resetRegistrationForm}
                className="bg-[#f37022] hover:bg-[#e26212] text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                Submit Another Registration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Realtime Anti-Forgery Status Tracking Verification Modal Drawer Layer */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A1628]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6 relative animate-scaleIn">
            
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SearchCode className="w-5 h-5 text-[#f37022]" />
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Verify Registration</h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={executeStatusVerificationLookup} className="space-y-4">
              <div>
                <label className="text-slate-700 text-xs font-semibold mb-1 block">Enter Reference UID Token *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Paste your unique ID here (e.g. -OwOu...)"
                    value={trackingSearchInput}
                    onChange={(e) => setTrackingSearchInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-900 font-mono focus:border-[#f37022] focus:bg-white focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={trackingQueryRunning}
                    className="absolute right-2 top-1.5 p-1.5 bg-[#f37022] text-white rounded-lg hover:bg-[#e26212] transition-colors disabled:opacity-50"
                  >
                    {trackingQueryRunning ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </form>

            {trackingLookupRecord && trackingLookupRecord !== "not_found" && (
              <div className="mt-5 border border-slate-100 bg-slate-50/80 rounded-xl p-4 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Status Result</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    trackingLookupRecord.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                    trackingLookupRecord.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                    'bg-amber-100 text-amber-700 border-amber-200'
                  }`}>
                    {trackingLookupRecord.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Player Name:</span>
                  <span className="font-semibold text-slate-800">{trackingLookupRecord.studentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sport Category:</span>
                  <span className="font-semibold text-slate-800 capitalize">{trackingLookupRecord.sport}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Division/Event:</span>
                  <span className="font-semibold text-slate-700">{trackingLookupRecord.subSport || 'N/A'}</span>
                </div>
              </div>
            )}

            {trackingLookupRecord === "not_found" && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs text-center font-medium">
                ❌ ID galat hai ya data exist nahi karta. Kripya reference check karein.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

