/* ============================================
   Lush View Bar — Dashboard JavaScript
   Charts and Dashboard Interactions
   ============================================ */

'use strict';

/* ============================================
   Dark Mode Chart Helpers
   ============================================ */
function isDark() {
  return document.documentElement.classList.contains('dark');
}

function chartColors() {
  const dark = isDark();
  return {
    grid:    dark ? 'rgba(51,65,85,0.8)'   : 'rgba(232,237,241,0.8)',
    tick:    dark ? '#94A3B8'               : '#6B7280',
    tooltip: dark ? 'rgba(30,41,59,0.97)'  : 'rgba(23,33,43,0.95)',
  };
}

/* ============================================
   Demo Data
   ============================================ */
const salesData = {
  monthly: [42500, 38900, 51200, 47300, 56800, 62100, 67347, 58400, 53200, 61800, 72000, 68500],
  weekly:  [12400, 15200, 11800, 14600, 13900, 16200, 18400, 14100],
  daily:   [2100, 1850, 2400, 2200, 2800, 3100, 2650],
  labels: {
    monthly: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    weekly:  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon'],
    daily:   ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  }
};

const customerData = {
  monthly: [120, 98, 145, 132, 178, 165, 203, 189, 142, 198, 221, 187],
  weekly:  [28, 35, 22, 41, 38, 52, 45],
  labels: {
    monthly: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    weekly:  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  }
};

/* ============================================
   Sales Statistics Chart
   ============================================ */
let salesChart = null;

function initSalesChart(period = 'monthly') {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;

  const labels = salesData.labels[period];
  const data   = salesData[period];
  const peakIdx = data.indexOf(Math.max(...data));

  if (salesChart) salesChart.destroy();

  salesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Sales',
        data,
        borderColor: '#E11D48',
        borderWidth: 2.5,
        tension: 0.4,
        fill: true,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return 'transparent';
          const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          grad.addColorStop(0, 'rgba(225,29,72,0.18)');
          grad.addColorStop(1, 'rgba(225,29,72,0.01)');
          return grad;
        },
        pointBackgroundColor: data.map((_, i) => i === peakIdx ? '#E11D48' : 'transparent'),
        pointBorderColor: data.map((_, i) => i === peakIdx ? '#fff' : 'transparent'),
        pointBorderWidth: data.map((_, i) => i === peakIdx ? 3 : 0),
        pointRadius: data.map((_, i) => i === peakIdx ? 8 : 3),
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#E11D48',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: chartColors().tooltip,
          padding: 12,
          cornerRadius: 10,
          titleFont: { size: 12, weight: '600' },
          bodyFont: { size: 13 },
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.y.toLocaleString()}`,
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: chartColors().tick,
            font: { size: 11, weight: '500' },
          }
        },
        y: {
          grid: {
            color: chartColors().grid,
            drawBorder: false,
          },
          border: { display: false, dash: [4, 4] },
          ticks: {
            color: chartColors().tick,
            font: { size: 11 },
            callback: (v) => '$' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v),
          }
        }
      }
    }
  });
}

/* ============================================
   Customer Statistics Chart
   ============================================ */
let customerChart = null;

function initCustomerChart(period = 'monthly') {
  const ctx = document.getElementById('customerChart');
  if (!ctx) return;

  const labels = customerData.labels[period];
  const data   = customerData[period];
  const peakIdx = data.indexOf(Math.max(...data));

  if (customerChart) customerChart.destroy();

  customerChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Customers',
        data,
        backgroundColor: data.map((_, i) => i === peakIdx ? '#E11D48' : 'rgba(225,29,72,0.18)'),
        borderColor: data.map((_, i) => i === peakIdx ? '#E11D48' : 'transparent'),
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: chartColors().tooltip,
          padding: 12,
          cornerRadius: 10,
          callbacks: {
            label: (ctx) => ` ${ctx.parsed.y} customers`,
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: chartColors().tick, font: { size: 11, weight: '500' } }
        },
        y: {
          grid: { color: chartColors().grid },
          border: { display: false },
          ticks: {
            color: chartColors().tick,
            font: { size: 11 },
            callback: (v) => v >= 1000 ? (v/1000).toFixed(1) + 'k' : v,
          }
        }
      }
    }
  });
}

/* ============================================
   Chart Period Switcher
   ============================================ */
function initChartFilters() {
  // Sales chart filter
  document.querySelectorAll('[data-sales-period]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-sales-period]').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      this.classList.remove('btn-secondary');
      this.classList.add('btn-primary');
      _currentSalesPeriod = this.dataset.salesPeriod;
      initSalesChart(_currentSalesPeriod);
    });
  });

  // Customer chart filter
  document.querySelectorAll('[data-customer-period]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-customer-period]').forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-secondary');
      });
      this.classList.remove('btn-secondary');
      this.classList.add('btn-primary');
      _currentCustomerPeriod = this.dataset.customerPeriod;
      initCustomerChart(_currentCustomerPeriod);
    });
  });
}

/* ============================================
   Date Filter
   ============================================ */
function initDateFilter() {
  document.querySelectorAll('[data-date-filter]').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('[data-date-filter]').forEach(b => {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '';
        b.style.borderColor = '';
      });
      this.classList.add('active');
      this.style.background = 'rgba(255,255,255,0.95)';
      this.style.color = 'var(--primary)';
      this.style.borderColor = 'rgba(255,255,255,0.95)';
      Toast.info(`Filtered: ${this.textContent.trim()}`, 'Date Filter');
    });
  });
}

/* ============================================
   Dashboard Init
   ============================================ */
let _currentSalesPeriod   = 'monthly';
let _currentCustomerPeriod = 'monthly';

document.addEventListener('DOMContentLoaded', () => {
  // Slight delay to allow layout injection
  setTimeout(() => {
    initSalesChart(_currentSalesPeriod);
    initCustomerChart(_currentCustomerPeriod);
    initChartFilters();
    initDateFilter();
    animateCounters();
  }, 300);
});

// Re-draw charts when dark mode is toggled so grid/tick colors update
document.addEventListener('themechange', () => {
  if (document.getElementById('salesChart'))   initSalesChart(_currentSalesPeriod);
  if (document.getElementById('customerChart')) initCustomerChart(_currentCustomerPeriod);
});

/* ============================================
   Counter Animation
   ============================================ */
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const isDecimal = String(target).includes('.');
    const duration = 1200;
    const start = performance.now();

    function update(ts) {
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const value = target * ease;
      el.textContent = prefix + (isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString()) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}
