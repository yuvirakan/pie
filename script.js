// Data dari Excel yang sudah dikonversi ke JSON
let hospitalData = [];
let filteredData = [];

// Chart instances
let mainPieChart;
let trendChart;
let comparisonChart;
let miniCharts = {};

// Warna untuk setiap kota
const cityColors = {
    'Bandung': '#36A2EB',
    'Padang': '#FF6384',
    'Surabaya': '#FFCE56',
    'Makassar': '#4BC0C0',
    'Yogyakarta': '#9966FF'
};

// DOM Elements
const bedCapacityEl = document.getElementById('bed-capacity');
const bedFilledEl = document.getElementById('bed-filled');
const bedAvailableEl = document.getElementById('bed-available');
const bedPercentageEl = document.getElementById('bed-percentage');
const monthFilterEl = document.getElementById('month-filter');
const cityFilterEl = document.getElementById('city-filter');
const resetFiltersBtn = document.getElementById('reset-filters');
const tableBodyEl = document.getElementById('table-body');
const dataCountEl = document.getElementById('data-count');
const lastUpdatedEl = document.getElementById('last-updated-text');
const updateDateEl = document.getElementById('update-date');
const cityListEl = document.getElementById('cityList');
const chartTitleEl = document.getElementById('chartTitle');
const chartLegendEl = document.getElementById('chartLegend');
const trendSummaryEl = document.getElementById('trend-summary');
const miniChartsGridEl = document.getElementById('miniChartsGrid');

