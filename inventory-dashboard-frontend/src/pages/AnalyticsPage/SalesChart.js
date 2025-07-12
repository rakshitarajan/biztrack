// src/pages/AnalyticsPage/SalesChart.js
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js'; // Import Chart and registerables
Chart.register(...registerables); // Register all controllers, elements, scales, plugins

// data prop expects an array like: [{ label: 'Month Year', sales: 1234.56 }, ...]
const SalesChart = ({ data, title = "Sales Trend" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null); // To keep track of the chart instance

  useEffect(() => {
    // Ensure chartRef.current is available and data is valid
    if (chartRef.current && Array.isArray(data) && data.length > 0) {
      const ctx = chartRef.current.getContext('2d');

      // Destroy previous chart instance if it exists to prevent memory leaks
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const labels = data.map(item => item.label);
      const salesValues = data.map(item => item.sales);

      chartInstance.current = new Chart(ctx, {
        type: 'line', // Line chart for trends
        data: {
          labels: labels,
          datasets: [{
            label: 'Total Sales (₹)', // Legend label for the dataset
            data: salesValues,
            fill: true, // Fill area under the line
            borderColor: 'rgb(75, 192, 192)', // Example: Teal color
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Lighter fill
            tension: 0.1, // Slight curve to the line
            pointBackgroundColor: 'rgb(75, 192, 192)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(75, 192, 192)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, // Allows chart to better fill container
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Sales Amount (₹)',
                font: { size: 14 }
              },
              ticks: {
                callback: function(value) { // Removed index, values as not used
                    return '₹' + Number(value).toLocaleString();
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time Period',
                font: { size: 14 }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { size: 12 }
              }
            },
            title: { // Chart title
              display: true,
              text: title,
              font: {
                size: 18, // Larger title
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 20
              }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += '₹' + Number(context.parsed.y).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        }
                        return label;
                    }
                }
            }
          }
        }
      });
    }

    // Cleanup function to destroy the chart when the component unmounts or data changes
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null; // Clear the instance ref
      }
    };
  }, [data, title]); // Re-render chart if data or title changes

  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No sales data available to display the chart.</p>;
  }

  return (
    // Set a height for the canvas container
    <div style={{ position: 'relative', height: '400px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default SalesChart;