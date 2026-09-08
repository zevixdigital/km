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

// Updated final interface payload mapping
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
  subSport?: string; 
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
  startDate: string; 
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

// Helper function to format YYYY-MM-DD into DD-MM-YYYY strictly
const formatDOB = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, logout } = useAuthContext();
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filtered, setFiltered] = useState<Registration[]>([]);
  const [settings, setSettings] = useState({ startDate: '', lastDate: '', formEnabled: true });
  const [stats, setStats] = useState<DashboardStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [activeTab, setActiveTab] = useState('registrations');
  const [sportFilter, setSportFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  
  const [startDateInput, setStartDateInput] = useState('');
  const [lastDateInput, setLastDateInput] = useState('');
  const [viewRegistration, setViewRegistration] = useState<Registration | null>(null);

  const [visibleRecords, setVisibleRecords] = useState(20);
  
  const [tournamentName, setTournamentName] = useState("");
  const [tournamentSport, setTournamentSport] = useState("");
  const [tournamentStartDate, setTournamentStartDate] = useState("");
  const [tournamentLastDate, setTournamentLastDate] = useState("");
  const [tournamentLocation, setTournamentLocation] = useState("");
  const [tournamentImage, setTournamentImage] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const dashboardRef = useRef<HTMLDivElement>(null);

  // Corporate Formatted Excel Export Engine Pipeline
  const exportToExcel = (dataList: Registration[]) => {
    if (dataList.length === 0) {
      toast.error("No dataset available to generate sheet.");
      return;
    }

    const reportTitleMetadata = [
      ["KHELO MEWAT OFFICIAL TOURNAMENT REGISTRATION LEDGER MASTER SUMMARY REPORT"],
      ["Generated Datetime:", new Date().toLocaleString('en-IN'), "Total Matching Records Row:", dataList.length],
      ["Portal Verified Context Authority:", "khelomewat.in"],
      [] 
    ];

    const headers = [
      "Registration ID", "Student Name", "Father Name", "Date of Birth", 
      "Gender", "Email Address", "Mobile Phone", "School Name", 
      "Block/Tehsil", "Village/Area", "Pincode", "Street Address", 
      "Sport Category", "Event / Weight Division", "Submission Date", "Application Status"
    ];

    const dataRows = dataList.map(r => [
      `"${r.id}"`,
      `"${(r.studentName || '').replace(/"/g, '""')}"`,
      `"${(r.fatherName || '').replace(/"/g, '""')}"`,
      `"${formatDOB(r.dateOfBirth)}"`,
      `"${r.gender || ''}"`,
      `"${r.email || ''}"`,
      `"${r.phone || ''}"`,
      `"${(r.schoolName || '').replace(/"/g, '""')}"`,
      `"${(r.block || '').replace(/"/g, '""')}"`,
      `"${(r.village || '').replace(/"/g, '""')}"`,
      `"${r.pincode || ''}"`,
      `"${(r.address || '').replace(/"/g, '""')}"`,
      `"${(r.sport || '').toUpperCase()}"`,
      `"${r.subSport || 'N/A'}"`,
      `"${new Date(r.submittedAt).toLocaleDateString('en-IN')}"`,
      `"${(r.status || '').toUpperCase()}"`
    ]);

    const finalCsvStringArray = [
      ...reportTitleMetadata.map(row => row.join(",")),
      headers.join(","),
      ...dataRows.map(row => row.join(","))
    ].join("\n");

    const csvBlobObject = new Blob(["\uFEFF" + finalCsvStringArray], { type: 'text/csv;charset=utf-8;' });
    const dynamicBlobUrlReference = URL.createObjectURL(csvBlobObject);
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dynamicBlobUrlReference);
    downloadAnchor.setAttribute("download", `KheloMewat_Master_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(dynamicBlobUrlReference);
    
    toast.success(`Professional Excel formatted log successfully created for ${dataList.length} athletes!`);
  };

  // High-End Anti-Forgery Single Page Printing System Layout Injection Engine (Beautiful & Bulletproof)
  const exportIndividualPDF = (reg: Registration) => {
    const windowContext = window.open('', '_blank');
    if (!windowContext) {
      toast.error("Popup window display blocked by browser security controls!");
      return;
    }

    windowContext.document.write(`
      <html>
        <head>
          <title>Enrolment_Receipt_${reg.studentName.replace(/\s+/g, '_')}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            
            body { 
              font-family: 'Inter', sans-serif; 
              color: #0F172A; 
              background-color: #FFFFFF; 
              padding: 0; 
              margin: 0; 
              line-height: 1.4;
              font-size: 11px;
              position: relative;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            /* Anti-Forgery Hologram Fluid Background Grid */
            .watermark-overlay {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 0;
              pointer-events: none;
              opacity: 0.035;
              transform: rotate(-25deg) scale(1.2);
              display: block;
            }
            
            .watermark-row {
              white-space: nowrap;
              font-size: 34px;
              font-weight: 800;
              color: #0A1628;
              letter-spacing: 0.15em;
              margin-bottom: 90px;
            }
            
            .container-wrapper {
              position: relative;
              z-index: 10;
              border: 2px solid #0A1628;
              padding: 24px;
              border-radius: 12px;
              box-sizing: border-box;
              background: transparent;
            }
            
            .header-table { 
              width: 100%; 
              border-collapse: collapse; 
              border-bottom: 3px solid #F37022; 
              margin-bottom: 20px; 
            }
            
            .brand-logo-img {
              height: 65px;
              width: auto;
              object-fit: contain;
              display: block;
              margin-bottom: 12px;
            }
            
            .title-block {
              text-align: right;
              vertical-align: top;
            }
            
            .main-app-title { 
              font-size: 22px; 
              font-weight: 800; 
              color: #0A1628; 
              margin: 0; 
              text-transform: uppercase; 
              letter-spacing: -0.01em;
            }
            
            .system-token-id { 
              margin: 4px 0 0 0; 
              font-size: 11px; 
              font-family: monospace; 
              color: #475569; 
              font-weight: bold;
            }
            
            .status-badge-capsule { 
              display: inline-block;
              padding: 5px 14px; 
              font-size: 10px; 
              font-weight: 700; 
              text-transform: uppercase; 
              border-radius: 6px; 
              border: 1px solid #CBD5E1; 
              margin-top: 8px;
            }
            
            .approved { background-color: #DCFCE7 !important; color: #166534 !important; border-color: #BBF7D0; }
            .pending { background-color: #FEF3C7 !important; color: #92400E !important; border-color: #FDE68A; }
            .rejected { background-color: #FEE2E2 !important; color: #991B1B !important; border-color: #FCA5A5; }
            
            .section-row-header { 
              font-size: 11px; 
              font-weight: 800; 
              color: #FFFFFF; 
              background-color: #0A1628 !important;
              text-transform: uppercase; 
              letter-spacing: 0.05em; 
              margin: 18px 0 10px 0; 
              padding: 6px 10px;
              border-radius: 4px;
            }
            
            /* Preserved Table Grid to prevent browser collapse anomaly */
            .data-table-layout {
              width: 100%;
              border-collapse: separate;
              border-spacing: 8px;
              margin-top: -8px;
            }
            
            .card-info-box { 
              background-color: #F8FAFC !important; 
              border: 1px solid #E2E8F0; 
              padding: 10px 14px; 
              border-radius: 6px; 
              vertical-align: top;
            }
            
            .meta-label-tag { 
              font-size: 9px; 
              font-weight: 700; 
              color: #64748B; 
              text-transform: uppercase; 
              letter-spacing: 0.03em;
              margin-bottom: 4px; 
            }
            
            .meta-value-text { 
              font-size: 13px; 
              font-weight: 600; 
              color: #0F172A;
            }
            
            .special-sport-value {
              color: #F37022;
              font-weight: 800;
              font-size: 14px;
            }
            
            .official-anti-fake-seal-footer {
              margin-top: 35px;
              padding-top: 15px;
              border-top: 2px dashed #E2E8F0;
            }
            
            .seal-table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .security-verification-seal-badge {
              border: 2px dashed #F37022;
              padding: 10px 16px;
              border-radius: 8px;
              background-color: #FFF7ED !important;
              display: inline-block;
            }
            
            .seal-bold-claims-text {
              font-size: 11px;
              font-weight: 800;
              color: #0A1628;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.03em;
            }
            
            .seal-subtext-domain {
              font-size: 9px;
              color: #EA580C;
              margin: 3px 0 0 0;
              font-weight: bold;
              font-family: monospace;
            }
            
            .footer-disclaimer-note {
              text-align: right;
              font-size: 10px;
              color: #64748B;
              font-weight: 500;
              vertical-align: middle;
            }
            
            @media print {
              html, body {
                height: 99%;
                overflow: hidden;
              }
              .container-wrapper {
                border: 2px solid #0A1628;
              }
            }
          </style>
        </head>
        <body>
          
          <div class="watermark-overlay">
            <div class="watermark-row">KHELO MEWAT • KHELOMEWAT.IN • KHELO MEWAT • KHELOMEWAT.IN</div>
            <div class="watermark-row">KHELOMEWAT.IN • KHELO MEWAT • KHELOMEWAT.IN • KHELO MEWAT</div>
            <div class="watermark-row">KHELO MEWAT • KHELOMEWAT.IN • KHELO MEWAT • KHELOMEWAT.IN</div>
            <div class="watermark-row">KHELOMEWAT.IN • KHELO MEWAT • KHELOMEWAT.IN • KHELO MEWAT</div>
            <div class="watermark-row">KHELO MEWAT • KHELOMEWAT.IN • KHELO MEWAT • KHELOMEWAT.IN</div>
          </div>

          <div class="container-wrapper">
            <table class="header-table">
              <tr>
                <td style="width: 50%;">
                  <img src="/images/logop.png" onerror="this.src='https://placehold.co/220x70?text=KHELO+MEWAT'" class="brand-logo-img" alt="Official Logo" />
                </td>
                <td class="title-block">
                  <h1 class="main-app-title">Athlete Enrolment Card</h1>
                  <p class="system-token-id">UID: ${reg.id}</p>
                  <span class="status-badge-capsule ${reg.status}">${reg.status}</span>
                </td>
              </tr>
            </table>

            <div class="section-row-header">Personal Bio Details</div>
            <table class="data-table-layout">
              <tr>
                <td class="card-info-box" style="width: 33.33%;"><div class="meta-label-tag">Player Name</div><div class="meta-value-text">${reg.studentName}</div></td>
                <td class="card-info-box" style="width: 33.33%;"><div class="meta-label-tag">Father's Name</div><div class="meta-value-text">${reg.fatherName}</div></td>
                <td class="card-info-box" style="width: 33.33%;"><div class="meta-label-tag">Date of Birth</div><div class="meta-value-text">${formatDOB(reg.dateOfBirth)}</div></td>
              </tr>
              <tr>
                <td class="card-info-box"><div class="meta-label-tag">Gender Identity</div><div class="meta-value-text" style="text-transform:capitalize;">${reg.gender}</div></td>
                <td class="card-info-box"><div class="meta-label-tag">Mobile Communication</div><div class="meta-value-text">+91 ${reg.phone}</div></td>
                <td class="card-info-box"><div class="meta-label-tag">Registered Email</div><div class="meta-value-text">${reg.email}</div></td>
              </tr>
            </table>

            <div class="section-row-header">Academic Institutional & Demographics Map</div>
            <table class="data-table-layout">
              <tr>
                <td class="card-info-box" colspan="3"><div class="meta-label-tag">Allocated School Name</div><div class="meta-value-text">${reg.schoolName}</div></td>
              </tr>
              <tr>
                <td class="card-info-box" style="width: 33.33%;"><div class="meta-label-tag">Block / Tehsil</div><div class="meta-value-text">${reg.block}</div></td>
                <td class="card-info-box" style="width: 33.33%;"><div class="meta-label-tag">Village / Area Location</div><div class="meta-value-text">${reg.village}</div></td>
                <td class="card-info-box" style="width: 33.33%;"><div class="meta-label-tag">Postal Pincode</div><div class="meta-value-text">${reg.pincode}</div></td>
              </tr>
              <tr>
                <td class="card-info-box" colspan="3"><div class="meta-label-tag">Full Structural Street Address</div><div class="meta-value-text">${reg.address}, ${reg.district}, ${reg.state}</div></td>
              </tr>
            </table>

            <div class="section-row-header">Sports Competitive Profiling</div>
            <table class="data-table-layout">
              <tr>
                <td class="card-info-box" style="width: 50%;"><div class="meta-label-tag">Main Sports Category Discipline</div><div class="meta-value-text special-sport-value" style="text-transform:uppercase;">${reg.sport}</div></td>
                <td class="card-info-box" style="width: 50%;"><div class="meta-label-tag">Dynamic Event / Weight Division</div><div class="meta-value-text font-semibold text-slate-800">${reg.subSport || 'N/A'}</div></td>
              </tr>
            </table>

            <div class="official-anti-fake-seal-footer">
              <table class="seal-table">
                <tr>
                  <td style="width: 60%;">
                    <div class="security-verification-seal-badge">
                      <p class="seal-bold-claims-text">🛡️ SECURE VERIFIED PROFILE SYSTEM SEAL</p>
                      <p class="seal-subtext-domain">Official Digital Registration Seal • khelomewat.in</p>
                    </div>
                  </td>
                  <td class="footer-disclaimer-note">
                    <p style="margin:0; font-weight:700; color:#0A1628;">System Timestamp Payload</p>
                    <p style="margin:2px 0 0 0; font-family:monospace; font-size:9px; color:#F37022; font-weight:bold;">${new Date(reg.submittedAt).toLocaleString('en-IN')}</p>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <script>
            window.print();
            setTimeout(() => { window.close(); }, 700);
          </script>
        </body>
      </html>
    `);
    windowContext.document.close();
  };

  useEffect(() => {
    const activeSportKey = tournamentSport?.toLowerCase();
    if (activeSportKey && sportImageMap[activeSportKey]) {
      setTournamentImage(sportImageMap[activeSportKey]);
    } else {
      setTournamentImage('https://placehold.co/600x400?text=Sports+Tournament');
    }
  }, [tournamentSport]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [user, isAdmin, authLoading, navigate]);

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

  useEffect(() => {
    if (!dashboardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.stat-card', {
        y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
      });
    }, dashboardRef.current);
    return () => ctx.revert();
  }, []);

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

  // NEW: Approve All Registrations Function
  const approveAllRegistrations = async () => {
    const pendingCount = filtered.filter(r => r.status === 'pending').length;
    
    if (filtered.length === 0) {
      toast.error('No registrations available to approve');
      return;
    }

    if (pendingCount === 0) {
      toast.error('No pending registrations to approve');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to approve all ${pendingCount} pending registrations?`)) return;
    
    try {
      for (const reg of filtered) {
        if (reg.status === 'pending') {
          await update(ref(db, `registrations/${reg.id}`), { status: 'approved' });
        }
      }
      toast.success(`✅ ${pendingCount} registrations approved successfully!`);
    } catch {
      toast.error('Failed to approve some registrations');
    }
  };

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
  const pendingCount = filtered.filter(r => r.status === 'pending').length;

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

              {/* Export Button Layout Row Control + APPROVE ALL BUTTON */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <p className="text-xs text-slate-500 font-inter">
                  Generate professional spreadsheet logs based on your live dashboard search query filters.
                </p>
                <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-end">
                  {pendingCount > 0 && (
                    <button
                      onClick={approveAllRegistrations}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-inter text-xs font-bold shadow-sm transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve All ({pendingCount})
                    </button>
                  )}
                  <button
                    onClick={() => exportToExcel(filtered)}
                    className="flex items-center gap-2 bg-[#0A1628] hover:bg-[#1E293B] text-white px-4 py-2 rounded-lg font-inter text-xs font-bold shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-[#f37022]" />
                    Download Excel List ({filtered.length} Records)
                  </button>
                </div>
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
                            <span className="text-[10px] text-slate-400 font-inter block truncate max-w-[180px]">
                              {reg.subSport || 'N/A'}
                            </span>
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
                    <p className="text-slate-900 font-inter text-sm">{formatDOB(viewRegistration.dateOfBirth)}</p>
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

                <div>
                  <label className="text-slate-500 text-xs font-inter">Event / Weight Division Category</label>
                  <p className="text-slate-800 font-inter text-sm font-medium">{viewRegistration.subSport || 'N/A'}</p>
                </div>

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