// Urutan bulan yang benar
const monthOrder = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Load data dari file JSON
async function loadData() {
    try {
        console.log('Memulai load data...');
        
        // Path ke file JSON
        const jsonPath = 'data.json';
        
        // Load data JSON
        const response = await fetch(jsonPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data berhasil di-load:', data.length, 'baris');
        
        // Proses data
        hospitalData = data.map((item, index) => {
            // Hitung persentase kepadatan (Bed Terisi / Kapasitas Bed * 100)
            const persentase = item.Kapasitas_Bed > 0 ? 
                (item.Jumlah_Bed_Terisi / item.Kapasitas_Bed * 100) : 0;
            
            return {
                id: index + 1,
                Kota: item.Kota,
                Bulan: item.Bulan,
                Jumlah_Bed_Terisi: Math.round(item.Jumlah_Bed_Terisi * 100) / 100,
                Sisa_Bed_Tersedia: Math.round(item.Sisa_Bed_Tersedia * 100) / 100,
                Kapasitas_Bed: Math.round(item.Kapasitas_Bed),
                Persentase: Math.round(persentase * 100) / 100
            };
        });
        
        filteredData = [...hospitalData];
        
        // Update informasi tanggal
        const now = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('id-ID', options);
        lastUpdatedEl.textContent = `Terakhir diperbarui: ${formattedDate}`;
        updateDateEl.textContent = formattedDate;
        
        // Render dashboard
        updateDashboard();
        renderTable();
        updateCityList();
        updateTrendSummary();
        updateMainPieChart();
        updateMiniPieCharts();
        updateTrendChart();
        updateComparisonChart();
        
        console.log('Dashboard berhasil di-load');
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Gunakan data fallback dari variabel langsung
        hospitalData = getFallbackData();
        filteredData = [...hospitalData];
        
        // Update informasi tanggal
        const now = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('id-ID', options);
        lastUpdatedEl.textContent = `Terakhir diperbarui: ${formattedDate}`;
        updateDateEl.textContent = formattedDate;
        
        // Render dashboard dengan data fallback
        updateDashboard();
        renderTable();
        updateCityList();
        updateTrendSummary();
        updateMainPieChart();
        updateMiniPieCharts();
        updateTrendChart();
        updateComparisonChart();
        
        console.log('Menggunakan data fallback');
    }
}

// Data fallback jika file JSON tidak ditemukan
function getFallbackData() {
    // Data dari Excel Anda dalam format JavaScript
    return [
        {"Kota":"Bandung","Bulan":"Januari","Jumlah_Bed_Terisi":59.67,"Sisa_Bed_Tersedia":140.33,"Kapasitas_Bed":200,"Persentase":29.8},
        {"Kota":"Bandung","Bulan":"Februari","Jumlah_Bed_Terisi":141.5,"Sisa_Bed_Tersedia":58.5,"Kapasitas_Bed":200,"Persentase":70.8},
        {"Kota":"Bandung","Bulan":"Maret","Jumlah_Bed_Terisi":58.3,"Sisa_Bed_Tersedia":141.7,"Kapasitas_Bed":200,"Persentase":29.2},
        {"Kota":"Bandung","Bulan":"April","Jumlah_Bed_Terisi":36.6,"Sisa_Bed_Tersedia":163.4,"Kapasitas_Bed":200,"Persentase":18.3},
        {"Kota":"Bandung","Bulan":"Mei","Jumlah_Bed_Terisi":113.7,"Sisa_Bed_Tersedia":86.3,"Kapasitas_Bed":200,"Persentase":56.9},
        {"Kota":"Bandung","Bulan":"Juni","Jumlah_Bed_Terisi":113.77,"Sisa_Bed_Tersedia":86.23,"Kapasitas_Bed":200,"Persentase":56.9},
        {"Kota":"Bandung","Bulan":"Juli","Jumlah_Bed_Terisi":112.1,"Sisa_Bed_Tersedia":87.9,"Kapasitas_Bed":200,"Persentase":56.1},
        {"Kota":"Bandung","Bulan":"Agustus","Jumlah_Bed_Terisi":122.83,"Sisa_Bed_Tersedia":77.17,"Kapasitas_Bed":200,"Persentase":61.4},
        {"Kota":"Bandung","Bulan":"September","Jumlah_Bed_Terisi":125.33,"Sisa_Bed_Tersedia":74.67,"Kapasitas_Bed":200,"Persentase":62.7},
        {"Kota":"Padang","Bulan":"Januari","Jumlah_Bed_Terisi":37.35,"Sisa_Bed_Tersedia":162.65,"Kapasitas_Bed":200,"Persentase":18.7},
        {"Kota":"Padang","Bulan":"Februari","Jumlah_Bed_Terisi":49.36,"Sisa_Bed_Tersedia":150.64,"Kapasitas_Bed":200,"Persentase":24.7},
        {"Kota":"Padang","Bulan":"Maret","Jumlah_Bed_Terisi":33.35,"Sisa_Bed_Tersedia":166.65,"Kapasitas_Bed":200,"Persentase":16.7},
        {"Kota":"Padang","Bulan":"April","Jumlah_Bed_Terisi":42.84,"Sisa_Bed_Tersedia":157.16,"Kapasitas_Bed":200,"Persentase":21.4},
        {"Kota":"Padang","Bulan":"Mei","Jumlah_Bed_Terisi":4.94,"Sisa_Bed_Tersedia":195.06,"Kapasitas_Bed":200,"Persentase":2.5},
        {"Kota":"Padang","Bulan":"Juni","Jumlah_Bed_Terisi":42.45,"Sisa_Bed_Tersedia":157.55,"Kapasitas_Bed":200,"Persentase":21.2},
        {"Kota":"Padang","Bulan":"Juli","Jumlah_Bed_Terisi":42.65,"Sisa_Bed_Tersedia":157.35,"Kapasitas_Bed":200,"Persentase":21.3},
        {"Kota":"Padang","Bulan":"Agustus","Jumlah_Bed_Terisi":77,"Sisa_Bed_Tersedia":123,"Kapasitas_Bed":200,"Persentase":38.5},
        {"Kota":"Padang","Bulan":"September","Jumlah_Bed_Terisi":56.9,"Sisa_Bed_Tersedia":143.1,"Kapasitas_Bed":200,"Persentase":28.5},
        {"Kota":"Padang","Bulan":"Oktober","Jumlah_Bed_Terisi":67.06,"Sisa_Bed_Tersedia":132.94,"Kapasitas_Bed":200,"Persentase":33.5},
        {"Kota":"Padang","Bulan":"November","Jumlah_Bed_Terisi":11.68,"Sisa_Bed_Tersedia":188.32,"Kapasitas_Bed":200,"Persentase":5.8},
        {"Kota":"Surabaya","Bulan":"Januari","Jumlah_Bed_Terisi":66.9,"Sisa_Bed_Tersedia":133.1,"Kapasitas_Bed":200,"Persentase":33.5},
        {"Kota":"Surabaya","Bulan":"Februari","Jumlah_Bed_Terisi":150.29,"Sisa_Bed_Tersedia":49.71,"Kapasitas_Bed":200,"Persentase":75.1},
        {"Kota":"Surabaya","Bulan":"Maret","Jumlah_Bed_Terisi":121,"Sisa_Bed_Tersedia":79,"Kapasitas_Bed":200,"Persentase":60.5},
        {"Kota":"Surabaya","Bulan":"April","Jumlah_Bed_Terisi":97.48,"Sisa_Bed_Tersedia":102.52,"Kapasitas_Bed":200,"Persentase":48.7},
        {"Kota":"Surabaya","Bulan":"Mei","Jumlah_Bed_Terisi":151.41,"Sisa_Bed_Tersedia":48.59,"Kapasitas_Bed":200,"Persentase":75.7},
        {"Kota":"Surabaya","Bulan":"Juni","Jumlah_Bed_Terisi":125.83,"Sisa_Bed_Tersedia":74.17,"Kapasitas_Bed":200,"Persentase":62.9},
        {"Kota":"Surabaya","Bulan":"Juli","Jumlah_Bed_Terisi":168.1,"Sisa_Bed_Tersedia":31.9,"Kapasitas_Bed":200,"Persentase":84.1},
        {"Kota":"Surabaya","Bulan":"Agustus","Jumlah_Bed_Terisi":172.28,"Sisa_Bed_Tersedia":27.72,"Kapasitas_Bed":200,"Persentase":86.1},
        {"Kota":"Surabaya","Bulan":"September","Jumlah_Bed_Terisi":120.41,"Sisa_Bed_Tersedia":79.59,"Kapasitas_Bed":200,"Persentase":60.2},
        {"Kota":"Surabaya","Bulan":"Oktober","Jumlah_Bed_Terisi":144.23,"Sisa_Bed_Tersedia":55.77,"Kapasitas_Bed":200,"Persentase":72.1},
        {"Kota":"Makassar","Bulan":"Januari","Jumlah_Bed_Terisi":75.03,"Sisa_Bed_Tersedia":124.97,"Kapasitas_Bed":200,"Persentase":37.5},
        {"Kota":"Makassar","Bulan":"Februari","Jumlah_Bed_Terisi":65.79,"Sisa_Bed_Tersedia":42.21,"Kapasitas_Bed":108,"Persentase":60.9},
        {"Kota":"Makassar","Bulan":"Maret","Jumlah_Bed_Terisi":35.45,"Sisa_Bed_Tersedia":72.55,"Kapasitas_Bed":108,"Persentase":32.8},
        {"Kota":"Makassar","Bulan":"April","Jumlah_Bed_Terisi":59.13,"Sisa_Bed_Tersedia":48.87,"Kapasitas_Bed":108,"Persentase":54.8},
        {"Kota":"Makassar","Bulan":"Mei","Jumlah_Bed_Terisi":34.1,"Sisa_Bed_Tersedia":73.9,"Kapasitas_Bed":108,"Persentase":31.6},
        {"Kota":"Makassar","Bulan":"Juni","Jumlah_Bed_Terisi":50.9,"Sisa_Bed_Tersedia":57.1,"Kapasitas_Bed":108,"Persentase":47.1},
        {"Kota":"Makassar","Bulan":"Juli","Jumlah_Bed_Terisi":96.58,"Sisa_Bed_Tersedia":11.42,"Kapasitas_Bed":108,"Persentase":89.4},
        {"Kota":"Makassar","Bulan":"Agustus","Jumlah_Bed_Terisi":44.03,"Sisa_Bed_Tersedia":63.97,"Kapasitas_Bed":108,"Persentase":40.8},
        {"Kota":"Makassar","Bulan":"September","Jumlah_Bed_Terisi":99.13,"Sisa_Bed_Tersedia":8.87,"Kapasitas_Bed":108,"Persentase":91.8},
        {"Kota":"Makassar","Bulan":"Oktober","Jumlah_Bed_Terisi":68.39,"Sisa_Bed_Tersedia":39.61,"Kapasitas_Bed":108,"Persentase":63.3},
        {"Kota":"Yogyakarta","Bulan":"Januari","Jumlah_Bed_Terisi":38,"Sisa_Bed_Tersedia":162,"Kapasitas_Bed":200,"Persentase":19},
        {"Kota":"Yogyakarta","Bulan":"Februari","Jumlah_Bed_Terisi":91.57,"Sisa_Bed_Tersedia":108.43,"Kapasitas_Bed":200,"Persentase":45.8},
        {"Kota":"Yogyakarta","Bulan":"Maret","Jumlah_Bed_Terisi":66.81,"Sisa_Bed_Tersedia":133.19,"Kapasitas_Bed":200,"Persentase":33.4},
        {"Kota":"Yogyakarta","Bulan":"April","Jumlah_Bed_Terisi":49.9,"Sisa_Bed_Tersedia":150.1,"Kapasitas_Bed":200,"Persentase":25},
        {"Kota":"Yogyakarta","Bulan":"Mei","Jumlah_Bed_Terisi":41.83,"Sisa_Bed_Tersedia":158.17,"Kapasitas_Bed":200,"Persentase":20.9},
        {"Kota":"Yogyakarta","Bulan":"Juni","Jumlah_Bed_Terisi":83.03,"Sisa_Bed_Tersedia":116.97,"Kapasitas_Bed":200,"Persentase":41.5},
        {"Kota":"Yogyakarta","Bulan":"Juli","Jumlah_Bed_Terisi":130.19,"Sisa_Bed_Tersedia":69.81,"Kapasitas_Bed":200,"Persentase":65.1},
        {"Kota":"Yogyakarta","Bulan":"Agustus","Jumlah_Bed_Terisi":102.68,"Sisa_Bed_Tersedia":97.32,"Kapasitas_Bed":200,"Persentase":51.3},
        {"Kota":"Yogyakarta","Bulan":"September","Jumlah_Bed_Terisi":169.83,"Sisa_Bed_Tersedia":30.17,"Kapasitas_Bed":200,"Persentase":84.9},
        {"Kota":"Yogyakarta","Bulan":"Oktober","Jumlah_Bed_Terisi":86.24,"Sisa_Bed_Tersedia":113.76,"Kapasitas_Bed":200,"Persentase":43.1}
    ].map((item, index) => ({
        ...item,
        id: index + 1
    }));
}

// Update dashboard dengan data yang difilter
function updateDashboard() {
    if (filteredData.length === 0) {
        bedCapacityEl.textContent = '0';
        bedFilledEl.textContent = '0';
        bedAvailableEl.textContent = '0';
        bedPercentageEl.textContent = '0%';
        dataCountEl.textContent = '0';
        return;
    }
    
    // Hitung total
    const totalCapacity = filteredData.reduce((sum, item) => sum + item.Kapasitas_Bed, 0);
    const totalFilled = filteredData.reduce((sum, item) => sum + item.Jumlah_Bed_Terisi, 0);
    const totalAvailable = filteredData.reduce((sum, item) => sum + item.Sisa_Bed_Tersedia, 0);
    
    // Update card values
    bedCapacityEl.textContent = Math.round(totalCapacity).toLocaleString('id-ID');
    bedFilledEl.textContent = Math.round(totalFilled).toLocaleString('id-ID');
    bedAvailableEl.textContent = Math.round(totalAvailable).toLocaleString('id-ID');
    
    // Hitung dan update persentase ketersediaan
    const percentage = totalCapacity > 0 ? 
        ((totalAvailable / totalCapacity) * 100).toFixed(1) : 0;
    bedPercentageEl.textContent = `${percentage}%`;
    
    // Update data count
    dataCountEl.textContent = filteredData.length.toLocaleString('id-ID');
}

// Render tabel data
function renderTable() {
    if (filteredData.length === 0) {
        tableBodyEl.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                    Tidak ada data yang sesuai dengan filter
                </td>
            </tr>
        `;
        return;
    }
    
    tableBodyEl.innerHTML = '';
    
    filteredData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Tentukan kelas warna berdasarkan persentase
        let percentageClass = 'percentage-high';
        if (item.Persentase < 50) {
            percentageClass = 'percentage-low';
        } else if (item.Persentase < 75) {
            percentageClass = 'percentage-medium';
        }
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${item.Bulan}</strong></td>
            <td><strong>${item.Kota}</strong></td>
            <td>${item.Kapasitas_Bed.toLocaleString('id-ID')}</td>
            <td>${item.Jumlah_Bed_Terisi.toFixed(1)}</td>
            <td>${item.Sisa_Bed_Tersedia.toFixed(1)}</td>
            <td><span class="percentage-badge ${percentageClass}">${item.Persentase.toFixed(1)}%</span></td>
        `;
        
        tableBodyEl.appendChild(row);
    });
}

