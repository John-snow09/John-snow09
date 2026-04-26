import React from 'react';
import { motion } from "framer-motion";
import { FaFileAlt } from "react-icons/fa";

const SrtAnalyzer = ({ setFiles, handleUpload, loading, data }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="border rounded-2xl p-8 bg-white dark:bg-gray-800 shadow-sm border-blue-100 dark:border-blue-900/30"
    >
      {/* HEADER SECTION */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
          <FaFileAlt size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">SRT Subtitle Analyzer</h2>
          <p className="text-xs text-gray-500">Upload multiple files to find the best quality</p>
        </div>
      </div>

      {/* UPLOAD AREA */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-10 hover:border-blue-400 transition-colors bg-gray-50/50 dark:bg-gray-900/30">
        <input
          type="file"
          multiple
          className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          onChange={(e) => setFiles(Array.from(e.target.files))}
        />
      </div>

      <button
        onClick={handleUpload}
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 mt-6 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>Run Analysis</>
        )}
      </button>

      {/* RESULTS SECTION */}
      {data?.results && (
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-500">Winner</p>
              <h3 className="font-bold text-blue-700 dark:text-blue-300">{data.best_file}</h3>
            </div>
          </div>

          <div className="grid gap-3">
            {data.results.map((r, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <span className="text-sm font-medium truncate max-w-[200px]">{r.filename}</span>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-24 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ width: `${Math.min(r.score, 100)}%` }}
                    />
                  </div>
                  <span className="font-black text-blue-600 dark:text-blue-400">{r.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SrtAnalyzer;