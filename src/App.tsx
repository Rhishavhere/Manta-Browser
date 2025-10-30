import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [url, setUrl] = useState("https://www.google.com");
  const [showOverlay, setShowOverlay] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let fullUrl = url.trim();

    if (!fullUrl) return;

    // Check if it's a URL or a search query
    const isUrl = fullUrl.includes('.') && !fullUrl.includes(' ') ||
                   fullUrl.startsWith("http://") ||
                   fullUrl.startsWith("https://");

    if (isUrl) {
      // Add https:// if no protocol specified
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = "https://" + fullUrl;
      }
    } else {
      // Treat as search query
      fullUrl = `https://www.google.com/search?q=${encodeURIComponent(fullUrl)}`;
    }

    // Open new webview window
    invoke("create_webview", { url: fullUrl }).catch(console.error);
    setShowOverlay(false);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      {/* Window Controls Bar */}
      <div
        data-tauri-drag-region
        className="h-8 bg-gray-900 flex items-center justify-between px-4 select-none"
      >
        <div className="text-xs text-gray-300 font-medium">Manta Browser</div>
        <div className="flex gap-2">
          <button
            onClick={() => getCurrentWindow().minimize()}
            className="w-8 h-6 hover:bg-gray-700 rounded flex items-center justify-center transition-colors text-gray-300"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
              <rect x="2" y="5" width="8" height="1.5" />
            </svg>
          </button>
          <button
            onClick={() => getCurrentWindow().toggleMaximize()}
            className="w-8 h-6 hover:bg-gray-700 rounded flex items-center justify-center transition-colors text-gray-300"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 12 12">
              <rect x="2" y="2" width="8" height="8" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            onClick={() => getCurrentWindow().close()}
            className="w-8 h-6 hover:bg-red-500 hover:text-white rounded flex items-center justify-center transition-colors text-gray-300"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 12 12">
              <path strokeWidth="1.5" d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Manta Browser
            </h1>
            <p className="text-gray-500 text-lg">
              Using native WebView2 - Each site opens in a new window
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="mb-8"
          >
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full px-6 py-4 bg-white rounded-xl text-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-all shadow-lg"
                placeholder="Search or enter URL"
                autoFocus
              />
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-4 gap-4"
          >
            {[
              { name: "Google", url: "https://google.com" },
              { name: "YouTube", url: "https://youtube.com" },
              { name: "GitHub", url: "https://github.com" },
              { name: "Twitter", url: "https://twitter.com" },
            ].map((site) => (
              <button
                key={site.name}
                onClick={() => {
                  invoke("create_webview", { url: site.url }).catch(console.error);
                }}
                className="p-6 bg-white rounded-xl hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200"
              >
                <div className="text-base font-medium text-gray-800">{site.name}</div>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Overlay URL Bar */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={() => setShowOverlay(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl px-4"
            >
              <form onSubmit={handleSubmit} className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-6 py-4 bg-white rounded-xl text-lg focus:outline-none shadow-2xl"
                  placeholder="Search or enter URL"
                  autoFocus
                />
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
