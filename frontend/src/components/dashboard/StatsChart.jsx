import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function StatsChart({ data, title = "Statistics" }) {
  return (
    <div className="dash-card">
      <h3 className="dash-card-title">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e4e4e7",
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="jobs" name="Jobs Posted" fill="#18181b" radius={[4, 4, 0, 0]} />
          <Bar
            dataKey="applications"
            name="Applications"
            fill="#d4d4d8"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function buildMonthlyData(jobs, applications) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const counts = months.map((month, i) => ({
    month,
    jobs: 0,
    applications: 0,
  }));

  (jobs || []).forEach((job) => {
    const d = new Date(job.createdAt);
    counts[d.getMonth()].jobs += 1;
  });

  (applications || []).forEach((app) => {
    const d = new Date(app.createdAt);
    counts[d.getMonth()].applications += 1;
  });

  return counts;
}

export { buildMonthlyData };
