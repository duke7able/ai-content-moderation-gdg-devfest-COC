import { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

export default function ModerationResult({ result }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!result) return null;

  const getStatusColor = () => {
    if (result.error) return "gray";
    if (result.cocViolation || result.nsfw) return "red";
    if (result.rubbish) return "yellow";
    return "green";
  };

  const getStatusIcon = () => {
    if (result.error) return <XCircle className="w-6 h-6" />;
    if (result.cocViolation || result.nsfw) return <XCircle className="w-6 h-6" />;
    if (result.rubbish) return <AlertTriangle className="w-6 h-6" />;
    return <CheckCircle className="w-6 h-6" />;
  };

  const getStatusMessage = () => {
    if (result.error) return "Analysis Failed";
    if (result.cocViolation || result.nsfw) return "Content Blocked";
    if (result.rubbish) return "Content Flagged";
    return "Content Approved";
  };

  const getStatusDescription = () => {
    if (result.error) return "Unable to analyze the content. Please try again.";
    if (result.cocViolation || result.nsfw) return "This content violates community guidelines and cannot be used.";
    if (result.rubbish) return "This content may be inappropriate or low quality.";
    return "This content meets community standards and is safe to use.";
  };

  const statusColor = getStatusColor();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Main Status */}
      <div className={`p-6 ${
        statusColor === 'red' ? 'bg-red-50 border-l-4 border-red-500' :
        statusColor === 'yellow' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
        statusColor === 'green' ? 'bg-green-50 border-l-4 border-green-500' :
        'bg-gray-50 border-l-4 border-gray-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${
              statusColor === 'red' ? 'text-red-600' :
              statusColor === 'yellow' ? 'text-yellow-600' :
              statusColor === 'green' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {getStatusIcon()}
            </div>
            <div>
              <h3 className={`text-xl font-bold ${
                statusColor === 'red' ? 'text-red-800' :
                statusColor === 'yellow' ? 'text-yellow-800' :
                statusColor === 'green' ? 'text-green-800' :
                'text-gray-800'
              }`}>
                {getStatusMessage()}
              </h3>
              <p className={`text-sm ${
                statusColor === 'red' ? 'text-red-700' :
                statusColor === 'yellow' ? 'text-yellow-700' :
                statusColor === 'green' ? 'text-green-700' :
                'text-gray-700'
              }`}>
                {getStatusDescription()}
              </p>
            </div>
          </div>
          
          {!result.error && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200"
            >
              View Details
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      {showDetails && !result.error && (
        <div className="border-t bg-gray-50">
          <div className="p-6">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Detailed Analysis
              {result.id && <span className="text-xs text-gray-500 ml-2">ID: {result.id}</span>}
            </h4>
            
            <div className="grid gap-4">
              {/* CoC Violation */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-800">Code of Conduct Violation</h5>
                  <p className="text-sm text-gray-600">Harassment, discrimination, or hate speech</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  result.cocViolation 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {result.cocViolation ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {result.cocViolation ? 'Detected' : 'Clean'}
                </div>
              </div>

              {/* NSFW */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-800">NSFW Content</h5>
                  <p className="text-sm text-gray-600">Adult, sexual, or inappropriate material</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  result.nsfw 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {result.nsfw ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {result.nsfw ? 'Detected' : 'Clean'}
                </div>
              </div>

              {/* Quality Check */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div>
                  <h5 className="font-medium text-gray-800">Quality Check</h5>
                  <p className="text-sm text-gray-600">Spam, low quality, or controversial content</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  result.rubbish 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {result.rubbish ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {result.rubbish ? 'Flagged' : 'Good'}
                </div>
              </div>

              {/* AI Feedback */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">AI Analysis Feedback</h5>
                <p className="text-blue-700 text-sm">{result.feedback}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {result.error && (
        <div className="p-6 bg-red-50">
          <div className="flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-800">Analysis Failed</h4>
              <p className="text-red-700 text-sm">{result.error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}