import { Shield, User } from "lucide-react";

export default function SignInPage({ onSignIn }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Shield className="w-12 h-12 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                GDG DevFest
              </h1>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Content Moderator
            </h2>
            <p className="text-gray-600">
              Sign in with Google to access the content moderation tool
            </p>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 text-sm">
                Please sign in to use the GDG DevFest content moderation tool. 
                We use Google authentication to keep track of your moderation requests.
              </p>
            </div>

            <button
              onClick={onSignIn}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-3"
            >
              
              Sign In
            </button>

            <p className="text-xs text-gray-500 mt-4">
              By signing in, you agree to use this tool responsibly for 
              GDG DevFest content moderation purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}