// Update daftar kota
function updateCityList() {
    cityListEl.innerHTML = '';
    
    // Dapatkan data agregat per kota
    const cityData = getCityData();
    
    cityData.cities.forEach((city, index) => {
        const cityItem = document.createElement('div');
        cityItem.className = 'city-item';
        cityItem.setAttribute('data-city', city);
        
        const terisi = Math.round(cityData.bedFilled[index]);
        const available = Math.round(cityData.bedAvailable[index]);
        const percentage = parseFloat(cityData.availabilityPercent[index]).toFixed(1);
        
        cityItem.innerHTML = `
            <div class="city-color" style="background-color: ${cityColors[city]}"></div>
            <div class="city-info">
                <div class="city-name">${city}</div>
                <div class="city-stats">
                    <span>Terisi: ${terisi}</span>
                    <span>Sisa: ${available}</span>
                    <span>${percentage}%</span>
                </div>
            </div>
        `;
        
        cityItem.addEventListener('click', () => {
            highlightCity(city);
        });
        
        cityListEl.appendChild(cityItem);
    });
}

// Update trend summary
function updateTrendSummary() {
    const monthlyData = getMonthlyTrendData();
    const currentMonthIndex = monthlyData.months.length - 1;
    
    if (currentMonthIndex < 1) {
        trendSummaryEl.innerHTML = '<p>Tidak cukup data untuk analisis trend</p>';
        return;
    }
    
    const currentAvg = monthlyData.avgPercentages[currentMonthIndex];
    const previousAvg = monthlyData.avgPercentages[currentMonthIndex - 1];
    const trend = currentAvg - previousAvg;
    
    const highestMonth = monthlyData.months.reduce((prev, curr, idx) => 
        monthlyData.avgPercentages[idx] > monthlyData.avgPercentages[monthOrder.indexOf(prev)] ? curr : prev
    );
    
    const lowestMonth = monthlyData.months.reduce((prev, curr, idx) => 
        monthlyData.avgPercentages[idx] < monthlyData.avgPercentages[monthOrder.indexOf(prev)] ? curr : prev
    );
    
    let trendClass = 'trend-neutral';
    if (trend > 2) trendClass = 'trend-negative';
    if (trend < -2) trendClass = 'trend-positive';
    
    trendSummaryEl.innerHTML = `
        <div class="trend-item">
            <span class="trend-label">Trend Bulan Ini:</span>
            <span class="trend-value ${trendClass}">
                ${trend > 0 ? '+' : ''}${trend.toFixed(1)}%
                ${trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
            </span>
        </div>
        <div class="trend-item">
            <span class="trend-label">Rata-rata Terisi:</span>
            <span class="trend-value">${currentAvg.toFixed(1)}%</span>
        </div>
        <div class="trend-item">
            <span class="trend-label">Tertinggi:</span>
            <span class="trend-value">${highestMonth} (${Math.max(...monthlyData.avgPercentages).toFixed(1)}%)</span>
        </div>
        <div class="trend-item">
            <span class="trend-label">Terendah:</span>
            <span class="trend-value">${lowestMonth} (${Math.min(...monthlyData.avgPercentages).toFixed(1)}%)</span>
        </div>
        <div class="trend-item">
            <span class="trend-label">Fluktuasi:</span>
            <span class="trend-value">${(Math.max(...monthlyData.avgPercentages) - Math.min(...monthlyData.avgPercentages)).toFixed(1)}%</span>
        </div>
    `;
}

