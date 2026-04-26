import React from 'react';
import { FaHistory } from "react-icons/fa";

const History = ({ 
  historyData, 
  selectedIds, 
  toggleSelect, 
  toggleSelectAll, 
  deleteSelected, 
  fetchHistory, 
  searchQuery, 
  setSearchQuery,
  filteredHistory 
}) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="bg-white dark:bg-gray-900 sticky top-0 z-10 pb-4 border-b dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-800/50">
              <FaHistory size={22} className="text-orange-600 dark:text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Past Analyses</h2>
              <p className="text-sm text-gray-500">{historyData.length} records</p>
            </div>
            {historyData.length > 0 && (
              <button 
                onClick={toggleSelectAll} 
                className="ml-4 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
              >
                {selectedIds.length === historyData.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="w-32 flex justify-end">
              {selectedIds.length > 0 && (
                <button 
                  onClick={deleteSelected} 
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete ({selectedIds.length})
                </button>
              )}
            </div>
            <button onClick={fetchHistory} className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full transition-colors text-orange-600 dark:text-orange-400">
              🔄
            </button>
          </div>
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-orange-500 rounded-xl outline-none transition-all text-sm"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 mt-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        {filteredHistory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.map((item) => (
              <div 
                key={item.id} 
                onClick={() => toggleSelect(item.id)}
                className={`relative p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                  selectedIds.includes(item.id) 
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md' 
                    : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:border-orange-200 dark:hover:border-orange-900/30'
                }`}
              >
                <div className="absolute top-3 right-3">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)}
                    readOnly
                    className="w-5 h-5 rounded-full border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                </div>
                <div className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">
                     {item.timestamp?.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="font-bold text-orange-600 dark:text-orange-400 truncate pr-6">🏆 {item.best_file}</div>
                </div>
                <div className="text-xs text-gray-500 line-clamp-2">
                  <span className="font-semibold text-gray-400">Analyzed:</span> {item.results.map(r => r.filename).join(", ")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <span className="text-4xl mb-4">{searchQuery ? "🕵️‍♂️" : "📂"}</span>
            <p className="italic">{searchQuery ? `No results found for "${searchQuery}"` : "No history found yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;