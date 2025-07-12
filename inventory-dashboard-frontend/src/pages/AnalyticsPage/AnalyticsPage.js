import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom'; // Keep Link for internal navigation
import SalesChart from './SalesChart';
import styles from './AnalyticsPage.module.css';
import { getAnalyticsDetails } from '../../services/analyticsService';
import LoadingSpinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import Button from '../../components/Button/Button';
import { formatDate, formatCurrency } from '../../utils/helpers';

import { Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const TopProductsPieChart = ({ data, title = "Top Selling Products (Units)" }) => {
  if (!data || data.length === 0) {
    return <p className={styles.placeholderText}>No top products data available.</p>;
  }
  const chartData = {
    labels: data.map(p => p.name),
    datasets: [{
      label: 'Units Sold',
      data: data.map(p => p.quantitySold),
      backgroundColor: ['rgba(20, 184, 166, 0.7)', 'rgba(59, 130, 246, 0.7)', 'rgba(234, 179, 8, 0.7)', 'rgba(249, 115, 22, 0.7)', 'rgba(139, 92, 246, 0.7)', 'rgba(236, 72, 153, 0.7)'],
      borderColor: ['rgba(20, 184, 166, 1)', 'rgba(59, 130, 246, 1)', 'rgba(234, 179, 8, 1)', 'rgba(249, 115, 22, 1)', 'rgba(139, 92, 246, 1)', 'rgba(236, 72, 153, 1)'],
      borderWidth: 1,
    }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 12 }, boxWidth: 20, padding: 15 } },
      title: { display: true, text: title, font: { size: 16, weight: '500' }, padding: { top: 10, bottom: 15 } },
      tooltip: { callbacks: { label: function (context) { return `${context.label || ''}: ${context.parsed || 0} units`; } } }
    },
  };
  return <div className={styles.pieChartContainer}><Pie data={chartData} options={options} /></div>;
};

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRangeKey, setSelectedRangeKey] = useState('1Y');

  const TIME_RANGE_OPTIONS = useMemo(() => ({
    '7D': 'Last 7 Days', '1M': 'Last Month', '6M': 'Last 6 Months',
    '1Y': 'Last Year', 'ALL': 'All Time',
  }), []);

  const calculateDateRange = useCallback((rangeKey) => {
    const today = new Date(); let startDate = null; const endDate = today.toISOString().split('T')[0]; const now = new Date();
    switch (rangeKey) {
      case '7D': startDate = new Date(now.setDate(now.getDate() - 6)); break;
      case '1M': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
      case '6M': startDate = new Date(now.setMonth(now.getMonth() - 6)); break;
      case '1Y': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
      case 'ALL': default: startDate = null; break;
    }
    const formattedStartDate = startDate ? startDate.toISOString().split('T')[0] : null;
    return rangeKey === 'ALL' ? { startDate: null, endDate: null } : { startDate: formattedStartDate, endDate: endDate };
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { startDate, endDate } = calculateDateRange(selectedRangeKey);
      const detailsData = await getAnalyticsDetails(startDate, endDate);
      setAnalyticsData(detailsData);
    } catch (err) {
      setError('Failed to load analytics data.'); console.error('Error fetching analytics data:', err); setAnalyticsData(null);
    } finally { setLoading(false); }
  }, [selectedRangeKey, calculateDateRange]);

  useEffect(() => { fetchAnalyticsData(); }, [fetchAnalyticsData]);

  const handleRangeChange = (rangeKey) => { setSelectedRangeKey(rangeKey); };

  if (loading && !analyticsData) return <div className={styles.analyticsPage}><h2>Analytics</h2><LoadingSpinner message="Loading analytics data..." /></div>;
  if (error && !analyticsData) return <div className={styles.analyticsPage}><h2>Analytics</h2><Alert type="error" message={error} /></div>;
  if (!analyticsData && !loading) return <div className={styles.analyticsPage}><h2>Analytics</h2><p>No analytics data available.</p></div>;

  const { salesTrend = [], topProductsChart = [], revenueSummary, recentInvoices = [] } = analyticsData || {};

  return (
    <div className={styles.analyticsPage}>
      <h2 className={styles.pageTitle}>Business Analytics</h2>
      {error && loading && <Alert type="warning" message={`Failed to refresh data: ${error}`} />}

      {revenueSummary && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Revenue Snapshot</h3>
          <div className={styles.revenueGrid}>
            <div className={styles.summaryCard}>Today: <span className={styles.revenueValue}>{formatCurrency(revenueSummary.today)}</span></div>
            <div className={styles.summaryCard}>This Month: <span className={styles.revenueValue}>{formatCurrency(revenueSummary.thisMonth)}</span></div>
            <div className={styles.summaryCard}>All Time: <span className={styles.revenueValue}>{formatCurrency(revenueSummary.allTime)}</span></div>
          </div>
        </section>
      )}

      <section className={`${styles.section} ${styles.chartContainer}`}>
        <div className={styles.chartHeader}>
          <h3 className={styles.sectionTitle}>Sales Revenue Over Time</h3>
          <div className={styles.timeRangeButtons}>
            {Object.entries(TIME_RANGE_OPTIONS).map(([key, label]) => (
              <Button
                key={key}
                onClick={() => handleRangeChange(key)}
                variant={selectedRangeKey === key ? 'primary' : 'outline'}
                size="small"
                disabled={loading}
              >
                {label}
              </Button>
            ))}
          </div>
          {loading && <LoadingSpinner size="small" inline={true} />}
        </div>
        <SalesChart data={salesTrend} title={`Sales Revenue (${TIME_RANGE_OPTIONS[selectedRangeKey]})`} />
      </section>

      <section className={`${styles.section} ${styles.chartContainer}`}>
        <TopProductsPieChart data={topProductsChart} title="Top 5 Selling Products (Units - Last 90 Days)" />
      </section>

      {recentInvoices && recentInvoices.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Recent Invoices</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Cashier</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(inv => (
                  <tr key={inv._id}>
                    {/* **** UPDATED LINK PATH **** */}
                    <td><Link to={`/app/invoices/${inv._id}`}>{inv.invoiceNumber}</Link></td>
                    <td>{inv.customerName}</td>
                    <td>{formatDate(inv.createdAt)}</td>
                    <td className={styles.amountCell}>{formatCurrency(inv.grandTotal)}</td>
                    <td>{inv.createdBy?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {recentInvoices.length === 0 && !loading && (
        <section className={styles.section}><p>No recent invoices to display.</p></section>
      )}
    </div>
  );
};

export default AnalyticsPage;