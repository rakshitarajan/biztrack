import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardPage.module.css';
import { useAuth } from '../../context/AuthContext';
import StatCard from './StatCard';
import InfoListCard from '../../components/InfoListCard/InfoListCard';
import { getDashboardSummary } from '../../services/analyticsService';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import { formatCurrency, formatDate } from '../../utils/helpers';
import SalesChart from '../AnalyticsPage/SalesChart'; // Assuming SalesChart is in AnalyticsPage folder

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDashboardSummary();
        // console.log("DashboardPage Data received:", data); // For debugging
        setDashboardData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className={styles.dashboardContainer}><div className={styles.messageContainer}><Spinner message="Loading dashboard..." /></div></div>;
  if (error) return <div className={styles.dashboardContainer}><div className={styles.messageContainer}><Alert type="error" message={error} /></div></div>;
  if (!dashboardData) return <div className={styles.dashboardContainer}><div className={styles.messageContainer}><p>No dashboard data available.</p></div></div>;

  const displayName = user?.name || user?.email || 'User';
  const {
    productCount, outOfStockCount, revenueToday, revenueThisMonth, totalRevenue,
    topSellingProducts = [], lowestSellingProducts = [], alerts = [], recentInvoices = [],
    last7DaysSales = []
  } = dashboardData;

  const formatProductListItemsForInfoCard = (products) => {
    return products.slice(0, 5).map(p => ({
      id: p._id,
      // **** UPDATED LINK PATH ****
      content: (<Link to={`/app/products/${p._id}`} className={styles.infoListLink}>{p.name}</Link>),
      details: `(${p.quantity || p.quantitySold || 0} units sold)`
    }));
  };
  const topSellingItems = formatProductListItemsForInfoCard(topSellingProducts);
  const lowestSellingItems = formatProductListItemsForInfoCard(lowestSellingProducts);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>Hello, {displayName}!</h1>
        <p className={styles.welcomeSubtitle}>Your stock summaries all in one place.</p>
      </div>

      {/* Section for Key Metrics (StatCards) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Key Metrics</h2>
        <div className={`${styles.gridContainer} ${styles.statsGrid}`}>
          <StatCard value={productCount ?? 'N/A'} label="Total Products" />
          <StatCard value={outOfStockCount ?? 'N/A'} label="Products Out of Stock" />
          <StatCard value={formatCurrency(revenueToday)} label="Revenue Today" />
          <StatCard value={formatCurrency(revenueThisMonth)} label="Revenue This Month" />
          <StatCard value={formatCurrency(totalRevenue)} label="Total Revenue (All Time)" />
          <StatCard value={alerts.filter(a => a.type === 'LowStock').length} label="Low Stock Items" />
        </div>
      </section>

      {/* Section for Mini Sales Trend Chart */}
      <section className={`${styles.section} ${styles.dashboardChartSection}`}>
        <h2 className={styles.sectionTitle}>Recent Sales Activity</h2>
        <SalesChart data={last7DaysSales} title="Sales - Last 7 Days" />
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          {/* **** UPDATED LINK PATH **** */}
          <Link to="/app/analytics" className={styles.infoListLink}>View Full Analytics Report</Link>
        </p>
      </section>

      {/* Section for Product Lists */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Product Performance</h2>
        <div className={`${styles.gridContainer} ${styles.listsGrid}`}>
          <InfoListCard title="Top 5 Highest Selling Products" items={topSellingItems} emptyMessage="No top selling products data yet." />
          <InfoListCard title="Top 5 Lowest Selling Products" items={lowestSellingItems} emptyMessage="No low selling products data yet." />
        </div>
      </section>

      {/* Section for Alerts */}
      {alerts.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alerts</h2>
          <div className={styles.alertsContainer}>
            {alerts.map((alert, index) => (
              <Alert key={alert.productId || index} type={alert.type === 'OutOfStock' ? 'error' : (alert.type === 'LowStock' ? 'warning' : 'info')} message={alert.message} />
            ))}
          </div>
        </section>
      )}

      {/* Section for Recent Invoices */}
      {recentInvoices.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Invoices</h2>
          <ul className={styles.recentInvoicesList}>
            {recentInvoices.map(inv => (
              <li key={inv._id || inv.invoiceNumber}>
                {/* **** UPDATED LINK PATH **** */}
                <Link to={`/app/invoices/${inv._id}`} className={styles.infoListLink}>{inv.invoiceNumber}</Link>
                <span> - {inv.customerName}</span>
                <span> - {formatDate(inv.createdAt)}</span>
                <span> - {formatCurrency(inv.grandTotal)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;