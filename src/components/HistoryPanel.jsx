import { useState, useEffect } from "react";
import { 
  History, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Calendar 
} from "lucide-react";

export default function HistoryPanel({ isOpen, onClose }) {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.requests || []);
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (request) => {
    if (request.cocViolation || request.nsfw) return "text-red-600";
    if (request.rubbish) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusBg = (request) => {
    if (request.cocViolation || request.nsfw) return "bg-red-50 border-red-200";
    if (request.rubbish) return "bg-yellow-50 border-yellow-200";
    return "bg-green-50 border-green-200";
  };

  const getStatusIcon = (request) => {
    if (request.cocViolation || request.nsfw) return <XCircle className="w-4 h-4" />;
    if (request.rubbish) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getStatusText = (request) => {
    if (request.cocViolation || request.nsfw) return "Blocked";
    if (request.rubbish) return "Flagged";
    return "Approved";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Moderation History</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchHistory}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh"
                disabled={loading}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-sm text-green-600">Approved</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{stats.flagged}</div>
                <div className="text-sm text-yellow-600">Flagged</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
                <div className="text-sm text-red-600">Blocked</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(80vh - 200px)" }}>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No moderation history found</p>
              <p className="text-sm text-gray-500">Start moderating content to see your history here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className={`rounded-lg p-4 border ${getStatusBg(item)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={getStatusColor(item)}>
                        {getStatusIcon(item)}
                      </span>
                      <span className={`font-medium ${getStatusColor(item)}`}>
                        {getStatusText(item)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center border-t p-4 bg-gray-50">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page}</span>
          <button
            disabled={history.length < 10}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
