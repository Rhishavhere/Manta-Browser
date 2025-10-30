import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCurrentWindow } from "@tauri-apps/api/window";

function App() {
  const [url, setUrl] = useState("https://www.rhishav.com");
  const [currentUrl, setCurrentUrl] = useState("https://www.rhishav.com");
  const [pageTitle, setPageTitle] = useState("Google");
  const [showOverlay, setShowOverlay] = useState(false);
  const [history, setHistory] = useState<string[]>([""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        setShowOverlay((prev) => !prev);
        if (!showOverlay) {
          setTimeout(() => inputRef.current?.select(), 100);
        }
      }
      if (e.key === "Escape") {
        setShowOverlay(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOverlay]);

  // Update page title when iframe loads
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const updateTitle = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const title = iframeDoc.title || new URL(currentUrl).hostname;
          setPageTitle(title);
        }
      } catch (error) {
        // Cross-origin restrictions
        const hostname = new URL(currentUrl).hostname;
        setPageTitle(hostname);
      }
    };

    iframe.addEventListener("load", updateTitle);
    return () => iframe.removeEventListener("load", updateTitle);
  }, [currentUrl]);

  const navigateTo = (newUrl: string) => {
    let fullUrl = newUrl;

    // Add https:// if no protocol specified
    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
      fullUrl = "https://" + newUrl;
    }

    setCurrentUrl(fullUrl);
    setUrl(fullUrl);

    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(fullUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(url);
    setShowOverlay(false);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevUrl = history[newIndex];
      setCurrentUrl(prevUrl);
      setUrl(prevUrl);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextUrl = history[newIndex];
      setCurrentUrl(nextUrl);
      setUrl(nextUrl);
    }
  };

  const reload = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
      {/* Window Controls Bar */}
      <div
        data-tauri-drag-region
        className="h-8 bg-white border-b border-gray-200/50 flex items-center justify-between px-4 select-none"
      >
        <div className="text-xs text-gray-500 font-medium">Manta Browser</div>
        <div className="flex gap-2">
          <button
            onClick={() => getCurrentWindow().minimize()}
            className="w-8 h-6 hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 12 12">
              <rect x="2" y="5" width="8" height="1.5" />
            </svg>
          </button>
          <button
            onClick={() => getCurrentWindow().toggleMaximize()}
            className="w-8 h-6 hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 12 12">
              <rect x="2" y="2" width="8" height="8" strokeWidth="1.5" />
            </svg>
          </button>
          <button
            onClick={() => getCurrentWindow().close()}
            className="w-8 h-6 hover:bg-red-500 hover:text-white rounded flex items-center justify-center transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 12 12">
              <path strokeWidth="1.5" d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hidden Control Overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-3xl"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-6">
              {/* Page Title */}
              <div className="mb-4 text-sm text-gray-500 font-medium truncate">
                {pageTitle}
              </div>

              {/* URL Bar */}
              <form onSubmit={handleSubmit} className="mb-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="Enter URL or search..."
                  autoFocus
                />
              </form>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={goBack}
                  disabled={historyIndex === 0}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
                >
                  � Back
                </button>
                <button
                  onClick={goForward}
                  disabled={historyIndex === history.length - 1}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 disabled:cursor-not-allowed rounded-xl font-medium transition-all"
                >
                  Forward �
                </button>
                <button
                  onClick={reload}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all"
                >
                  � Reload
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WebView Area */}
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-0"
          title="Browser WebView"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-popups-to-escape-sandbox allow-top-navigation"
        />
      </div>

      {/* Persistent Bottom Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 px-6 py-4 flex items-center gap-6"
      >
        {/* Navigation Icons */}
        <div className="flex gap-2">
          <button
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-2 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg transition-all"
            title="Back"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="p-2 hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed rounded-lg transition-all"
            title="Forward"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Page Name */}
        <div className="flex-1 text-sm text-gray-600 font-medium truncate">
          {pageTitle}
        </div>

        {/* URL Bar Trigger */}
        <button
          onClick={() => setShowOverlay(true)}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
        >
          Ctrl+L
        </button>
      </motion.div>
    </div>
  );
}

export default App;
