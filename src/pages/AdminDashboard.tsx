import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ref, onValue, update, remove, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/components/AuthProvider';
import { toast } from 'sonner';
import gsap from 'gsap';
import {
  LayoutDashboard, Users, Calendar, Settings, LogOut, Search,
  Filter, FileText, Trash2, CheckCircle, XCircle,
  PauseCircle, PlayCircle, AlertCircle, Loader2,
  TrendingUp, UserCheck, Clock, BarChart3, Eye, CreditCard, Download
} from 'lucide-react';

interface Registration {
  id: string;
  studentName: string;
  fatherName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  schoolName: string;
  state: string;
  district: string;
  block: string;
  village: string;
  pincode: string;
  address: string;
  sport: string;
  subSport?: string; // Enhanced dynamic safety mapping tracking field integration
  entryFormUrl: string;       
  sarpanchPerformaUrl: string; 
  govIdUrl: string;            
  submittedAt: number;
  status: string;
}

interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface Tournament {
  id: string;
  name: string;
  sport: string;
  startDate: string; // Dynamic field preserve
  lastDate: string; 
  location: string;
  status: string;
  image: string;
}

const sportsList = [
  'all', 'cricket', 'volleyball', 'athletics',
  'kabaddi', 'football', 'kho-kho', 'boxing', 'judo', 'badminton', 'weightlifting'
];

const venueList = [
  "Rajiv Gandhi Khel Stadium Jhamuwash",
  "Vyamshala Indri",
  "Shahpur Nangli Khel Stadium Nuh",
  "Rajiv Gandhi Khel Stadium Nagina",
  "Rajiv Gandhi Khel Stadium Pingwan",
  "Rajiv Gandhi Khel Stadium Siroli",
  "Rajiv Gandhi Khel Stadium Kameda",
  "Modis Public Sr Sec School Hathin",
  "Govt Model Sanskriti Sr Sec School Booraka Hathin"
];

// Production Safe Cloudinary Image Pipeline
const sportImageMap: Record<string, string> = {
  'cricket': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157479/cricket1_d9qbc6.jpg',
  'volleyball': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157492/volleyball1_sbabh6.jpg',
  'athletics': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157493/runner1_uwe5nf.jpg',
  'kabaddi': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157494/Kabaddi_iaynpu.jpg',
  'football': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782374249/WhatsApp_Image_2026-06-24_at_8.39.24_PM_ws2dmb.jpg',
  'kho-kho': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157497/KhoKho_nity9q.png',
  'boxing': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157491/Boxing_wdnwak.jpg',
  'judo': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157480/Judo_cvquo0.jpg',
  'badminton': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157489/Badminton_xcuuzf.png',
  'weightlifting': 'https://res.cloudinary.com/dadqwaqis/image/upload/f_auto,q_auto/v1782157488/WeightLifting_rmgkg4.jpg'
};