// Highlight kota tertentu
function highlightCity(city) {
    // Hapus class active dari semua item
    document.querySelectorAll('.city-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Tambah class active ke item yang diklik
    const cityItem = document.querySelector(`.city-item[data-city="${city}"]`);
    if (cityItem) {
        cityItem.classList.add('active');
    }
    
    // Update trend chart untuk fokus pada kota tertentu
    updateTrendChart(city);
}

// Update main pie chart
function updateMainPieChart() {
    const month = monthFilterEl.value;
    const city = cityFilterEl.value;
    
    // Update chart title
    if (month === 'all' && city === 'all') {
        chartTitleEl.textContent = 'Rata-rata semua bulan untuk semua kota';
    } else if (month !== 'all' && city === 'all') {
        chartTitleEl.textContent = `Bulan: ${month} untuk semua kota`;
    } else if (month === 'all' && city !== 'all') {
        chartTitleEl.textContent = `Rata-rata semua bulan untuk kota ${city}`;
    } else {
        chartTitleEl.textContent = `Bulan: ${month} untuk kota ${city}`;
    }
    
    // Dapatkan data untuk chart
    const chartData = getChartData();
    
    // Hapus chart lama jika ada
    if (mainPieChart) {
        mainPieChart.destroy();
    }
    
    // Buat chart baru
    const ctx = document.getElementById('mainPieChart').getContext('2d');
    mainPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: chartData.colors,
                borderWidth: 2,
                borderColor: '#fff',
                hoverBorderWidth: 3,
                hoverBorderColor: '#333',
                hoverOffset: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '50%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = value.toFixed(1);
                            return `${label}: ${percentage}%`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000
            }
        }
    });
    
    // Update legend
    updateChartLegend(chartData.labels, chartData.colors, chartData.data);
}

