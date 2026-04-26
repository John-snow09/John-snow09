import React from 'react';
import { motion } from "framer-motion";
import { FaChartBar } from "react-icons/fa";

const Analytics = ({ historyData }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER SECTION */}
      <div className="border rounded-2xl p-8 bg-white dark:bg-gray-800 shadow-sm border-green-100 dark:border-green-900/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
            <FaChartBar size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Usage Analytics</h2>
            <p className="text-xs text-gray-500">Insights into your subtitle and STE processing</p>
          </div>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm border-gray-100 dark:border-gray-700 hover:border-green-500 transition-colors">
          <p className="text-sm text-gray-500 font-medium">Total Files Analyzed</p>
          <h3 className="text-3xl font-black mt-2 text-green-600">{historyData?.length || 0}</h3>
          <p className="text-[10px] text-gray-400 mt-1">Across all modes</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm border-gray-100 dark:border-gray-700 hover:border-green-500 transition-colors">
          <p className="text-sm text-gray-500 font-medium">Avg. STE Score</p>
          <h3 className="text-3xl font-black mt-2 text-purple-600">84%</h3>
          <p className="text-[10px] text-gray-400 mt-1">Based on recent runs</p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm border-gray-100 dark:border-gray-700 hover:border-green-500 transition-colors">
          <p className="text-sm text-gray-500 font-medium">Time Saved</p>
          <h3 className="text-3xl font-black mt-2 text-blue-600">12.4h</h3>
          <p className="text-[10px] text-gray-400 mt-1">Estimated manual checking</p>
        </div>
      </div>

      {/* PLACEHOLDER FOR CHART */}
      <div className="border rounded-2xl p-12 bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mb-4">
          <FaChartBar size={32} />
        </div>
        <h3 className="font-bold text-gray-800 dark:text-gray-200">Activity Chart</h3>
        <p className="text-sm text-gray-500 max-w-xs">Detailed visual trends will appear here as you continue to use Snowlabs.</p>
      </div>
    </motion.div>
  );
};

export default Analytics;