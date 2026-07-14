import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, Mail, ChevronRight, ArrowLeft, ShieldCheck, CheckCircle2, Leaf, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AVAILABLE_SLOTS = [
  { id: '09:00', label: '09:00 - 10:00' },
  { id: '10:00', label: '10:00 - 11:00' },
  // 11:00 - 13:30 Ishoma & Sholat Jumat
  { id: '13:30', label: '13:30 - 14:30' },
  { id: '14:30', label: '14:30 - 15:30' },
];

// Sandi admin baru (6 karakter, tidak berurutan)
const ADMIN_PIN = 'DDFIQU';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const getNextFriday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = (day <= 5) ? (5 - day) : (12 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
};

const Navbar = ({ setView, view }) => (
  <nav className="w-full bg-white border-b border-[#EAEFEA] sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-6 lg:px-8">
      <div className="flex justify-between h-20 items-center">
        <div 
          className="flex items-center cursor-pointer" 
          onClick={() => setView('home')}
        >
          <div className="bg-[#F0F4F2] p-2 rounded-lg mr-3">
            <Leaf className="h-5 w-5 text-[#4A5D54]" strokeWidth={2} />
          </div>
          <span className="font-serif text-xl font-medium text-[#1E2923] tracking-tight">MindCare</span>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={() => setView('booking')}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${view === 'booking' ? 'bg-[#F0F4F2] text-[#4A5D54]' : 'text-[#6B7974] hover:bg-[#F9FAF9]'}`}
          >
            Reservasi
          </button>
          <div className="w-px h-5 bg-[#EAEFEA] mx-2"></div>
          <button 
            onClick={() => setView('admin_auth')}
            className="text-[#8BA398] hover:text-[#4A5D54] p-2 rounded-lg hover:bg-[#F0F4F2] transition-colors"
            title="Akses Pengelola"
          >
            <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const HomeView = ({ setView }) => (
  <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto px-6 lg:px-8 py-12 md:py-20 animate-fade-in w-full">
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div className="space-y-8 text-left">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1E2923] leading-[1.15] tracking-tight">
          Ketenangan dimulai dari langkah pertama.
        </h1>
        <p className="text-lg text-[#6B7974] leading-relaxed max-w-md">
          Kami menyediakan ruang aman dan rahasia setiap hari Jumat. Konsultasikan isi pikiranmu dengan tenaga profesional kami.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => setView('booking')}
            className="bg-[#4A5D54] text-white px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-[#3C4B44] transition-colors flex items-center justify-center group"
          >
            Jadwalkan Sesi Sekarang
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="flex items-center gap-6 pt-8 border-t border-[#EAEFEA] mt-12">
          <div className="flex items-center gap-2 text-sm text-[#6B7974]">
            <Clock className="w-4 h-4 text-[#8BA398]" />
            <span>Setiap Jumat</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7974]">
            <Info className="w-4 h-4 text-[#8BA398]" />
            <span>Privasi Terjamin</span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex justify-end">
        <div className="w-full max-w-md aspect-square bg-[#F0F4F2] rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between border border-[#EAEFEA]">
           <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Leaf className="w-6 h-6 text-[#4A5D54]" />
              </div>
           </div>
           <div>
             <h3 className="font-serif text-2xl text-[#1E2923] mb-2">MindCare</h3>
             <p className="text-[#6B7974] text-sm">Mental Health Support System</p>
           </div>
           {/* Decorative elements representing structure */}
           <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-[#EAEFEA] rounded-full opacity-50"></div>
           <div className="absolute bottom-0 right-10 w-24 h-24 bg-[#E2EAE5] rounded-tl-full opacity-50"></div>
        </div>
      </div>
    </div>
  </div>
);

const BookingView = ({ setView, appointments, setAppointments }) => {
  const [selectedDate, setSelectedDate] = useState(getNextFriday());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const takenSlots = useMemo(() => {
    return appointments
      .filter(app => app.date === selectedDate)
      .map(app => app.timeSlot);
  }, [appointments, selectedDate]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    const day = new Date(newDate).getDay();
    if (day !== 5) {
      setErrorMsg('Layanan kami hanya beroperasi pada hari Jumat.');
      setSelectedDate('');
      setSelectedSlot('');
    } else {
      setErrorMsg('');
      setSelectedDate(newDate);
      setSelectedSlot('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !formData.name || !formData.email) return setErrorMsg('Mohon lengkapi formulir reservasi.');
    if (takenSlots.includes(selectedSlot)) return setErrorMsg('Maaf, slot waktu ini baru saja terisi.');

    setIsSubmitting(true);
    setErrorMsg('');
    
    setTimeout(() => {
      const newAppointment = {
        id: Date.now().toString(),
        date: selectedDate, 
        timeSlot: selectedSlot,
        userName: formData.name, 
        userEmail: formData.email,
        createdAt: new Date().toISOString(), 
        status: 'booked'
      };
      
      setAppointments([...appointments, newAppointment]);
      setSuccessMsg(`Reservasi berhasil. Sesi dijadwalkan pada ${formatDate(selectedDate)} pukul ${selectedSlot}.`);
      setFormData({ name: '', email: '' }); 
      setSelectedSlot('');
      setIsSubmitting(false);
    }, 800);
  };

  if (successMsg) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F7F9F8]">
        <div className="clean-card p-10 max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 bg-[#E2EAE5] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#4A5D54]" strokeWidth={2} />
          </div>
          <h2 className="font-serif text-2xl text-[#1E2923] mb-3">Reservasi Berhasil</h2>
          <p className="text-[#6B7974] text-sm mb-8 leading-relaxed">{successMsg}</p>
          <button 
            onClick={() => { setSuccessMsg(''); setView('home'); }} 
            className="w-full bg-[#4A5D54] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#3C4B44] transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-6 md:py-16 bg-[#F7F9F8]">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setView('home')} className="flex items-center text-sm text-[#6B7974] hover:text-[#1E2923] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
        </button>

        <div className="clean-card p-8 md:p-10">
          <div className="mb-8 border-b border-[#EAEFEA] pb-6">
            <h2 className="font-serif text-3xl text-[#1E2923] mb-2">Formulir Reservasi</h2>
            <p className="text-[#6B7974] text-sm">Pilih jadwal luang di hari Jumat untuk sesi personal berdurasi 60 menit.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="bg-[#FFF8F8] text-[#D14343] p-4 rounded-xl text-sm border border-[#FDECEC] flex items-start">
                 <Info className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
                 <p>{errorMsg}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E2923]">Tanggal Konseling</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-[#8BA398]" />
                  </div>
                  <input 
                    type="date" value={selectedDate} onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-standard pl-10" required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#1E2923]">Pilih Waktu (Jumat)</label>
                <div className="grid grid-cols-1 gap-3">
                  {AVAILABLE_SLOTS.map((slot) => {
                    const isTaken = takenSlots.includes(slot.id);
                    return (
                      <button
                        key={slot.id} type="button" disabled={isTaken || !selectedDate}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`px-4 py-3 border rounded-xl text-sm font-medium transition-all text-left flex justify-between items-center ${
                          isTaken 
                            ? 'bg-[#F9FAF9] border-[#EAEFEA] text-[#A9B8B0] cursor-not-allowed' 
                            : selectedSlot === slot.id
                              ? 'bg-[#E2EAE5] border-[#4A5D54] text-[#1E2923]'
                              : 'bg-white border-[#EAEFEA] text-[#4A5D54] hover:border-[#8BA398]'
                        }`}
                      >
                        <span>{slot.label}</span>
                        {isTaken && <span className="text-xs font-normal">Penuh</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#8BA398] mt-2">* Jeda Ishoma: 11:00 - 13:30 WIB</p>
              </div>
            </div>

            <div className="border-t border-[#EAEFEA] pt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1E2923]">Nama Lengkap </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-[#8BA398]" />
                    </div>
                    <input 
                      type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input-standard pl-10" placeholder="Joan D Arc" required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1E2923]">Alamat Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#8BA398]" />
                    </div>
                    <input 
                      type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-standard pl-10" placeholder="nama@email.com" required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" disabled={isSubmitting || !selectedSlot}
                className={`w-full md:w-auto px-8 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isSubmitting || !selectedSlot
                    ? 'bg-[#EAEFEA] text-[#8BA398] cursor-not-allowed'
                    : 'bg-[#4A5D54] text-white hover:bg-[#3C4B44]'
                }`}
              >
                {isSubmitting ? 'Memproses...' : 'Konfirmasi Sesi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminAuth = ({ onLogin, setView }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) onLogin();
    else { setError(true); setPin(''); }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#F7F9F8]">
      <div className="clean-card p-10 max-w-sm w-full animate-fade-in">
        <div className="mb-6 border-b border-[#EAEFEA] pb-6 text-center">
          <div className="w-12 h-12 bg-[#F0F4F2] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-[#4A5D54]" strokeWidth={2} />
          </div>
          <h2 className="font-serif text-xl text-[#1E2923]">Akses Administrator</h2>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#6B7974] mb-2 uppercase tracking-wider text-center">
              Masukkan Sandi (6 Karakter)
            </label>
            <input 
              type="password" 
              value={pin} 
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              className={`w-full text-center p-3 text-2xl tracking-[0.5em] font-mono rounded-xl border outline-none transition-colors ${
                error ? 'border-[#D14343] bg-[#FFF8F8] text-[#D14343]' : 'border-[#EAEFEA] bg-[#F9FAF9] text-[#1E2923] focus:border-[#4A5D54]'
              }`}
              placeholder="••••••" 
              maxLength="6" 
              autoFocus
            />
          </div>
          <button type="submit" className="w-full bg-[#1E2923] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#2C3631] transition-colors">
            Autentikasi
          </button>
        </form>
        
        <button onClick={() => setView('home')} className="w-full mt-6 text-[#8BA398] text-sm hover:text-[#1E2923] transition-colors">
          Batal
        </button>
      </div>
    </div>
  );
};

const AdminDashboard = ({ appointments, setView }) => {
  const monthlyData = useMemo(() => {
    const counts = Array(12).fill(0);
    appointments.forEach(app => {
      if (app.date) {
        const monthIndex = new Date(app.date).getMonth();
        counts[monthIndex]++;
      }
    });
    return MONTHS.map((month, index) => ({ name: month, Sesi: counts[index] }))
                 .filter((_, index) => index <= new Date().getMonth() + 1);
  }, [appointments]);

  return (
    <div className="flex-1 p-6 md:p-10 bg-[#F7F9F8]">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center clean-card p-6">
          <div>
            <h1 className="font-serif text-2xl text-[#1E2923] mb-1">Dashboard Laporan</h1>
            <p className="text-[#6B7974] text-sm">Statistik dan manajemen sesi konseling bulanan.</p>
          </div>
          <button 
            onClick={() => setView('home')}
            className="mt-4 md:mt-0 px-4 py-2 rounded-lg border border-[#EAEFEA] text-[#4A5D54] text-sm font-medium hover:bg-[#F0F4F2] transition-colors"
          >
            Keluar Sistem
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 clean-card p-6">
            <h3 className="text-sm font-medium text-[#1E2923] mb-6 border-b border-[#EAEFEA] pb-4">Tren Konseling Bulanan</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFEA" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7974', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7974', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    cursor={{fill: '#F0F4F2'}}
                    contentStyle={{borderRadius: '8px', border: '1px solid #EAEFEA', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}
                  />
                  <Bar dataKey="Sesi" fill="#4A5D54" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="clean-card p-6 bg-[#1E2923] text-white border-none shadow-md">
              <h3 className="text-[#8BA398] text-sm font-medium mb-2">Total Seluruh Sesi</h3>
              <p className="font-serif text-5xl">{appointments.length}</p>
            </div>
            
            <div className="clean-card p-6">
              <h3 className="text-sm font-medium text-[#1E2923] mb-4 border-b border-[#EAEFEA] pb-3">Informasi Sistem</h3>
              <ul className="space-y-3 text-sm text-[#6B7974]">
                <li className="flex justify-between"><span>Jadwal Aktif</span> <span className="font-medium text-[#1E2923]">Hari Jumat</span></li>
                <li className="flex justify-between"><span>Jam Kerja</span> <span className="font-medium text-[#1E2923]">09:00 - 15:30</span></li>
                <li className="flex justify-between"><span>Istirahat</span> <span className="font-medium text-[#1E2923]">11:00 - 13:30</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="clean-card overflow-hidden">
          <div className="p-6 border-b border-[#EAEFEA] bg-white">
            <h3 className="text-sm font-medium text-[#1E2923]">Daftar Klien Terdaftar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F9FAF9] text-[#6B7974] border-b border-[#EAEFEA]">
                <tr>
                  <th className="px-6 py-4 font-medium">Nama Klien</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Jam</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEA] bg-white">
                {appointments.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-10 text-[#8BA398]">Belum ada data reservasi.</td></tr>
                ) : (
                  appointments.sort((a, b) => new Date(b.date) - new Date(a.date)).map((app) => (
                    <tr key={app.id} className="hover:bg-[#F9FAF9] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-[#1E2923]">{app.userName}</div>
                        <div className="text-xs text-[#8BA398]">{app.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-[#4A5D54]">{formatDate(app.date)}</td>
                      <td className="px-6 py-4 text-[#4A5D54]">{app.timeSlot}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#E2EAE5] text-[#4A5D54]">
                          Terkonfirmasi
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('home');
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('mindcare_appointments');
    if (savedData) {
      try {
        setAppointments(JSON.parse(savedData));
      } catch (e) {
        console.error("Gagal membaca data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mindcare_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Clean CSS Injection
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
      
      body { 
        font-family: 'Plus Jakarta Sans', sans-serif; 
        background-color: #F7F9F8; 
      }
      .font-serif { 
        font-family: 'Playfair Display', serif; 
      }
      
      .clean-card { 
        background: #FFFFFF; 
        border-radius: 1rem; 
        border: 1px solid #EAEFEA;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);
      }
      
      .input-standard { 
        width: 100%;
        padding: 0.75rem 1rem;
        background: #F9FAF9; 
        border: 1px solid #EAEFEA; 
        border-radius: 0.75rem;
        color: #1E2923;
        transition: all 0.2s ease; 
      }
      .input-standard:focus { 
        background: #FFFFFF; 
        border-color: #8BA398; 
        outline: none; 
        box-shadow: 0 0 0 3px rgba(139, 163, 152, 0.1); 
      }
      
      @keyframes fadeIn { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
      }
      .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const renderView = () => {
    switch (view) {
      case 'home': return <HomeView setView={setView} />;
      case 'booking': return <BookingView setView={setView} appointments={appointments} setAppointments={setAppointments} />;
      case 'admin_auth': return isAdminAuth ? <AdminDashboard appointments={appointments} setView={setView} /> : <AdminAuth onLogin={() => { setIsAdminAuth(true); setView('admin_dashboard'); }} setView={setView} />;
      case 'admin_dashboard': return isAdminAuth ? <AdminDashboard appointments={appointments} setView={setView} /> : <HomeView setView={setView} />;
      default: return <HomeView setView={setView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#E2EAE5] selection:text-[#1E2923]">
      <Navbar setView={setView} view={view} />
      <main className="flex-1 flex flex-col bg-[#F7F9F8]">
        {renderView()}
      </main>
    </div>
  );
}