const statusList = ['all', 'pending', 'approved', 'rejected'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, logout } = useAuthContext();
  
  // Registration States
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filtered, setFiltered] = useState<Registration[]>([]);
  const [settings, setSettings] = useState({ startDate: '', lastDate: '', formEnabled: true });
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState('registrations');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Settings Inputs States
  const [startDateInput, setStartDateInput] = useState('');
  const [lastDateInput, setLastDateInput] = useState('');
  const [viewRegistration, setViewRegistration] = useState<Registration | null>(null);

  // Lazy Loading Controls State
  const [visibleRecords, setVisibleRecords] = useState(20);
  
  // Tournament Input States with Start Date Included
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentSport, setTournamentSport] = useState("");
  const [tournamentStartDate, setTournamentStartDate] = useState("");
  const [tournamentLastDate, setTournamentLastDate] = useState("");
  const [tournamentLocation, setTournamentLocation] = useState("");
  const [tournamentImage, setTournamentImage] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const dashboardRef = useRef<HTMLDivElement>(null);

  // Excel Engine Export Data Pipeline
  const exportToExcel = (dataList: Registration[]) => {
    if (dataList.length === 0) {
      toast.error("No dataset available to generate sheet matching this filter group.");
      return;
    }

    const headers = [
      "Registration ID", "Student Name", "Father Name", "Date of Birth", 
      "Gender", "Email Address", "Mobile Phone", "School Name", 
      "Block/Tehsil", "Village/Area", "Pincode", "Street Address", 
      "Sport Category", "Event Category / Weight Division", "Submission Date", "Application Status"
    ];

    const rows = dataList.map(r => [
      `"${r.id}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.fatherName.replace(/"/g, '""')}"`,
      `"${r.dateOfBirth}"`,
      `"${r.gender}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.schoolName.replace(/"/g, '""')}"`,
      `"${r.block.replace(/"/g, '""')}"`,
      `"${r.village.replace(/"/g, '""')}"`,
      `"${r.pincode}"`,
      `"${r.address.replace(/"/g, '""')}"`,
      `"${r.sport.toUpperCase()}"`,
      `"${r.subSport || 'N/A'}"`,
      `"${new Date(r.submittedAt).toLocaleDateString('en-IN')}"`,
      `"${r.status.toUpperCase()}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `Sports_Registrations_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    toast.success(`Excel compatible ledger summary report generated for ${dataList.length} students successfully!`);
  };

  // Corporate Styled Dynamic Receipt/PDF Print Layout Pipeline Engine
  const exportIndividualPDF = (reg: Registration) => {
    const windowContext = window.open('', '_blank');
    if (!windowContext) {
      toast.error("Popup window display blocked by client side browser settings! Please grant permission.");
      return;
    }

    windowContext.document.write(`
      <html>
        <head>
          <title>Registration_Report_${reg.studentName.replace(/\s+/g, '_')}</title>
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #0F172A; background-color: #FFFFFF; padding: 45px; margin: 0; line-height: 1.5; }
            .header-banner { border-bottom: 3px solid #F37022; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-start; }
            .company-title { font-size: 26px; font-weight: 800; color: #0A1628; margin: 0; letter-spacing: -0.025em; text-transform: uppercase; }
            .subtitle { margin: 6px 0 0 0; font-size: 13px; color: #4B5563; font-weight: 500; }
            .badge { display: inline-block; padding: 6px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 9999px; letter-spacing: 0.05em; }
            .approved { background-color: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
            .pending { background-color: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
            .rejected { background-color: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
            .section-heading { font-size: 15px; font-weight: 700; color: #F37022; text-transform: uppercase; letter-spacing: 0.05em; margin: 28px 0 14px 0; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; }
            .info-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .info-card { background-color: #F8FAFC; border: 1px solid #F1F5F9; padding: 14px 18px; border-radius: 8px; }
            .info-card.span-2 { grid-column: span 2; }
            .data-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; margin-bottom: 4px; }
            .data-value { font-size: 14px; font-weight: 600; color: #1E293B; }
            .sport-highlight { font-size: 16px; color: #F37022; font-weight: 700; }
            .footer-signature-block { text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 24px; margin-top: 60px; font-weight: 500; }
            @media print {
              body { padding: 20px; font-size: 12px; }
              .info-card { background-color: #F8FAFC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <h1 class="company-title">Athlete Enrolment Profile Report</h1>
              <p class="subtitle">System Database Record Reference ID Check Log • Generated: ${new Date().toLocaleString('en-IN')}</p>
            </div>
            <span class="badge ${reg.status}">${reg.status}</span>
          </div>

          <div class="section-heading">Personal Dossier Information</div>
          <div class="info-grid">
            <div class="info-card"><div class="data-label">Player Name</div><div class="data-value">${reg.studentName}</div></div>
            <div class="info-card"><div class="data-label">Father's Identification Name</div><div class="data-value">${reg.fatherName}</div></div>
            <div class="info-card"><div class="data-label">Date of Birth</div><div class="data-value">${reg.dateOfBirth}</div></div>
            <div class="info-card"><div class="data-label">Gender Orientation</div><div class="data-value" style="text-transform: capitalize;">${reg.gender}</div></div>
            <div class="info-card"><div class="data-label">Verified Email Address</div><div class="data-value">${reg.email}</div></div>
            <div class="info-card"><div class="data-label">Mobile Communication Contact</div><div class="data-value">+91 ${reg.phone}</div></div>
          </div>

          <div class="section-heading">Academic Location & Structural Mapping</div>
          <div class="info-grid">
            <div class="info-card span-2"><div class="data-label">Allocated Institute / School Name</div><div class="data-value">${reg.schoolName}</div></div>
            <div class="info-card"><div class="data-label">Tehsil Zone / Block</div><div class="data-value">${reg.block}</div></div>
            <div class="info-card"><div class="data-label">Village Location Area</div><div class="data-value">${reg.village}</div></div>
            <div class="info-card"><div class="data-label">District Jurisdiction</div><div class="data-value">${reg.district}</div></div>
            <div class="info-card"><div class="data-label">Postal Pincode Code</div><div class="data-value">${reg.pincode}</div></div>
            <div class="info-card span-2"><div class="data-label">Full Residential Mailing Address</div><div class="data-value">${reg.address}</div></div>
          </div>

          <div class="section-heading">Competitive Sports Categorization Data</div>
          <div class="info-grid">
            <div class="info-card"><div class="data-label">Selected Main Sport Discipline</div><div class="data-value sport-highlight" style="text-transform: uppercase;">${reg.sport}</div></div>
            <div class="info-card"><div class="data-label">Dynamic Event Event / Weight Division Variant</div><div class="data-value font-semibold text-slate-800">${reg.subSport || 'N/A'}</div></div>
          </div>

          <div class="footer-signature-block">
            This digital printout profile documentation remains a verified structural summary payload breakdown generated automatically via system records backend under token indexing target reference key string: ${reg.id}
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 350);
            }
          </script>
        </body>
      </html>
    `);
    windowContext.document.close();
  };

  // Auto matching Cloudinary URLs case-insensitively
  useEffect(() => {
    const activeSportKey = tournamentSport?.toLowerCase();
    if (activeSportKey && sportImageMap[activeSportKey]) {
      setTournamentImage(sportImageMap[activeSportKey]);
    } else {
      setTournamentImage('https://placehold.co/600x400?text=Sports+Tournament');
    }
  }, [tournamentSport]);

  // Auth check
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch registrations
  useEffect(() => {
    const regRef = ref(db, 'registrations');
    const unsub = onValue(regRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.values(data) as Registration[];
      list.sort((a, b) => b.submittedAt - a.submittedAt);
      setRegistrations(list);

      setStats({
        total: list.length,
        pending: list.filter((r) => r.status === 'pending').length,
        approved: list.filter((r) => r.status === 'approved').length,
        rejected: list.filter((r) => r.status === 'rejected').length,
      });
    });
    return unsub;
  }, []);

  // Fetch settings
  useEffect(() => {
    const settingsRef = ref(db, 'settings');
    const unsub = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setSettings(data);
        setStartDateInput(data.startDate || '');
        setLastDateInput(data.lastDate || '');
      }
    });
    return unsub;
  }, []);

  // Fetch Tournaments
  useEffect(() => {
    const tournamentRef = ref(db, "tournaments");
    const unsub = onValue(tournamentRef, (snapshot) => {
      const data = snapshot.val() || {};
      const list = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      })) as Tournament[];
      setTournaments(list);
    });
    return unsub;
  }, []);

  // Filter registrations & Reset Lazy Loading Count
  useEffect(() => {
    let result = [...registrations];

    if (sportFilter !== 'all') {
      result = result.filter((r) => r.sport === sportFilter);
    }
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.studentName?.toLowerCase().includes(q) ||
          r.schoolName?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.phone?.includes(q) ||
          r.block?.toLowerCase().includes(q) ||
          r.village?.toLowerCase().includes(q)
      );
    }
    if (selectedDate) {
      const dateMs = new Date(selectedDate).getTime();
      const nextDay = dateMs + 86400000;
      result = result.filter((r) => r.submittedAt >= dateMs && r.submittedAt < nextDay);
    }

    setFiltered(result);
    setVisibleRecords(20); 
  }, [registrations, sportFilter, statusFilter, searchQuery, selectedDate]);

  // Animation
  useEffect(() => {
    if (!dashboardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.stat-card', {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      });
    }, dashboardRef.current);

    return () => ctx.revert();
  }, []);

  // Action Handlers
  const updateSettingsDates = async () => {
    try {
      await update(ref(db, 'settings'), { 
        startDate: startDateInput,
        lastDate: lastDateInput 
      });
      toast.success('Registration schedule timeframe updated');
    } catch {
      toast.error('Failed to update timeframe settings');
    }
  };

  const toggleForm = async () => {
    try {
      await update(ref(db, 'settings'), { formEnabled: !settings.formEnabled });
      toast.success(`Form ${settings.formEnabled ? 'paused' : 'resumed'} successfully`);
    } catch {
      toast.error('Failed to update form status');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await update(ref(db, `registrations/${id}`), { status });
      toast.success(`Registration ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const deleteRegistration = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    try {
      await remove(ref(db, `registrations/${id}`));
      toast.success('Registration deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  // Tournament Action Handlers with dual start/end validation
  const addTournament = async () => {
    if (!tournamentName.trim() || !tournamentSport || !tournamentStartDate || !tournamentLastDate || !tournamentLocation) {
      toast.error("Please fill all required tournament fields");
      return;
    }
    try {
      const newTournamentRef = push(ref(db, "tournaments"));
      await set(newTournamentRef, {
        id: newTournamentRef.key,
        name: tournamentName,
        sport: tournamentSport,
        startDate: tournamentStartDate,
        lastDate: tournamentLastDate,
        location: tournamentLocation,
        image: tournamentImage,
        status: "open",
      });

      toast.success("Tournament Added Successfully");
      setTournamentName("");
      setTournamentSport("");
      setTournamentStartDate("");
      setTournamentLastDate("");
      setTournamentLocation("");
    } catch {
      toast.error("Failed to add tournament");
    }
  };

  const deleteTournament = async (id: string) => {
    if (!window.confirm("Delete Tournament permanently?")) return;
    try {
      await remove(ref(db, `tournaments/${id}`));
      toast.success("Tournament Deleted");
    } catch {
      toast.error("Failed to delete tournament");
    }
  };

  const getSportCounts = () => {
    const counts: Record<string, number> = {};
    registrations.forEach((r) => {
      counts[r.sport] = (counts[r.sport] || 0) + 1;
    });
    return counts;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F2E9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#f37022] animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const sportCounts = getSportCounts();
  const displayedRegistrations = filtered.slice(0, visibleRecords);

  return (
    <main className="min-h-screen bg-[#F7F2E9] pt-20 pb-10" ref={dashboardRef}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-playfair font-bold text-[#f37022]">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 text-sm font-inter">
              Welcome back, {user.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-600 hover:text-red-500 transition-colors text-sm font-inter w-fit"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Registrations', value: stats.total, icon: Users, color: '#f37022' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: '#F59E0B' },
            { label: 'Approved', value: stats.approved, icon: UserCheck, color: '#10B981' },
            { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#EF4444' },
          ].map((stat) => (
            <div key={stat.label} className="stat-card bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                <TrendingUp className="w-4 h-4 text-white/20" />
              </div>
              <div className="text-2xl lg:text-3xl font-playfair font-bold text-slate-900">
                {stat.value}
              </div>
              <div className="text-slate-500 text-xs font-inter mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'registrations', label: 'Registrations', icon: LayoutDashboard },
            { id: 'tournaments', label: 'Tournament Management', icon: Calendar },
            { id: 'sports', label: 'Sports Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-inter text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#f37022] text-[#0A1628]'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Registrations Core Tab */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 lg:p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="text-slate-500 text-xs font-inter mb-1.5 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4A6B8A]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-slate-900 font-inter text-xs focus:border-[#f37022] focus:outline-none"
                      placeholder="Name, block, village..."
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 text-xs font-inter mb-1.5 block">Sport</label>
                  <select
                    value={sportFilter}
                    onChange={(e) => setSportFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-inter text-xs focus:border-[#f37022] focus:outline-none"
                  >
                    {sportsList.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs font-inter mb-1.5 block">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-inter text-xs focus:border-[#f37022] focus:outline-none"
                  >
                    {statusList.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 text-xs font-inter mb-1.5 block">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-inter text-xs focus:border-[#f37022] focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setSportFilter('all'); setStatusFilter('all'); setSearchQuery(''); setSelectedDate(''); }}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-600 py-2 rounded-lg font-inter text-xs hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Enhanced Professional Export Controls Row */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                <p className="text-xs text-slate-500 font-inter">
                  Generate professional spreadsheet logs based on your live dashboard search query filters.
                </p>
                <button
                  type="button"
                  onClick={() => exportToExcel(filtered)}
                  className="flex items-center gap-2 bg-[#0A1628] hover:bg-[#1E293B] text-white px-4 py-2 rounded-lg font-inter text-xs font-bold shadow-sm transition-all w-full sm:w-auto justify-center"
                >
                  <Download className="w-3.5 h-3.5 text-[#f37022]" />
                  Download Excel List ({filtered.length} Records)
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      {['Student Details', 'School Name', 'Category Discipline', 'Date Logged', 'Status state', 'Action Control'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[#f37022] font-inter text-xs font-semibold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-500 font-inter text-sm">
                          No registrations found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      displayedRegistrations.map((reg) => (
                        <tr key={reg.id} className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="text-slate-900 font-inter text-sm font-medium">{reg.studentName}</div>
                            <div className="text-slate-500 text-xs font-inter">{reg.email}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-inter text-sm">{reg.schoolName}</td>
                          <td className="px-4 py-3">
                            <span className="text-[#f37022] font-inter text-xs font-semibold capitalize block">
                              {reg.sport}
                            </span>
                            {reg.subSport && (
                              <span className="text-[10px] text-slate-400 font-inter block truncate max-w-[150px]">
                                {reg.subSport}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-inter text-xs">
                            {new Date(reg.submittedAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-inter font-medium ${
                              reg.status === 'approved' ? 'bg-green-500/10 text-green-600' :
                              reg.status === 'rejected' ? 'bg-red-500/10 text-red-600' :
                              'bg-yellow-500/10 text-yellow-600'
                            }`}>
                              {reg.status === 'approved' ? <CheckCircle className="w-3 h-3" /> :
                               reg.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                               <Clock className="w-3 h-3" />}
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setViewRegistration(reg)}
                                className="p-1.5 bg-slate-100 rounded-md hover:bg-[#f37022]/20 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#f37022]" />
                              </button>
                              <button
                                onClick={() => exportIndividualPDF(reg)}
                                className="p-1.5 bg-slate-100 rounded-md hover:bg-blue-500/20 transition-colors"
                                title="Download PDF Report"
                              >
                                <FileText className="w-3.5 h-3.5 text-blue-600" />
                              </button>
                              {reg.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updateStatus(reg.id, 'approved')}
                                    className="p-1.5 bg-green-500/10 rounded-md hover:bg-green-500/20 transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                                  </button>
                                  <button
                                    onClick={() => updateStatus(reg.id, 'rejected')}
                                    className="p-1.5 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteRegistration(reg.id)}
                                className="p-1.5 bg-red-500/10 rounded-md hover:bg-red-500/20 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Lazy Loading Action Bar */}
              <div className="px-4 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/30">
                <div className="text-slate-500 text-xs font-inter order-2 sm:order-1 text-center sm:text-left">
                  Showing {displayedRegistrations.length} of {filtered.length} matching registrations (Total: {registrations.length})
                </div>
                {filtered.length > visibleRecords && (
                  <button
                    onClick={() => setVisibleRecords((prev) => prev + 20)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-[#f37022]/10 text-[#f37022] font-inter text-xs font-bold rounded-lg border border-[#f37022]/20 transition-colors order-1 sm:order-2"
                  >
                    Load More Registrations
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tournament Management Tab */}
        {activeTab === 'tournaments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm h-fit">
              <h3 className="text-slate-900 font-playfair font-bold text-lg mb-5">
                Create New Tournament
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-slate-600 text-xs font-inter mb-1 block">Tournament Name *</label>
                  <input
                    placeholder="e.g. Inter School Cricket Championship"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 text-xs font-inter mb-1 block">Select Sport Category *</label>
                  <select
                    value={tournamentSport}
                    onChange={(e) => setTournamentSport(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none"
                  >
                    <option value="">Choose a sport</option>
                    {sportsList.filter(s => s !== 'all').map((sport) => (
                      <option key={sport} value={sport}>{sport.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 text-xs font-inter mb-1 block">Tournament Start Date *</label>
                  <input
                    type="date"
                    value={tournamentStartDate}
                    onChange={(e) => setTournamentStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-inter text-xs focus:border-[#f37022] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 text-xs font-inter mb-1 block">Last Registration Date *</label>
                  <input
                    type="date"
                    value={tournamentLastDate}
                    onChange={(e) => setTournamentLastDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-inter text-xs focus:border-[#f37022] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-600 text-xs font-inter mb-1 block">Select Location / Venue *</label>
                  <select
                    value={tournamentLocation}
                    onChange={(e) => setTournamentLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none"
                  >
                    <option value="">Choose a playground stadium</option>
                    {venueList.map((venue) => (
                      <option key={venue} value={venue}>{venue}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs font-inter mb-1 block">Automated Image Pathway Path</label>
                  <input
                    type="text"
                    value={tournamentImage}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-500 font-inter text-sm font-medium cursor-not-allowed text-ellipsis overflow-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Changes automatically relative to selected sports category.</p>
                </div>

                <button
                  onClick={addTournament}
                  className="w-full bg-[#f37022] text-[#0A1628] font-bold py-3 rounded-lg font-inter text-sm hover:scale-[1.02] transition-transform mt-2 shadow-sm"
                >
                  Add Tournament
                </button>
              </div>
            </div>

            {/* List Preview Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
              <h3 className="text-slate-900 font-playfair font-bold text-lg mb-5">
                Active Dynamic Tournaments ({tournaments.length})
              </h3>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {tournaments.length === 0 ? (
                  <p className="text-slate-500 font-inter text-sm text-center py-12">
                    No tournaments available in database. Create one above.
                  </p>
                ) : (
                  tournaments.map((t) => (
                    <div
                      key={t.id}
                      className="border border-slate-100 bg-slate-50 rounded-xl p-4 flex justify-between items-center hover:border-slate-200 transition-all"
                    >
                      <div className="space-y-1 overflow-hidden mr-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm font-inter">{t.name}</h4>
                          <span className="bg-[#f37022]/10 text-[#f37022] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                            {t.sport}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs font-inter flex flex-wrap gap-x-3 gap-y-1">
                          <span>📅 Start Date: {t.startDate || 'N/A'}</span>
                          <span>⏳ Deadline: {t.lastDate || 'No limit'}</span>
                        </p>
                        <p className="text-slate-500 text-xs font-inter opacity-80">
                          📍 {t.location}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono text-ellipsis overflow-hidden whitespace-nowrap">
                          🖼️ Img: {t.image}
                        </p>
                      </div>

                      <button
                        onClick={() => deleteTournament(t.id)}
                        className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-600 transition-colors shrink-0"
                        title="Delete Tournament"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sports Analytics Tab */}
        {activeTab === 'sports' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-slate-900 font-playfair font-bold text-lg mb-6">Registrations by Sport</h3>
            <div className="space-y-4">
              {sportsList.filter((s) => s !== 'all').map((sport) => {
                const count = sportCounts[sport] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={sport}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-600 font-inter text-sm capitalize">{sport}</span>
                      <span className="text-[#f37022] font-inter text-sm font-bold">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#f37022] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <h3 className="text-slate-900 font-playfair font-bold text-lg mt-8 mb-4">Status Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
                { label: 'Approved', value: stats.approved, color: 'bg-green-500' },
                { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-100 rounded-lg p-4 text-center">
                  <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`} />
                  <div className="text-slate-900 font-playfair font-bold text-xl">{item.value}</div>
                  <div className="text-slate-500 text-xs font-inter">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings Configurations Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
            <h3 className="text-slate-900 font-playfair font-bold text-lg">Registration Settings</h3>

            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <label className="text-slate-600 font-inter text-sm mb-3 block flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#f37022]" />
                Global Registration Timeframe Configuration
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-slate-500 text-xs font-inter mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={startDateInput}
                    onChange={(e) => setStartDateInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-500 text-xs font-inter mb-1 block">Last Date</label>
                  <input
                    type="date"
                    value={lastDateInput}
                    onChange={(e) => setLastDateInput(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 font-inter text-sm focus:border-[#f37022] focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={updateSettingsDates}
                className="bg-[#f37022] text-[#0A1628] px-6 py-2.5 rounded-lg font-inter font-bold text-sm hover:scale-105 transition-transform"
              >
                Update Timeframe Range
              </button>

              <div className="text-slate-500 text-xs font-inter mt-3 space-y-1 bg-white p-3 border border-slate-100 rounded-lg">
                <p>📍 <strong>Current Start Date:</strong> {settings.startDate ? new Date(settings.startDate).toLocaleDateString('en-IN') : 'Not set'}</p>
                <p>⏳ <strong>Current Last Date:</strong> {settings.lastDate ? new Date(settings.lastDate).toLocaleDateString('en-IN') : 'Not set'}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-slate-600 font-inter text-sm block mb-1">
                    Registration Form Status
                  </label>
                  <p className="text-slate-500 text-xs font-inter">
                    {settings.formEnabled
                      ? 'Students can currently submit registrations'
                      : 'Registration form is currently paused'}
                  </p>
                </div>
                <button
                  onClick={toggleForm}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-inter font-bold text-sm transition-all ${
                    settings.formEnabled
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                      : 'bg-green-500/10 text-green-600 border border-green-500/30 hover:bg-green-500/20'
                  }`}
                >
                  {settings.formEnabled ? (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      Pause Form
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      Resume Form
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={`rounded-lg p-4 flex items-center gap-3 ${
              settings.formEnabled ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <AlertCircle className={`w-5 h-5 ${settings.formEnabled ? 'text-green-500' : 'text-red-500'}`} />
              <div>
                <div className={`font-inter text-sm font-semibold ${settings.formEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  Form is currently {settings.formEnabled ? 'OPEN' : 'CLOSED'}
                </div>
                <div className="text-slate-500 text-xs font-inter">
                  {settings.lastDate
                    ? `Deadline schedule: ${new Date(settings.lastDate).toLocaleDateString('en-IN')}`
                    : 'No last date set'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Modal */}
      {viewRegistration && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full my-8 shadow-2xl transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
                <h3 className="text-xl font-playfair font-bold text-[#f37022]">
                  Registration Details
                </h3>
                <button
                  onClick={() => setViewRegistration(null)}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Student Name</label>
                    <p className="text-slate-900 font-inter text-sm font-medium">{viewRegistration.studentName}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Father&apos;s Name</label>
                    <p className="text-slate-900 font-inter text-sm font-medium">{viewRegistration.fatherName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Date of Birth</label>
                    <p className="text-slate-900 font-inter text-sm">{viewRegistration.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Gender</label>
                    <p className="text-slate-900 font-inter text-sm capitalize">{viewRegistration.gender}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Email</label>
                    <p className="text-slate-900 font-inter text-sm break-all">{viewRegistration.email}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Phone</label>
                    <p className="text-slate-900 font-inter text-sm">{viewRegistration.phone}</p>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-xs font-inter">School Name</label>
                  <p className="text-slate-900 font-inter text-sm">{viewRegistration.schoolName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Block / Tehsil</label>
                    <p className="text-slate-900 font-inter text-sm">{viewRegistration.block}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Village / Area</label>
                    <p className="text-slate-900 font-inter text-sm">{viewRegistration.village}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Pincode</label>
                    <p className="text-slate-900 font-inter text-sm">{viewRegistration.pincode}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-inter">District / State</label>
                    <p className="text-slate-900 font-inter text-sm">{viewRegistration.district}, {viewRegistration.state}</p>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-xs font-inter">Full Street Address</label>
                  <p className="text-slate-900 font-inter text-sm">{viewRegistration.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Sport Selected</label>
                    <p className="text-[#f37022] font-inter text-sm font-semibold capitalize">{viewRegistration.sport}</p>
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Review Status</label>
                    <p className="text-slate-900 font-inter text-sm capitalize">{viewRegistration.status}</p>
                  </div>
                </div>

                {viewRegistration.subSport && (
                  <div>
                    <label className="text-slate-500 text-xs font-inter">Event / Weight Division Category</label>
                    <p className="text-slate-800 font-inter text-sm font-medium">{viewRegistration.subSport}</p>
                  </div>
                )}

                <div>
                  <label className="text-slate-500 text-xs font-inter">Submitted On</label>
                  <p className="text-slate-900 font-inter text-sm">
                    {new Date(viewRegistration.submittedAt).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {viewRegistration.entryFormUrl && (
                    <a
                      href={viewRegistration.entryFormUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#f37022]/10 border border-[#f37022]/30 text-[#f37022] px-3 py-1.5 rounded-lg text-xs font-inter hover:bg-[#f37022]/20 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Entry Form
                    </a>
                  )}
                  {viewRegistration.sarpanchPerformaUrl && (
                    <a
                      href={viewRegistration.sarpanchPerformaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#f37022]/10 border border-[#f37022]/30 text-[#f37022] px-3 py-1.5 rounded-lg text-xs font-inter hover:bg-[#f37022]/20 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Sarpanch Performa
                    </a>
                  )}
                  {viewRegistration.govIdUrl && (
                    <a
                      href={viewRegistration.govIdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#f37022]/10 border border-[#f37022]/30 text-[#f37022] px-3 py-1.5 rounded-lg text-xs font-inter hover:bg-[#f37022]/20 transition-colors"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Government ID
                    </a>
                  )}
                </div>

                {/* Professional Modal Action Block Integration */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => exportIndividualPDF(viewRegistration)}
                    className="w-full flex items-center justify-center gap-2 bg-[#f37022] text-[#0A1628] font-bold py-2.5 rounded-xl font-inter text-xs shadow-sm hover:scale-[1.01] transition-transform"
                  >
                    <FileText className="w-4 h-4" />
                    Print / Download Professional PDF Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
