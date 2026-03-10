import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FaDownload, FaMoneyBillWave, FaCalendarAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { farmerAPI } from '../services/api';

const Earnings = () => {
  const [earningsData, setEarningsData] = useState({
    totalEarnings: 0,
    thisMonth: 0,
    pendingPayouts: 0,
    completedOrders: 0,
    summary: {
      totalEarnings: 0,
      thisMonth: 0,
      pendingPayouts: 0,
      completedOrders: 0
    },
    chartData: [],
    transactions: []
  });
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('6months');

  // Fetch earnings data
  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      const response = await farmerAPI.getEarnings();
      setEarningsData(response);
      setChartData(response.chartData || []);
      setTransactions(response.transactions || []);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  // Filter chart data based on time period
  const getFilteredChartData = () => {
    const now = new Date();
    let months = 6;

    switch (timeFilter) {
      case '1month':
        months = 1;
        break;
      case '3months':
        months = 3;
        break;
      case '6months':
        months = 6;
        break;
      case '1year':
        months = 12;
        break;
      default:
        months = 6;
    }

    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    return chartData.filter(item => new Date(item.month) >= cutoffDate);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Handle download report
  const handleDownloadReport = () => {
    // Create CSV content
    const csvContent = [
      ['Date', 'Order ID', 'Product', 'Amount', 'Status'],
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.orderId,
        t.product,
        formatCurrency(t.amount),
        t.status
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle request payout
  const handleRequestPayout = () => {
    alert('Payout request submitted successfully! You will receive payment within 3-5 business days.');
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  if (loading) {
    return (
      <div className="earnings-container">
        <h2>Earnings Overview</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading earnings data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="earnings-container">
        <h2>Earnings Overview</h2>
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="earnings-container">
      <div className="earnings-header">
        <h2>💰 Earnings Overview</h2>
        <div className="earnings-actions">
          <button className="download-btn" onClick={handleDownloadReport}>
            <FaDownload /> Download Report
          </button>
          <button className="payout-btn" onClick={handleRequestPayout}>
            <FaMoneyBillWave /> Request Payout
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="earnings-summary">
        <div className="summary-card total">
          <div className="card-icon">
            <FaMoneyBillWave />
          </div>
          <div className="card-content">
            <h3>Total Earnings</h3>
            <span className="amount">{formatCurrency(earningsData.summary?.totalEarnings || 0)}</span>
          </div>
        </div>

        <div className="summary-card month">
          <div className="card-icon">
            <FaCalendarAlt />
          </div>
          <div className="card-content">
            <h3>This Month</h3>
            <span className="amount">{formatCurrency(earningsData.summary?.thisMonth || 0)}</span>
          </div>
        </div>

        <div className="summary-card pending">
          <div className="card-icon">
            <FaClock />
          </div>
          <div className="card-content">
            <h3>Pending Payouts</h3>
            <span className="amount">{formatCurrency(earningsData.summary?.pendingPayouts || 0)}</span>
          </div>
        </div>

        <div className="summary-card orders">
          <div className="card-icon">
            <FaCheckCircle />
          </div>
          <div className="card-content">
            <h3>Completed Orders</h3>
            <span className="amount">{earningsData.summary?.completedOrders || 0}</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="earnings-chart">
        <div className="chart-header">
          <h3>Earnings Trend</h3>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="time-filter"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getFilteredChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="earnings"
                stroke="#4ade80"
                strokeWidth={3}
                dot={{ fill: '#4ade80', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction History */}
      <div className="transaction-history">
        <h3>Transaction History</h3>
        <div className="transaction-table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <tr key={transaction.id || index}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.orderId}</td>
                    <td>{transaction.product}</td>
                    <td className="amount-cell">{formatCurrency(transaction.amount)}</td>
                    <td>
                      <span className={`status ${transaction.status?.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280' }}>
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
