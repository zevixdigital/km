import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface Tournament {
  id: string;
  name: string;
  sport: string;
  date: string;
  location: string;
  lastDate: string;
  status: "open" | "closed";
  image: string;
}

export default function TournamentSection() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from Firebase Realtime Database
  useEffect(() => {
    const tournamentRef = ref(db, "tournaments");

    const unsub = onValue(tournamentRef, (snapshot) => {
      const data = snapshot.val() || {};
      
      const list = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      })) as Tournament[];

      setTournaments(list);
      setLoading(false);
    });

    return unsub;
  }, []);

  // Timezone safe Date Formatter (Prevents single day lag/shift glitches)
  const formatIndianDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const parts = dateStr.split("-"); // Expecting YYYY-MM-DD from input type="date"
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY Format
    }
    
    // Fallback if data format varies
    const parsedDate = new Date(dateStr);
    return isNaN(parsedDate.getTime()) ? dateStr : parsedDate.toLocaleDateString("en-IN");
  };

  // Automatic Deadline Expire Checker
  const isExpired = (lastDateStr: string, databaseStatus: string) => {
    if (databaseStatus === "closed") return true;
    if (!lastDateStr) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparisons
    const deadline = new Date(lastDateStr);
    return today > deadline;
  };

  if (loading) {
    return (
      <section className="py-16 bg-[#F7F2E9] text-center font-inter text-slate-600">
        Loading schedule data...
      </section>
    );
  }

  return (
    <section className="py-16 bg-[#F7F2E9]">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-10">
          <div>
            <h2 className="text-4xl font-bold text-[#f37022] mb-3">
              Current Tournament Schedule
            </h2>
            <p className="text-slate-600">
              Register for upcoming tournaments. Check deadlines and venues.
            </p>
          </div>

          <Link
            to="/register"
            className="mt-4 lg:mt-0 text-[#f37022] font-semibold flex items-center gap-2 hover:underline"
          >
            View All Tournaments
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Counter */}
        <div className="mb-4 text-sm text-slate-500 font-medium">
          Total Tournaments Available: {tournaments.length}
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => {
            const registrationClosed = isExpired(tournament.lastDate, tournament.status);

            return (
              <div
                key={tournament.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image wrapper */}
                  <div className="relative h-60 w-full bg-slate-100">
                    <img
                      src={tournament.image}
                      alt={tournament.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://placehold.co/600x400?text=Tournament";
                      }}
                    />

                    <div
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                        registrationClosed ? "bg-red-600" : "bg-green-600"
                      }`}
                    >
                      {registrationClosed ? "CLOSED" : "OPEN"}
                    </div>
                  </div>

                  {/* Info Details */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-[#f37022]/10 text-[#f37022] text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                        {tournament.sport}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">
                      {tournament.name}
                    </h3>

                    <div className="space-y-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#f37022] shrink-0" />
                        <span className="font-medium text-slate-800">Event Date:</span> {formatIndianDate(tournament.date)}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#f37022] shrink-0" />
                        <span className="line-clamp-1">{tournament.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-[#f37022] shrink-0" />
                        <span className="font-medium text-slate-800">Last Date:</span>{" "}
                        {formatIndianDate(tournament.lastDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Call to Action Button */}
                <div className="p-5 pt-0 mt-auto">
                  {registrationClosed ? (
                    <div className="flex items-center justify-center gap-2 text-red-600 bg-red-50 border border-red-100 py-3 rounded-lg font-medium text-sm">
                      <AlertCircle size={16} />
                      Registration Closed
                    </div>
                  ) : (
                    <Link
                      to="/register"
                      className="block text-center bg-[#f37022] text-white hover:bg-[#e05f13] py-3 rounded-lg font-medium transition duration-200 shadow-sm"
                    >
                      Register Now
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}