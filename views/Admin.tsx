
import React, { useState } from 'react';
import { Lock, BarChart3 } from 'lucide-react';
import { CURRENT_USER } from '../constants';

const Insights: React.FC = () => {
    // Real app would fetch this data
    const [data] = useState([]); 

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen pb-24 animate-fade-in">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div>
                    <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 mb-1">
                        <Lock className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Private Dashboard</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                        Insights & Activity
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Analytics will appear here once you have activity.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border border-gray-100 dark:border-white/5">
                <BarChart3 className="w-16 h-16 text-gray-300 dark:text-neutral-700 mb-4" />
                <h3 className="font-bold text-gray-900 dark:text-white">No Data Available</h3>
                <p className="text-sm text-gray-500 mt-2">Start posting and interacting to see insights.</p>
            </div>

        </div>
    );
};

export default Insights;
