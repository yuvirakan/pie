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
const yearFilterEl = document.getElementById('year-filter');
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
const monthTitleEl = document.getElementById('monthTitle');

// Urutan bulan yang benar
const monthOrder = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Urutan tahun
const yearOrder = ['2025', '2026'];

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
        
        // Proses data dengan tahun
        hospitalData = data.map((item, index) => {
            // Hitung persentase kepadatan (Bed Terisi / Kapasitas Bed * 100)
            const persentase = item.Kapasitas_Bed > 0 ? 
                (item.Jumlah_Bed_Terisi / item.Kapasitas_Bed * 100) : 0;
            
            return {
                id: index + 1,
                Kota: item.Kota,
                Bulan: item.Bulan,
                Tahun: item.Tahun || '2025', // Default ke 2025 jika tidak ada
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
        updateMonthTitle();
        
        console.log('Dashboard berhasil di-load');
        
    } catch (error) {
        console.error('Error loading data:', error);
        
        // Gunakan data fallback dari variabel langsung dengan tahun
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
        updateMonthTitle();
        
        console.log('Menggunakan data fallback');
    }
}

// Data fallback jika file JSON tidak ditemukan dengan tahun
function getFallbackData() {
    return [
        {"Kota":"Bandung","Bulan":"Januari","Tahun":"2025","Jumlah_Bed_Terisi":59.67,"Sisa_Bed_Tersedia":140.33,"Kapasitas_Bed":200,"Persentase":29.8},
        {"Kota":"Bandung","Bulan":"Februari","Tahun":"2025","Jumlah_Bed_Terisi":141.5,"Sisa_Bed_Tersedia":58.5,"Kapasitas_Bed":200,"Persentase":70.8},
        {"Kota":"Bandung","Bulan":"Maret","Tahun":"2025","Jumlah_Bed_Terisi":58.3,"Sisa_Bed_Tersedia":141.7,"Kapasitas_Bed":200,"Persentase":29.2},
        {"Kota":"Bandung","Bulan":"April","Tahun":"2025","Jumlah_Bed_Terisi":36.6,"Sisa_Bed_Tersedia":163.4,"Kapasitas_Bed":200,"Persentase":18.3},
        {"Kota":"Bandung","Bulan":"Mei","Tahun":"2025","Jumlah_Bed_Terisi":113.7,"Sisa_Bed_Tersedia":86.3,"Kapasitas_Bed":200,"Persentase":56.9},
        {"Kota":"Bandung","Bulan":"Juni","Tahun":"2025","Jumlah_Bed_Terisi":113.77,"Sisa_Bed_Tersedia":86.23,"Kapasitas_Bed":200,"Persentase":56.9},
        {"Kota":"Bandung","Bulan":"Juli","Tahun":"2025","Jumlah_Bed_Terisi":112.1,"Sisa_Bed_Tersedia":87.9,"Kapasitas_Bed":200,"Persentase":56.1},
        {"Kota":"Bandung","Bulan":"Agustus","Tahun":"2025","Jumlah_Bed_Terisi":122.83,"Sisa_Bed_Tersedia":77.17,"Kapasitas_Bed":200,"Persentase":61.4},
        {"Kota":"Bandung","Bulan":"September","Tahun":"2025","Jumlah_Bed_Terisi":125.33,"Sisa_Bed_Tersedia":74.67,"Kapasitas_Bed":200,"Persentase":62.7},
        {"Kota":"Padang","Bulan":"Januari","Tahun":"2025","Jumlah_Bed_Terisi":37.35,"Sisa_Bed_Tersedia":162.65,"Kapasitas_Bed":200,"Persentase":18.7},
        {"Kota":"Padang","Bulan":"Februari","Tahun":"2025","Jumlah_Bed_Terisi":49.36,"Sisa_Bed_Tersedia":150.64,"Kapasitas_Bed":200,"Persentase":24.7},
        {"Kota":"Padang","Bulan":"Maret","Tahun":"2025","Jumlah_Bed_Terisi":33.35,"Sisa_Bed_Tersedia":166.65,"Kapasitas_Bed":200,"Persentase":16.7},
        {"Kota":"Padang","Bulan":"April","Tahun":"2025","Jumlah_Bed_Terisi":42.84,"Sisa_Bed_Tersedia":157.16,"Kapasitas_Bed":200,"Persentase":21.4},
        {"Kota":"Padang","Bulan":"Mei","Tahun":"2025","Jumlah_Bed_Terisi":4.94,"Sisa_Bed_Tersedia":195.06,"Kapasitas_Bed":200,"Persentase":2.5},
        {"Kota":"Padang","Bulan":"Juni","Tahun":"2025","Jumlah_Bed_Terisi":42.45,"Sisa_Bed_Tersedia":157.55,"Kapasitas_Bed":200,"Persentase":21.2},
        {"Kota":"Padang","Bulan":"Juli","Tahun":"2025","Jumlah_Bed_Terisi":42.65,"Sisa_Bed_Tersedia":157.35,"Kapasitas_Bed":200,"Persentase":21.3},
        {"Kota":"Padang","Bulan":"Agustus","Tahun":"2025","Jumlah_Bed_Terisi":77,"Sisa_Bed_Tersedia":123,"Kapasitas_Bed":200,"Persentase":38.5},
        {"Kota":"Padang","Bulan":"September","Tahun":"2025","Jumlah_Bed_Terisi":56.9,"Sisa_Bed_Tersedia":143.1,"Kapasitas_Bed":200,"Persentase":28.5},
        {"Kota":"Padang","Bulan":"Oktober","Tahun":"2025","Jumlah_Bed_Terisi":67.06,"Sisa_Bed_Tersedia":132.94,"Kapasitas_Bed":200,"Persentase":33.5},
        {"Kota":"Padang","Bulan":"November","Tahun":"2025","Jumlah_Bed_Terisi":11.68,"Sisa_Bed_Tersedia":188.32,"Kapasitas_Bed":200,"Persentase":5.8},
        {"Kota":"Surabaya","Bulan":"Januari","Tahun":"2025","Jumlah_Bed_Terisi":66.9,"Sisa_Bed_Tersedia":133.1,"Kapasitas_Bed":200,"Persentase":33.5},
        {"Kota":"Surabaya","Bulan":"Februari","Tahun":"2025","Jumlah_Bed_Terisi":150.29,"Sisa_Bed_Tersedia":49.71,"Kapasitas_Bed":200,"Persentase":75.1},
        {"Kota":"Surabaya","Bulan":"Maret","Tahun":"2025","Jumlah_Bed_Terisi":121,"Sisa_Bed_Tersedia":79,"Kapasitas_Bed":200,"Persentase":60.5},
        {"Kota":"Surabaya","Bulan":"April","Tahun":"2025","Jumlah_Bed_Terisi":97.48,"Sisa_Bed_Tersedia":102.52,"Kapasitas_Bed":200,"Persentase":48.7},
        {"Kota":"Surabaya","Bulan":"Mei","Tahun":"2025","Jumlah_Bed_Terisi":151.41,"Sisa_Bed_Tersedia":48.59,"Kapasitas_Bed":200,"Persentase":75.7},
        {"Kota":"Surabaya","Bulan":"Juni","Tahun":"2025","Jumlah_Bed_Terisi":125.83,"Sisa_Bed_Tersedia":74.17,"Kapasitas_Bed":200,"Persentase":62.9},
        {"Kota":"Surabaya","Bulan":"Juli","Tahun":"2025","Jumlah_Bed_Terisi":168.1,"Sisa_Bed_Tersedia":31.9,"Kapasitas_Bed":200,"Persentase":84.1},
        {"Kota":"Surabaya","Bulan":"Agustus","Tahun":"2025","Jumlah_Bed_Terisi":172.28,"Sisa_Bed_Tersedia":27.72,"Kapasitas_Bed":200,"Persentase":86.1},
        {"Kota":"Surabaya","Bulan":"September","Tahun":"2025","Jumlah_Bed_Terisi":120.41,"Sisa_Bed_Tersedia":79.59,"Kapasitas_Bed":200,"Persentase":60.2},
        {"Kota":"Surabaya","Bulan":"Oktober","Tahun":"2025","Jumlah_Bed_Terisi":144.23,"Sisa_Bed_Tersedia":55.77,"Kapasitas_Bed":200,"Persentase":72.1},
        {"Kota":"Makassar","Bulan":"Januari","Tahun":"2025","Jumlah_Bed_Terisi":75.03,"Sisa_Bed_Tersedia":124.97,"Kapasitas_Bed":200,"Persentase":37.5},
        {"Kota":"Makassar","Bulan":"Februari","Tahun":"2025","Jumlah_Bed_Terisi":65.79,"Sisa_Bed_Tersedia":42.21,"Kapasitas_Bed":108,"Persentase":60.9},
        {"Kota":"Makassar","Bulan":"Maret","Tahun":"2025","Jumlah_Bed_Terisi":35.45,"Sisa_Bed_Tersedia":72.55,"Kapasitas_Bed":108,"Persentase":32.8},
        {"Kota":"Makassar","Bulan":"April","Tahun":"2025","Jumlah_Bed_Terisi":59.13,"Sisa_Bed_Tersedia":48.87,"Kapasitas_Bed":108,"Persentase":54.8},
        {"Kota":"Makassar","Bulan":"Mei","Tahun":"2025","Jumlah_Bed_Terisi":34.1,"Sisa_Bed_Tersedia":73.9,"Kapasitas_Bed":108,"Persentase":31.6},
        {"Kota":"Makassar","Bulan":"Juni","Tahun":"2025","Jumlah_Bed_Terisi":50.9,"Sisa_Bed_Tersedia":57.1,"Kapasitas_Bed":108,"Persentase":47.1},
        {"Kota":"Makassar","Bulan":"Juli","Tahun":"2025","Jumlah_Bed_Terisi":96.58,"Sisa_Bed_Tersedia":11.42,"Kapasitas_Bed":108,"Persentase":89.4},
        {"Kota":"Makassar","Bulan":"Agustus","Tahun":"2025","Jumlah_Bed_Terisi":44.03,"Sisa_Bed_Tersedia":63.97,"Kapasitas_Bed":108,"Persentase":40.8},
        {"Kota":"Makassar","Bulan":"September","Tahun":"2025","Jumlah_Bed_Terisi":99.13,"Sisa_Bed_Tersedia":8.87,"Kapasitas_Bed":108,"Persentase":91.8},
        {"Kota":"Makassar","Bulan":"Oktober","Tahun":"2025","Jumlah_Bed_Terisi":68.39,"Sisa_Bed_Tersedia":39.61,"Kapasitas_Bed":108,"Persentase":63.3},
        {"Kota":"Yogyakarta","Bulan":"Januari","Tahun":"2025","Jumlah_Bed_Terisi":38,"Sisa_Bed_Tersedia":162,"Kapasitas_Bed":200,"Persentase":19},
        {"Kota":"Yogyakarta","Bulan":"Februari","Tahun":"2025","Jumlah_Bed_Terisi":91.57,"Sisa_Bed_Tersedia":108.43,"Kapasitas_Bed":200,"Persentase":45.8},
        {"Kota":"Yogyakarta","Bulan":"Maret","Tahun":"2025","Jumlah_Bed_Terisi":66.81,"Sisa_Bed_Tersedia":133.19,"Kapasitas_Bed":200,"Persentase":33.4},
        {"Kota":"Yogyakarta","Bulan":"April","Tahun":"2025","Jumlah_Bed_Terisi":49.9,"Sisa_Bed_Tersedia":150.1,"Kapasitas_Bed":200,"Persentase":25},
        {"Kota":"Yogyakarta","Bulan":"Mei","Tahun":"2025","Jumlah_Bed_Terisi":41.83,"Sisa_Bed_Tersedia":158.17,"Kapasitas_Bed":200,"Persentase":20.9},
        {"Kota":"Yogyakarta","Bulan":"Juni","Tahun":"2025","Jumlah_Bed_Terisi":83.03,"Sisa_Bed_Tersedia":116.97,"Kapasitas_Bed":200,"Persentase":41.5},
        {"Kota":"Yogyakarta","Bulan":"Juli","Tahun":"2025","Jumlah_Bed_Terisi":130.19,"Sisa_Bed_Tersedia":69.81,"Kapasitas_Bed":200,"Persentase":65.1},
        {"Kota":"Yogyakarta","Bulan":"Agustus","Tahun":"2025","Jumlah_Bed_Terisi":102.68,"Sisa_Bed_Tersedia":97.32,"Kapasitas_Bed":200,"Persentase":51.3},
        {"Kota":"Yogyakarta","Bulan":"September","Tahun":"2025","Jumlah_Bed_Terisi":169.83,"Sisa_Bed_Tersedia":30.17,"Kapasitas_Bed":200,"Persentase":84.9},
        {"Kota":"Yogyakarta","Bulan":"Oktober","Tahun":"2025","Jumlah_Bed_Terisi":86.24,"Sisa_Bed_Tersedia":113.76,"Kapasitas_Bed":200,"Persentase":43.1},
        // Data untuk tahun 2026
        {"Kota":"Bandung","Bulan":"Januari","Tahun":"2026","Jumlah_Bed_Terisi":70.3,"Sisa_Bed_Tersedia":129.7,"Kapasitas_Bed":200,"Persentase":35.2},
        {"Kota":"Bandung","Bulan":"Februari","Tahun":"2026","Jumlah_Bed_Terisi":148.9,"Sisa_Bed_Tersedia":51.1,"Kapasitas_Bed":200,"Persentase":74.5},
        {"Kota":"Padang","Bulan":"Januari","Tahun":"2026","Jumlah_Bed_Terisi":45.2,"Sisa_Bed_Tersedia":154.8,"Kapasitas_Bed":200,"Persentase":22.6},
        {"Kota":"Padang","Bulan":"Februari","Tahun":"2026","Jumlah_Bed_Terisi":52.8,"Sisa_Bed_Tersedia":147.2,"Kapasitas_Bed":200,"Persentase":26.4},
        {"Kota":"Surabaya","Bulan":"Januari","Tahun":"2026","Jumlah_Bed_Terisi":120.5,"Sisa_Bed_Tersedia":79.5,"Kapasitas_Bed":200,"Persentase":60.3},
        {"Kota":"Surabaya","Bulan":"Februari","Tahun":"2026","Jumlah_Bed_Terisi":158.7,"Sisa_Bed_Tersedia":41.3,"Kapasitas_Bed":200,"Persentase":79.4},
        {"Kota":"Makassar","Bulan":"Januari","Tahun":"2026","Jumlah_Bed_Terisi":85.4,"Sisa_Bed_Tersedia":22.6,"Kapasitas_Bed":108,"Persentase":79.1},
        {"Kota":"Yogyakarta","Bulan":"September","Tahun":"2026","Jumlah_Bed_Terisi":95.2,"Sisa_Bed_Tersedia":104.8,"Kapasitas_Bed":200,"Persentase":47.6}
        {"Kota":"Yogyakarta","Bulan":"Januari","Tahun":"2026","Jumlah_Bed_Terisi":95.2,"Sisa_Bed_Tersedia":104.8,"Kapasitas_Bed":200,"Persentase":47.6}
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

// Render tabel data dengan tahun
function renderTable() {
    if (filteredData.length === 0) {
        tableBodyEl.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
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
            <td><strong>${item.Tahun}</strong></td>
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

// Update main pie chart dengan tahun
function updateMainPieChart() {
    const month = monthFilterEl.value;
    const year = yearFilterEl.value;
    const city = cityFilterEl.value;
    
    // Update chart title dengan tahun
    if (month === 'all' && year === 'all' && city === 'all') {
        chartTitleEl.textContent = 'Rata-rata semua bulan dan tahun untuk semua kota';
    } else if (month !== 'all' && year === 'all' && city === 'all') {
        chartTitleEl.textContent = `Bulan: ${month} untuk semua tahun dan kota`;
    } else if (month === 'all' && year !== 'all' && city === 'all') {
        chartTitleEl.textContent = `Tahun: ${year} untuk semua bulan dan kota`;
    } else if (month === 'all' && year === 'all' && city !== 'all') {
        chartTitleEl.textContent = `Rata-rata semua bulan dan tahun untuk kota ${city}`;
    } else if (month !== 'all' && year !== 'all' && city === 'all') {
        chartTitleEl.textContent = `${month} ${year} untuk semua kota`;
    } else if (month !== 'all' && year === 'all' && city !== 'all') {
        chartTitleEl.textContent = `Bulan: ${month} untuk kota ${city} (semua tahun)`;
    } else if (month === 'all' && year !== 'all' && city !== 'all') {
        chartTitleEl.textContent = `Tahun: ${year} untuk kota ${city} (semua bulan)`;
    } else {
        chartTitleEl.textContent = `${month} ${year} untuk kota ${city}`;
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

// Update mini pie charts dengan tahun
function updateMiniPieCharts() {
    miniChartsGridEl.innerHTML = '';
    
    // Dapatkan data untuk setiap kota
    const cities = ['Bandung', 'Padang', 'Surabaya', 'Makassar', 'Yogyakarta'];
    const month = monthFilterEl.value;
    const year = yearFilterEl.value;
    
    cities.forEach(city => {
        // Dapatkan data untuk kota ini
        const cityData = getCitySpecificData(city, month, year);
        
        // Buat card untuk chart kota
        const chartCard = document.createElement('div');
        chartCard.className = 'mini-chart-card';
        chartCard.id = `mini-chart-${city.toLowerCase()}`;
        
        const terisiPercent = (cityData.terisi * 100).toFixed(1);
        const kosongPercent = (cityData.kosong * 100).toFixed(1);
        
        // Tentukan label periode
        let periodLabel = '';
        if (month === 'all' && year === 'all') {
            periodLabel = 'Rata-rata';
        } else if (month !== 'all' && year === 'all') {
            periodLabel = month;
        } else if (month === 'all' && year !== 'all') {
            periodLabel = `Tahun ${year}`;
        } else {
            periodLabel = `${month} ${year}`;
        }
        
        chartCard.innerHTML = `
            <div class="mini-chart-header">
                <div class="mini-chart-city">${city}</div>
                <div class="mini-chart-month">${periodLabel}</div>
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

// Update comparison chart dengan tahun
function updateComparisonChart() {
    const comparisonData = getCityComparisonData();
    const periodLabel = getPeriodLabel(); // Dapatkan label periode (bulan + tahun)
    
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
                    label: `Bed Terisi (${periodLabel})`,
                    data: comparisonData.terisiPercentages,
                    backgroundColor: comparisonData.cities.map(city => cityColors[city]),
                    borderColor: comparisonData.cities.map(city => cityColors[city]),
                    borderWidth: 1,
                    borderRadius: 5
                },
                {
                    label: `Bed Kosong (${periodLabel})`,
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
                        title: function(tooltipItems) {
                            return `${tooltipItems[0].label} - ${periodLabel}`;
                        },
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// Fungsi untuk update judul bulan dengan tahun
function updateMonthTitle() {
    const selectedMonth = monthFilterEl.value;
    const selectedYear = yearFilterEl.value;
    
    if (selectedMonth === 'all' && selectedYear === 'all') {
        monthTitleEl.textContent = ' Rata-rata Semua Bulan & Tahun';
        monthTitleEl.style.backgroundColor = '#e8f4fc';
        monthTitleEl.style.color = '#3498db';
        monthTitleEl.style.border = '2px solid #d6eaf8';
    } else if (selectedMonth !== 'all' && selectedYear === 'all') {
        monthTitleEl.textContent = ` ${selectedMonth} (Semua Tahun)`;
        monthTitleEl.style.backgroundColor = '#cfe2ffff';
        monthTitleEl.style.color = '#43a7ffdd';
        monthTitleEl.style.border = '1px solid #5bc8ff32';
    } else if (selectedMonth === 'all' && selectedYear !== 'all') {
        monthTitleEl.textContent = ` Tahun ${selectedYear} (Semua Bulan)`;
        monthTitleEl.style.backgroundColor = '#cfe2ffff';
        monthTitleEl.style.color = '#43a7ffdd';
        monthTitleEl.style.border = '1px solid #5bc8ff32';
    } else {
        monthTitleEl.textContent = ` ${selectedMonth} ${selectedYear}`;
        monthTitleEl.style.backgroundColor = '#cfe2ffff';
        monthTitleEl.style.color = '#43a7ffdd';
        monthTitleEl.style.border = '1px solid #5bc8ff32';
    }
}

// Fungsi untuk mendapatkan label periode (bulan + tahun)
function getPeriodLabel() {
    const selectedMonth = monthFilterEl.value;
    const selectedYear = yearFilterEl.value;
    
    if (selectedMonth === 'all' && selectedYear === 'all') {
        return 'Rata-rata Semua Bulan & Tahun';
    } else if (selectedMonth !== 'all' && selectedYear === 'all') {
        return `${selectedMonth} (Semua Tahun)`;
    } else if (selectedMonth === 'all' && selectedYear !== 'all') {
        return `Tahun ${selectedYear} (Semua Bulan)`;
    } else {
        return `${selectedMonth} ${selectedYear}`;
    }
}

// Helper functions untuk mendapatkan data dengan tahun
function getChartData() {
    const cityData = getCityData();
    
    return {
        labels: cityData.cities,
        data: cityData.availabilityPercent,
        colors: cityData.cities.map(city => cityColors[city])
    };
}

function getCitySpecificData(city, month, year) {
    let cityFilteredData;
    
    if (month === 'all' && year === 'all') {
        // Rata-rata semua bulan dan tahun untuk kota tertentu
        cityFilteredData = filteredData.filter(item => item.Kota === city);
    } else if (month !== 'all' && year === 'all') {
        // Data bulan tertentu untuk semua tahun untuk kota tertentu
        cityFilteredData = filteredData.filter(item => 
            item.Kota === city && item.Bulan === month
        );
    } else if (month === 'all' && year !== 'all') {
        // Semua bulan untuk tahun tertentu untuk kota tertentu
        cityFilteredData = filteredData.filter(item => 
            item.Kota === city && item.Tahun === year
        );
    } else {
        // Data bulan dan tahun tertentu untuk kota tertentu
        cityFilteredData = filteredData.filter(item => 
            item.Kota === city && item.Bulan === month && item.Tahun === year
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
        
        const data = monthData[0];
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
        const cityData = getCitySpecificData(city, monthFilterEl.value, yearFilterEl.value);
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

// Filter data berdasarkan bulan, tahun, dan kota
function filterData() {
    const selectedMonth = monthFilterEl.value;
    const selectedYear = yearFilterEl.value;
    const selectedCity = cityFilterEl.value;
    
    filteredData = hospitalData.filter(item => {
        const monthMatch = selectedMonth === 'all' || item.Bulan === selectedMonth;
        const yearMatch = selectedYear === 'all' || item.Tahun === selectedYear;
        const cityMatch = selectedCity === 'all' || item.Kota === selectedCity;
        
        return monthMatch && yearMatch && cityMatch;
    });
    
    updateDashboard();
    renderTable();
    updateCityList();
    updateTrendSummary();
    updateMainPieChart();
    updateMiniPieCharts();
    updateTrendChart();
    updateComparisonChart();
    updateMonthTitle();
}

// Event Listeners
monthFilterEl.addEventListener('change', filterData);
yearFilterEl.addEventListener('change', filterData);
cityFilterEl.addEventListener('change', filterData);

resetFiltersBtn.addEventListener('click', () => {
    monthFilterEl.value = 'all';
    yearFilterEl.value = 'all';
    cityFilterEl.value = 'all';
    filterData();
});

// Initialize dashboard
document.addEventListener('DOMContentLoaded', loadData);
