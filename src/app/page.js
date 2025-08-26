"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SignInPage from "@/components/SignInPage";
import ModerationForm from "@/components/ModerationForm";
import ModerationResult from "@/components/ModerationResult";
import HistoryPanel from "@/components/HistoryPanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import AdminDashboard from "@/components/AdminDashboard";

export default function HomePage() {
const [session, setSession] = useState(null);
const [loading, setLoading] = useState(true);
const [result, setResult] = useState(null);
const [analyzing, setAnalyzing] = useState(false);
const [showHistory, setShowHistory] = useState(false);
const [showAdmin, setShowAdmin] = useState(false);

// Check authentication status via custom auth
useEffect(() => {
checkAuth();
}, []);

const checkAuth = async () => {
try {
const res = await fetch("/api/auth/me", { credentials: "include" });
if (res.ok) {
const data = await res.json();
// Normalize to shape { user: { id, email, role, isAuthorized } } or null
setSession(data.user ? { user: data.user } : null);
} else {
setSession(null);
}
} catch (error) {
console.error("Auth check failed:", error);
setSession(null);
} finally {
setLoading(false);
}
};

// Go to custom login page
const handleSignIn = () => {
window.location.href = "/auth/login";
};

// Call custom logout API and clear state
const handleSignOut = async () => {
try {
await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
setSession(null);
setResult(null);
} catch (error) {
console.error("Sign out failed:", error);
}
};

const handleModerationSubmit = async (content) => {
setAnalyzing(true);
setResult(null);

try {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ prompt: content }),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    alert("Please sign in to use the moderation tool");
    return;
  }

  if (res.status === 403) {
    // App-level authorization (e.g., admin-only) still enforced by backend
    alert("You are not authorized to use this action");
    return;
  }

  if (!res.ok) {
    setResult({ error: data?.error || "Error fetching response" });
    return;
  }

  setResult(data);
} catch (error) {
  setResult({ error: "Error fetching response" });
} finally {
  setAnalyzing(false);
}
};

const handleToggleHistory = () => {
setShowHistory(!showHistory);
};

const handleToggleAdmin = () => {
setShowAdmin(!showAdmin);
};

// Loading state
if (loading) {
return <LoadingSpinner />;
}

// Not authenticated
if (!session) {
// Reuse your SignInPage wrapper to send users to custom login route
return <SignInPage onSignIn={handleSignIn} />;
}

// Main authenticated app (all signed-in users can use moderation)
return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
<Header session={session} onSignOut={handleSignOut} onToggleHistory={handleToggleHistory} onToggleAdmin={handleToggleAdmin} showHistory={showHistory} showAdmin={showAdmin} />


  <div className="container mx-auto px-4 py-8">
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <p className="text-gray-600 max-w-2xl mx-auto">
          This AI tool is for GDG DevFest Gandhinagar content moderation that checks for Code of Conduct violations and inappropriate material before posting.
        </p>

        {/* Optional: show a limited access hint if not authorized for admin features */}
        {/* {session?.user && !session.user.isAuthorized && (
          <span className="mt-3 inline-block text-xs text-yellow-800 bg-yellow-100 border border-yellow-200 px-2 py-1 rounded">
            Limited access: Admin features hidden
          </span>
        )} */}
      </div>

      <ModerationForm onSubmit={handleModerationSubmit} isLoading={analyzing} />

      {result && <ModerationResult result={result} />}
    </div>

    {/* Footer */}
    <div className="text-center mt-12">
      <p className="text-gray-500 text-sm">
        Powered by AI -  Helping maintain safe community spaces at GDG DevFest
      </p>
    </div>
  </div>

  <HistoryPanel isOpen={showHistory} onClose={() => setShowHistory(false)} />

  {/* Only admins (or authorized if you choose) can view AdminDashboard */}
  {showAdmin && session.user?.role === "admin" && (
    <AdminDashboard session={session} onClose={() => setShowAdmin(false)} />
  )}
</div>
);
}

// Export individual components for reuse
export { Header, SignInPage, ModerationForm, ModerationResult, HistoryPanel, LoadingSpinner };