// Update chart legend
function updateChartLegend(labels, colors, data) {
    chartLegendEl.innerHTML = '';
    
    labels.forEach((label, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        
        legendItem.innerHTML = `
            <div class="legend-color" style="background-color: ${colors[index]}"></div>
            <span>${label}</span>
            <strong>${data[index].toFixed(1)}%</strong>
        `;
        
        chartLegendEl.appendChild(legendItem);
    });
}

// Update mini pie charts
function updateMiniPieCharts() {
    miniChartsGridEl.innerHTML = '';
    
    // Dapatkan data untuk setiap kota
    const cities = ['Bandung', 'Padang', 'Surabaya', 'Makassar', 'Yogyakarta'];
    const month = monthFilterEl.value;
    
    cities.forEach(city => {
        // Dapatkan data untuk kota ini
        const cityData = getCitySpecificData(city, month);
        
        // Buat card untuk chart kota
        const chartCard = document.createElement('div');
        chartCard.className = 'mini-chart-card';
        chartCard.id = `mini-chart-${city.toLowerCase()}`;
        
        const terisiPercent = (cityData.terisi * 100).toFixed(1);
        const kosongPercent = (cityData.kosong * 100).toFixed(1);
        
        chartCard.innerHTML = `
            <div class="mini-chart-header">
                <div class="mini-chart-city">${city}</div>
                <div class="mini-chart-month">${month === 'all' ? 'Rata-rata' : month}</div>
            </div>
            <div class="mini-chart-container">
                <canvas id="mini-chart-${city.toLowerCase()}-canvas"></canvas>
            </div>
            <div class="mini-chart-stats">
                <div class="mini-stat">
                    <div class="mini-stat-value" style="color: ${cityColors[city]}">${terisiPercent}%</div>
                    <div class="mini-stat-label">Terisi</div>
                </div>
                <div class="mini-stat">
                    <div class="mini-stat-value" style="color: #888">${kosongPercent}%</div>
                    <div class="mini-stat-label">Kosong</div>
                </div>
            </div>
        `;
        
        miniChartsGridEl.appendChild(chartCard);
        
        // Buat chart setelah DOM diupdate
        setTimeout(() => {
            createMiniChart(city, cityData);
        }, 10);
    });
}

