// components/Header.js
import { Shield, History, Settings, LogOut, User } from "lucide-react";

export default function Header({ 
  session, 
  onSignOut, 
  onToggleHistory, 
  onToggleAdmin, 
  showHistory, 
  showAdmin 
}) {
  if (!session) return null;

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">GDG DevFest GN</h1>
              <p className="text-sm text-gray-600">Content Moderator</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* History Button */}
            <button
              onClick={onToggleHistory}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                showHistory 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* Admin Button (only for admins) */}
            {session?.user?.role === 'admin' && (
              <button
                onClick={onToggleAdmin}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  showAdmin 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* User Profile (text first, icon on right) */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-800">{session.user.name}</p>
                <p className="text-xs text-gray-600">{session.user.email}</p>
              </div>
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// import { Shield, LogOut, User, History } from "lucide-react";

// export default function Header({ session, onSignOut, onToggleHistory, showHistory }) {
//   if (!session) return null;

//   return (
//     <div className="bg-white shadow-sm border-b">
//       <div className="container mx-auto px-4 py-4">
//         <div className="flex items-center justify-between">
//           {/* Logo and Title */}
//           <div className="flex items-center gap-3">
//             <Shield className="w-8 h-8 text-blue-600" />
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">GDG DevFest</h1>
//               <p className="text-sm text-gray-600">Content Moderator</p>
//             </div>
//           </div>

//           {/* User Profile and Actions */}
//           <div className="flex items-center gap-3">
//             <button
//               onClick={onToggleHistory}
//               className={`p-2 rounded-lg transition-colors duration-200 ${
//                 showHistory 
//                   ? 'bg-blue-100 text-blue-600' 
//                   : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
//               }`}
//               title="View History"
//             >
//               <History className="w-5 h-5" />
//             </button>

//             <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
//               <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
//                 <User className="w-5 h-5 text-white" />
//               </div>
//               <div className="text-right">
//                 <p className="text-sm font-medium text-gray-800">{session.user.name}</p>
//                 <p className="text-xs text-gray-600">{session.user.email}</p>
//               </div>
//             </div>

//             <button
//               onClick={onSignOut}
//               className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
//               title="Sign out"
//             >
//               <LogOut className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }