import { useState } from "react";

export default function ModerationForm({ onSubmit, isLoading }) {
  const [input, setInput] = useState("");
  const wordLimit = 500;

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Word count
  const wordCount = input.trim()
    ? input.trim().split(/\s+/).length
    : 0;

  // Handle input with word limit
  const handleChange = (e) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      setInput(value);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Enter your content for moderation
      </label>
      
      <div>
        <textarea
          className="w-full border-2 border-gray-200 rounded-lg p-4 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 resize-none"
          rows={3}
          value={input}
          onChange={handleChange}   // ✅ custom handler
          onKeyDown={handleKeyDown}
          placeholder="Type your message, email content, social media post, or any text you want to check..."
          disabled={isLoading}
        />
        
        <div className="flex justify-between items-center mt-4">
          <span className={`text-sm ${wordCount >= wordLimit ? "text-red-500" : "text-gray-500"}`}>
            {wordCount}/{wordLimit} words • Press Ctrl+Enter to submit
          </span>
          
          <button
            onClick={handleSubmit}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isLoading || !input.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"
            }`}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </div>
            ) : (
              "Check Content"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