// Buat mini chart untuk kota
function createMiniChart(city, data) {
    const ctx = document.getElementById(`mini-chart-${city.toLowerCase()}-canvas`).getContext('2d');
    
    // Hapus chart lama jika ada
    if (miniCharts[city]) {
        miniCharts[city].destroy();
    }
    
    // Buat chart baru
    miniCharts[city] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Terisi', 'Kosong'],
            datasets: [{
                data: [data.terisi * 100, data.kosong * 100],
                backgroundColor: [cityColors[city], '#ddd'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// Update trend chart
function updateTrendChart(highlightCity = null) {
    const trendData = getMonthlyTrendData();
    
    // Hapus chart lama jika ada
    if (trendChart) {
        trendChart.destroy();
    }
    
    // Buat dataset untuk trend chart
    const datasets = [];
    
    // Dataset untuk rata-rata semua kota
    datasets.push({
        label: 'Rata-rata Semua Kota',
        data: trendData.avgPercentages,
        borderColor: '#3498db',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3498db',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
    });
    
    // Jika ada kota yang di-highlight, tambahkan dataset untuk kota tersebut
    if (highlightCity) {
        const cityTrendData = getCityMonthlyTrendData(highlightCity);
        datasets.push({
            label: highlightCity,
            data: cityTrendData.percentages,
            borderColor: cityColors[highlightCity],
            backgroundColor: 'rgba(255, 255, 255, 0)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointBackgroundColor: cityColors[highlightCity],
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4
        });
    }
    
    // Buat chart baru
    const ctx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Persentase Bed Terisi (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Bulan',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// Update comparison chart
function updateComparisonChart() {
    const comparisonData = getCityComparisonData();
    
    // Hapus chart lama jika ada
    if (comparisonChart) {
        comparisonChart.destroy();
    }
    
    // Buat chart baru
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: comparisonData.cities,
            datasets: [
                {
                    label: 'Bed Terisi',
                    data: comparisonData.terisiPercentages,
                    backgroundColor: comparisonData.cities.map(city => cityColors[city]),
                    borderColor: comparisonData.cities.map(city => cityColors[city]),
                    borderWidth: 1,
                    borderRadius: 5
                },
                {
                    label: 'Bed Kosong',
                    data: comparisonData.kosongPercentages,
                    backgroundColor: '#ddd',
                    borderColor: '#bbb',
                    borderWidth: 1,
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Persentase (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    stacked: false,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Kota',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// Helper functions untuk mendapatkan data
function getChartData() {
    const cityData = getCityData();
    
    return {
        labels: cityData.cities,
        data: cityData.availabilityPercent,
        colors: cityData.cities.map(city => cityColors[city])
    };
}

function getCitySpecificData(city, month) {
    let cityFilteredData;
    
    if (month === 'all') {
        // Rata-rata semua bulan untuk kota tertentu
        cityFilteredData = filteredData.filter(item => item.Kota === city);
    } else {
        // Data bulan tertentu untuk kota tertentu
        cityFilteredData = filteredData.filter(item => 
            item.Kota === city && item.Bulan === month
        );
    }
    
    if (cityFilteredData.length === 0) {
        return { terisi: 0, kosong: 1 };
    }
    
    // Hitung rata-rata
    const totalTerisi = cityFilteredData.reduce((sum, item) => 
        sum + (item.Jumlah_Bed_Terisi / item.Kapasitas_Bed), 0);
    const totalKosong = cityFilteredData.reduce((sum, item) => 
        sum + (item.Sisa_Bed_Tersedia / item.Kapasitas_Bed), 0);
    
    const count = cityFilteredData.length;
    
    return {
        terisi: totalTerisi / count,
        kosong: totalKosong / count
    };
}

function getMonthlyTrendData() {
    // Dapatkan semua bulan yang ada dalam data, diurutkan
    const allMonths = [...new Set(filteredData.map(item => item.Bulan))];
    const sortedMonths = allMonths.sort((a, b) => 
        monthOrder.indexOf(a) - monthOrder.indexOf(b)
    );
    
    const avgPercentages = [];
    
    sortedMonths.forEach(month => {
        const monthData = filteredData.filter(item => item.Bulan === month);
        if (monthData.length === 0) {
            avgPercentages.push(0);
            return;
        }
        
        const totalCapacity = monthData.reduce((sum, item) => sum + item.Kapasitas_Bed, 0);
        const totalFilled = monthData.reduce((sum, item) => sum + item.Jumlah_Bed_Terisi, 0);
        
        const avgPercentage = totalCapacity > 0 ? (totalFilled / totalCapacity * 100) : 0;
        avgPercentages.push(avgPercentage);
    });
    
    return {
        months: sortedMonths,
        avgPercentages: avgPercentages
    };
}

function getCityMonthlyTrendData(city) {
    const allMonths = [...new Set(filteredData.map(item => item.Bulan))];
    const sortedMonths = allMonths.sort((a, b) => 
        monthOrder.indexOf(a) - monthOrder.indexOf(b)
    );
    
    const percentages = [];
    
    sortedMonths.forEach(month => {
        const monthData = filteredData.filter(item => 
            item.Kota === city && item.Bulan === month
        );
        
        if (monthData.length === 0) {
            percentages.push(0);
            return;
        }
        
        const data = monthData[0]; // Hanya ada satu data per bulan per kota
        percentages.push(data.Persentase);
    });
    
    return {
        months: sortedMonths,
        percentages: percentages
    };
}

function getCityComparisonData() {
    const cities = ['Bandung', 'Padang', 'Surabaya', 'Makassar', 'Yogyakarta'];
    const terisiPercentages = [];
    const kosongPercentages = [];
    
    cities.forEach(city => {
        const cityData = getCitySpecificData(city, monthFilterEl.value);
        terisiPercentages.push(cityData.terisi * 100);
        kosongPercentages.push(cityData.kosong * 100);
    });
    
    return {
        cities: cities,
        terisiPercentages: terisiPercentages,
        kosongPercentages: kosongPercentages
    };
}

function getCityData() {
    const cityMap = {};
    
    filteredData.forEach(item => {
        const city = item.Kota;
        
        if (!cityMap[city]) {
            cityMap[city] = {
                bedCapacity: 0,
                bedFilled: 0,
                bedAvailable: 0,
                count: 0
            };
        }
        
        cityMap[city].bedCapacity += item.Kapasitas_Bed;
        cityMap[city].bedFilled += item.Jumlah_Bed_Terisi;
        cityMap[city].bedAvailable += item.Sisa_Bed_Tersedia;
        cityMap[city].count += 1;
    });
    
    const cities = Object.keys(cityMap);
    const bedCapacity = cities.map(city => Math.round(cityMap[city].bedCapacity));
    const bedFilled = cities.map(city => Math.round(cityMap[city].bedFilled));
    const bedAvailable = cities.map(city => Math.round(cityMap[city].bedAvailable));
    
    // Hitung persentase kepadatan per kota (bed terisi / kapasitas)
    const availabilityPercent = cities.map(city => {
        const capacity = cityMap[city].bedCapacity;
        const filled = cityMap[city].bedFilled;
        return capacity > 0 ? ((filled / capacity) * 100) : 0;
    });
    
    return { cities, bedCapacity, bedFilled, bedAvailable, availabilityPercent };
}

// Filter data berdasarkan bulan dan kota
function filterData() {
    const selectedMonth = monthFilterEl.value;
    const selectedCity = cityFilterEl.value;
    
    filteredData = hospitalData.filter(item => {
        const monthMatch = selectedMonth === 'all' || item.Bulan === selectedMonth;
        const cityMatch = selectedCity === 'all' || item.Kota === selectedCity;
        
        return monthMatch && cityMatch;
    });
    
    updateDashboard();
    renderTable();
    updateCityList();
    updateTrendSummary();
    updateMainPieChart();
    updateMiniPieCharts();
    updateTrendChart();
    updateComparisonChart();
}

// Event Listeners
monthFilterEl.addEventListener('change', filterData);
cityFilterEl.addEventListener('change', filterData);

resetFiltersBtn.addEventListener('click', () => {
    monthFilterEl.value = 'all';
    cityFilterEl.value = 'all';
    filterData();
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', loadData);
