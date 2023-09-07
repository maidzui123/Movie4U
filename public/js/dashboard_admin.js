// Dashboard Title
var time = new Date().getHours()
var dashboardTitle = document.getElementById('dashboard_title')
if (time < 12) {
  dashboardTitle.innerHTML = 'Good Morning, Admin'
}
else if (time < 17) {
  dashboardTitle.innerHTML = 'Good Afternoon, Admin'
}
else if (time < 21) {
  dashboardTitle.innerHTML = 'Good Evening, Admin'
}
else {
  dashboardTitle.innerHTML = 'Good Night, Admin'
}
// Chart Dashboard
const ctx = document.getElementById('dashboard-chart');
let currChart = [];
const chartToday = [20000, 40000, 55000, 35000, 10000, 14000, 14000, 24000, 34000, 26000, 13000, 44000];
const chartWeek = [10000, 55000, 40000, 25000, 35000, 36000, 33000, 24000, 26000, 18000, 28000, 30000];
const chartMonth = [57000, 24000, 12000, 45000, 10000, 34000, 28000, 35000, 43000, 13000, 30000, 29000];
const chartYear = [45000, 56000, 34000, 57000, 23000, 45000, 23000, 12000, 18000, 55000, 34000, 48000];
currChart = [...chartToday];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];
const chartDashboard = new Chart(ctx, {
  type: 'line',
  data: {
    labels: MONTHS,
    datasets: [{
      label: null,
      data: currChart,
      fill: true,
      borderWidth: 1,
      borderColor: "#9D8CEF",
      backgroundColor: "rgba(224, 153, 244, 0.5)"
    }]
  },
  options: {
    animations: {
      tension: {
        duration: 1000,
        esing: 'linear',
        from: 1,
        to: 0.5,
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#9D8CEF'
        }
      },
      y: {
        min: 0,
        max: 60000,
        ticks: {
          color: '#9D8CEF',
        }
      }
    },
    plugins: {
      legend: {
        display: false,
        labels: {
          font: {
            size: 18,
          }
        }
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.yLabel;
          }
        }
      }
    }
  }
});

// Time dashboard click 

function timeDashboardUnclick(x) {
  x.style.backgroundColor = '#7A75E8'
  x.style.color = '#FFFFFF'
}
function timeDashboardClick(x) {
  x.style.backgroundColor = '#485296'
  x.style.color = '#cccccc'
}

function todayClick() {
  currChart = [...chartToday]
  chartDashboard.data.datasets[0].data = [...currChart];
  chartDashboard.update();
  timeDashboardUnclick(document.getElementById("today"))
  timeDashboardClick(document.getElementById("week"))
  timeDashboardClick(document.getElementById("month"))
  timeDashboardClick(document.getElementById("year"))
};
function weekClick() {
  currChart = [...chartWeek]
  console.log(chartDashboard.data.datasets[0].data)
  chartDashboard.data.datasets[0].data = [...currChart];
  chartDashboard.update();
  timeDashboardUnclick(document.getElementById("week"))
  timeDashboardClick(document.getElementById("today"))
  timeDashboardClick(document.getElementById("month"))
  timeDashboardClick(document.getElementById("year"))
};
function monthClick() {
  currChart = [...chartMonth]
  chartDashboard.data.datasets[0].data = [...currChart];
  chartDashboard.update();
  timeDashboardUnclick(document.getElementById("month"))
  timeDashboardClick(document.getElementById("week"))
  timeDashboardClick(document.getElementById("today"))
  timeDashboardClick(document.getElementById("year"))
};
function yearClick() {
  currChart = [...chartYear]
  chartDashboard.data.datasets[0].data = [...currChart];
  chartDashboard.update();
  timeDashboardUnclick(document.getElementById("year"))
  timeDashboardClick(document.getElementById("week"))
  timeDashboardClick(document.getElementById("today"))
  timeDashboardClick(document.getElementById("month"))
};

// Render Dashboard
const viewsValue = document.getElementById('views-info_value')
const orderValue = document.getElementById('order-info_value')
const revenueValue = document.getElementById('revenue-info_value')

function getAllDashboard() {
  axios.get('/admin/getRevenue', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => {
      viewsValue.innerHTML = res.data.data.toltalView
      orderValue.innerHTML = res.data.data.totalTicket
      revenueValue.innerHTML = res.data.data.revenue +'$'
    })
    .catch(err => {
      console.error(err)
    })
}
getAllDashboard()