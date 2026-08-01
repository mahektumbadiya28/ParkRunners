import React, { useState, useEffect } from 'react';
import { Eye, Car, MapPin } from 'lucide-react';
import Badge from '../components/ui/Badge';
import API from '../services/api';
import toast from 'react-hot-toast';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await API.get('/bookings/all');
        setBookings(res.data.data || []);
      } catch (e) {
        toast.error('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleExportCSV = () => {
    if (!bookings.length) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Booking ID', 'Customer', 'Spot', 'Amount', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...bookings.map(b => [
        b.bookingId || b._id.slice(-6).toUpperCase(),
        `"${b.ownerId?.fullName || 'Unknown'}"`,
        `"${b.parkingId?.parkingName || b.parkingId?.address || 'N/A'}"`,
        b.totalAmount,
        b.bookingStatus || 'pending',
        new Date(b.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `volenpark_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV exported successfully');
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={handleExportCSV} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Export CSV
        </button>
      </div>
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 w-full" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">No bookings found in the system.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-left bg-[var(--bg-card-hover)]">
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">ID</th>
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Customer</th>
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Spot</th>
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Amount</th>
                <th className="p-4 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {bookings.map(b => (
                <tr key={b._id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                  <td className="p-4 font-mono text-xs text-[var(--text-muted)]">#{b.bookingId || b._id.slice(-6).toUpperCase()}</td>
                  <td className="p-4">
                    <p className="font-semibold text-[var(--text-primary)]">{b.ownerId?.fullName || 'Unknown'}</p>
                  </td>
                  <td className="p-4">
                    <p className="flex items-center gap-1.5 text-[var(--text-secondary)]"><MapPin className="w-3.5 h-3.5" /> {b.parkingId?.parkingName || b.parkingId?.address || 'N/A'}</p>
                  </td>
                  <td className="p-4 font-bold text-emerald-500">₹{b.totalAmount}</td>
                  <td className="p-4">
                    <Badge variant={b.bookingStatus === 'completed' ? 'success' : b.bookingStatus === 'cancelled' ? 'danger' : 'info'}>
                      {b.bookingStatus || 'pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
