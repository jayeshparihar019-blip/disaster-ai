import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const RiskTrendGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400">Loading risk trend data...</p>
      </div>
    );
  }

  // Format data for percentages
  const formattedData = data.map(item => ({
    ...item,
    flood: Math.round(item.flood * 100),
    cyclone: Math.round(item.cyclone * 100),
    heatwave: Math.round(item.heatwave * 100),
  }));

  const customTooltipStyle = {
    backgroundColor: '#1e293b', // slate-800
    border: '1px solid #334155', // slate-700
    borderRadius: '0.5rem',
    color: '#f8fafc', // slate-50
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
      <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
        AI Risk Trend Analysis (Past & Next 24h)
      </h3>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              tickMargin={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip contentStyle={customTooltipStyle} itemStyle={{ fontWeight: 500 }} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            
            <Line 
              type="monotone" 
              name="Flood Risk" 
              dataKey="flood" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: '#60a5fa', strokeWidth: 2 }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              name="Cyclone Risk" 
              dataKey="cyclone" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: '#34d399', strokeWidth: 2 }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              name="Heatwave Risk" 
              dataKey="heatwave" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
              activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RiskTrendGraph;
