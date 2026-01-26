function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <div className="amount">{value}</div>
    </div>
  );
}

export default StatCard;
