"use client";

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

export default function SalaryChart({ applications = [] }) {
  
  // 1. Calculate Status Distribution (Pie Chart)
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));

  const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b']; // Blue, Green, Red, Amber

  // 2. Calculate Applications per Job (Bar Chart)
  const jobCounts = applications.reduce((acc, app) => {
    const title = app.jobId?.title || "Unknown";
    acc[title] = (acc[title] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(jobCounts).map(title => ({
    name: title.length > 15 ? title.substring(0, 15) + "..." : title, // Truncate long names
    Applicants: jobCounts[title]
  }));

  if (applications.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      
      {/* --- PIE CHART: STATUS --- */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Application Status</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-2">
            {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name} ({entry.value})
                </div>
            ))}
        </div>
      </div>

      {/* --- BAR CHART: TOP JOBS --- */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-slate-700 dark:text-slate-300">Top Performing Jobs</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="Applicants" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}