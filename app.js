/**
 * MAUSAM NEPAL (मौसम नेपाल) - Core Application Logic
 * Vanilla JavaScript implementation for fetching live weather data across Nepal.
 */

// ==========================================
// 1. NEPAL LOCATIONS DATABASE (PRE-CONFIGURED)
// ==========================================
const NEPAL_PRESETS = [
  // Bagmati Province
  { name: "Kathmandu", nepali: "काठमाडौँ", province: "Bagmati", lat: 27.7172, lon: 85.3240, elev: 1400 },
  { name: "Lalitpur (Patan)", nepali: "ललितपुर", province: "Bagmati", lat: 27.6670, lon: 85.3200, elev: 1330 },
  { name: "Bhaktapur", nepali: "भक्तपुर", province: "Bagmati", lat: 27.6710, lon: 85.4298, elev: 1401 },
  { name: "Bharatpur (Chitwan)", nepali: "भरतपुर", province: "Bagmati", lat: 27.6833, lon: 84.4333, elev: 208 },
  { name: "Hetauda", nepali: "हेटौँडा", province: "Bagmati", lat: 27.4285, lon: 85.0333, elev: 445 },
  
  // Gandaki Province
  { name: "Pokhara", nepali: "पोखरा", province: "Gandaki", lat: 28.2096, lon: 83.9856, elev: 822 },
  { name: "Gorkha", nepali: "गोरखा", province: "Gandaki", lat: 28.0055, lon: 84.6297, elev: 1143 },
  { name: "Baglung", nepali: "बागलुङ", province: "Gandaki", lat: 28.2719, lon: 83.5936, elev: 1020 },
  
  // Koshi Province
  { name: "Biratnagar", nepali: "विराटनगर", province: "Koshi", lat: 26.4525, lon: 87.2718, elev: 80 },
  { name: "Dharan", nepali: "धरान", province: "Koshi", lat: 26.8124, lon: 87.2835, elev: 349 },
  { name: "Itahari", nepali: "इटहरी", province: "Koshi", lat: 26.6632, lon: 87.2774, elev: 140 },
  { name: "Ilam", nepali: "इलाम", province: "Koshi", lat: 26.9089, lon: 87.9272, elev: 1208 },

  // Madhesh Province
  { name: "Birgunj", nepali: "वीरगञ्ज", province: "Madhesh", lat: 27.0137, lon: 84.8774, elev: 80 },
  { name: "Janakpur", nepali: "जनकपुर", province: "Madhesh", lat: 26.7288, lon: 85.9244, elev: 70 },
  { name: "Rajbiraj", nepali: "राजविराज", province: "Madhesh", lat: 26.5414, lon: 86.7533, elev: 76 },

  // Lumbini Province
  { name: "Butwal", nepali: "बुटवल", province: "Lumbini", lat: 27.7006, lon: 83.4484, elev: 213 },
  { name: "Lumbini (Bhairahawa)", nepali: "लुम्बिनी", province: "Lumbini", lat: 27.5045, lon: 83.4500, elev: 105 },
  { name: "Nepalgunj", nepali: "नेपालगञ्ज", province: "Lumbini", lat: 28.0500, lon: 81.6167, elev: 150 },
  { name: "Tansen (Palpa)", nepali: "तानसेन", province: "Lumbini", lat: 27.8673, lon: 83.5484, elev: 1350 },

  // Karnali Province
  { name: "Surkhet (Birendranagar)", nepali: "सुर्खेत", province: "Karnali", lat: 28.6019, lon: 81.6339, elev: 600 },
  { name: "Jumla", nepali: "जुम्ला", province: "Karnali", lat: 29.2747, lon: 82.1838, elev: 2370 },
  { name: "Rara (Mugu)", nepali: "रारा ताल", province: "Karnali", lat: 29.5372, lon: 82.0833, elev: 2990 },

  // Sudurpashchim Province
  { name: "Dhangadhi", nepali: "धनगढी", province: "Sudurpashchim", lat: 28.6944, lon: 80.5906, elev: 109 },
  { name: "Mahendranagar", nepali: "महेन्द्रनगर", province: "Sudurpashchim", lat: 28.9642, lon: 80.1802, elev: 198 },
  { name: "Dadeldhura", nepali: "डडेलधुरा", province: "Sudurpashchim", lat: 29.2988, lon: 80.5847, elev: 1745 },

  // High Himalayas & Trekking Zones
  { name: "Namche Bazaar (Everest)", nepali: "नाम्चे बजार", province: "Himalayas", lat: 27.8069, lon: 86.7140, elev: 3440 },
  { name: "Jomsom (Mustang)", nepali: "जोमसोम", province: "Himalayas", lat: 28.7833, lon: 83.7333, elev: 2743 },
  { name: "Lukla", nepali: "लुक्ला", province: "Himalayas", lat: 27.6869, lon: 86.7290, elev: 2860 },
  { name: "Manang", nepali: "मनाङ", province: "Himalayas", lat: 28.6600, lon: 84.0200, elev: 3519 }
];

// ==========================================
// 2. WMO WEATHER CODE MAPPINGS
// ==========================================
const WMO_CODES = {
  0: { label: "Clear Sky", iconDay: "fa-solid fa-sun", iconNight: "fa-solid fa-moon", theme: "theme-clear-day" },
  1: { label: "Mainly Clear", iconDay: "fa-solid fa-cloud-sun", iconNight: "fa-solid fa-cloud-moon", theme: "theme-clear-day" },
  2: { label: "Partly Cloudy", iconDay: "fa-solid fa-cloud-sun", iconNight: "fa-solid fa-cloud-moon", theme: "theme-clouds" },
  3: { label: "Overcast", iconDay: "fa-solid fa-cloud", iconNight: "fa-solid fa-cloud", theme: "theme-clouds" },
  45: { label: "Foggy / Mist", iconDay: "fa-solid fa-smog", iconNight: "fa-solid fa-smog", theme: "theme-clouds" },
  48: { label: "Depositing Rime Fog", iconDay: "fa-solid fa-smog", iconNight: "fa-solid fa-smog", theme: "theme-clouds" },
  51: { label: "Light Drizzle", iconDay: "fa-solid fa-cloud-rain", iconNight: "fa-solid fa-cloud-rain", theme: "theme-rain" },
  53: { label: "Moderate Drizzle", iconDay: "fa-solid fa-cloud-rain", iconNight: "fa-solid fa-cloud-rain", theme: "theme-rain" },
  55: { label: "Dense Drizzle", iconDay: "fa-solid fa-cloud-rain", iconNight: "fa-solid fa-cloud-rain", theme: "theme-rain" },
  61: { label: "Slight Rain", iconDay: "fa-solid fa-cloud-sun-rain", iconNight: "fa-solid fa-cloud-moon-rain", theme: "theme-rain" },
  63: { label: "Moderate Rain", iconDay: "fa-solid fa-cloud-showers-heavy", iconNight: "fa-solid fa-cloud-showers-heavy", theme: "theme-rain" },
  65: { label: "Heavy Rain", iconDay: "fa-solid fa-cloud-showers-heavy", iconNight: "fa-solid fa-cloud-showers-heavy", theme: "theme-rain" },
  71: { label: "Slight Snow", iconDay: "fa-regular fa-snowflake", iconNight: "fa-regular fa-snowflake", theme: "theme-snow" },
  73: { label: "Moderate Snow", iconDay: "fa-solid fa-snowflake", iconNight: "fa-solid fa-snowflake", theme: "theme-snow" },
  75: { label: "Heavy Snowfall", iconDay: "fa-solid fa-snowflake", iconNight: "fa-solid fa-snowflake", theme: "theme-snow" },
  77: { label: "Snow Grains", iconDay: "fa-solid fa-snowflake", iconNight: "fa-solid fa-snowflake", theme: "theme-snow" },
  80: { label: "Light Rain Showers", iconDay: "fa-solid fa-cloud-sun-rain", iconNight: "fa-solid fa-cloud-moon-rain", theme: "theme-rain" },
  81: { label: "Moderate Showers", iconDay: "fa-solid fa-cloud-showers-heavy", iconNight: "fa-solid fa-cloud-showers-heavy", theme: "theme-rain" },
  82: { label: "Violent Showers", iconDay: "fa-solid fa-cloud-showers-heavy", iconNight: "fa-solid fa-cloud-showers-heavy", theme: "theme-rain" },
  85: { label: "Slight Snow Showers", iconDay: "fa-solid fa-snowflake", iconNight: "fa-solid fa-snowflake", theme: "theme-snow" },
  86: { label: "Heavy Snow Showers", iconDay: "fa-solid fa-snowflake", iconNight: "fa-solid fa-snowflake", theme: "theme-snow" },
  95: { label: "Thunderstorm", iconDay: "fa-solid fa-bolt-lightning", iconNight: "fa-solid fa-bolt-lightning", theme: "theme-thunder" },
  96: { label: "Thunderstorm with Hail", iconDay: "fa-solid fa-cloud-bolt", iconNight: "fa-solid fa-cloud-bolt", theme: "theme-thunder" },
  99: { label: "Heavy Thunderstorm", iconDay: "fa-solid fa-cloud-bolt", iconNight: "fa-solid fa-cloud-bolt", theme: "theme-thunder" }
};

// ==========================================
// 3. APPLICATION STATE
// ==========================================
const state = {
  currentUnit: 'C', // 'C' or 'F'
  currentLocation: {
    name: "Kathmandu",
    nepali: "काठमाडौँ",
    region: "Bagmati Province, Nepal",
    lat: 27.7172,
    lon: 85.3240,
    elev: 1400
  },
  weatherData: null,
  activeProvince: 'all',
  searchDebounceTimer: null
};

// ==========================================
// 4. DOM ELEMENTS
// ==========================================
const DOM = {
  searchInput: document.getElementById('city-search-input'),
  searchDropdown: document.getElementById('search-dropdown'),
  clearSearchBtn: document.getElementById('clear-search-btn'),
  searchSpinner: document.getElementById('search-spinner'),
  geoBtn: document.getElementById('geo-location-btn'),
  unitToggle: document.getElementById('unit-toggle'),
  unitBtns: document.querySelectorAll('.unit-btn'),
  provinceFilters: document.getElementById('province-filters'),
  citiesChipList: document.getElementById('cities-chip-list'),
  loadingOverlay: document.getElementById('loading-overlay'),
  errorBanner: document.getElementById('error-banner'),
  errorMessage: document.getElementById('error-message'),
  errorCloseBtn: document.getElementById('error-close-btn'),
  
  // Hero section
  currentCityName: document.getElementById('current-city-name'),
  currentRegionName: document.getElementById('current-region-name'),
  currentTimeStr: document.getElementById('current-time-str'),
  currentElevationStr: document.getElementById('current-elevation-str'),
  namasteText: document.getElementById('namaste-text'),
  greetingSub: document.getElementById('greeting-sub'),
  heroTemp: document.getElementById('hero-temp'),
  heroUnit: document.getElementById('hero-unit'),
  conditionTitle: document.getElementById('condition-title'),
  feelsLikeTemp: document.getElementById('feels-like-temp'),
  todayMaxTemp: document.getElementById('today-max-temp'),
  todayMinTemp: document.getElementById('today-min-temp'),
  heroWeatherIcon: document.getElementById('hero-weather-icon'),
  
  // Hero Quick Indicators
  quickRain: document.getElementById('quick-rain'),
  quickWind: document.getElementById('quick-wind'),
  quickUv: document.getElementById('quick-uv'),
  quickHumidity: document.getElementById('quick-humidity'),
  
  // Forecasts
  hourlyList: document.getElementById('hourly-forecast-list'),
  dailyList: document.getElementById('daily-forecast-list'),
  
  // Environmental Metrics
  metricHumidity: document.getElementById('metric-humidity'),
  humidityHint: document.getElementById('humidity-hint'),
  metricWind: document.getElementById('metric-wind'),
  windDirHint: document.getElementById('wind-dir-hint'),
  metricSunrise: document.getElementById('metric-sunrise'),
  metricSunset: document.getElementById('metric-sunset'),
  sunProgressMarker: document.getElementById('sun-progress-marker'),
  metricPressure: document.getElementById('metric-pressure'),
  metricUv: document.getElementById('metric-uv'),
  uvBadge: document.getElementById('uv-badge'),
  uvHint: document.getElementById('uv-hint')
};

// ==========================================
// 5. HELPER FUNCTIONS
// ==========================================

/**
 * Format Celsius temperature to active unit (°C or °F)
 */
function formatTemp(celsius, includeUnit = false) {
  if (celsius === undefined || celsius === null) return "--";
  let temp = celsius;
  if (state.currentUnit === 'F') {
    temp = (celsius * 9/5) + 32;
  }
  const rounded = Math.round(temp);
  return includeUnit ? `${rounded}°${state.currentUnit}` : `${rounded}`;
}

/**
 * Convert wind degrees to cardinal direction
 */
function getWindDirection(deg) {
  if (deg === undefined || deg === null) return "N";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

/**
 * Get weather icon and label from WMO code
 */
function getWeatherMeta(code, isDay = 1) {
  const defaultMeta = { label: "Clear Sky", iconDay: "fa-solid fa-sun", iconNight: "fa-solid fa-moon", theme: "theme-clear-day" };
  const meta = WMO_CODES[code] || defaultMeta;
  const icon = (isDay === 1) ? meta.iconDay : meta.iconNight;
  const theme = (isDay === 1) ? meta.theme : (meta.theme === 'theme-clear-day' ? 'theme-clear-night' : meta.theme);
  return {
    label: meta.label,
    icon: icon,
    theme: theme
  };
}

/**
 * Get Nepali greeting based on local hour
 */
function getNepaliGreeting(hour) {
  if (hour >= 5 && hour < 12) {
    return { main: "शुभ बिहानी!", sub: "Good Morning (शुभ बिहानी)" };
  } else if (hour >= 12 && hour < 17) {
    return { main: "नमस्ते!", sub: "Good Afternoon (शुभ दिन)" };
  } else if (hour >= 17 && hour < 21) {
    return { main: "शुभ सन्ध्या!", sub: "Good Evening (शुभ सन्ध्या)" };
  } else {
    return { main: "शुभ रात्रि!", sub: "Good Night (शुभ रात्रि)" };
  }
}

/**
 * Format 24h ISO string to 12h readable time
 */
function formatTime12h(isoString) {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Get day name & formatted date
 */
function formatDayAndDate(isoDateStr, index) {
  const date = new Date(isoDateStr);
  if (index === 0) return { day: "Today", date: "Now" };
  if (index === 1) return { day: "Tomorrow", date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
  
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { day: dayName, date: dateFormatted };
}

/**
 * Calculate UV index classification
 */
function getUVInfo(uv) {
  if (uv <= 2) return { text: "Low", class: "low", hint: "Safe outdoors without special sunscreen" };
  if (uv <= 5) return { text: "Moderate", class: "moderate", hint: "Wear sunglasses & hat during midday" };
  if (uv <= 7) return { text: "High", class: "high", hint: "Seek shade & apply SPF 30+ sunscreen" };
  if (uv <= 10) return { text: "Very High", class: "very-high", hint: "Avoid direct mountain sun exposure" };
  return { text: "Extreme", class: "very-high", hint: "Take extra precautions under intense sun" };
}

// ==========================================
// 6. WEATHER API FETCHING
// ==========================================

/**
 * Fetch comprehensive weather forecast from Open-Meteo
 */
async function fetchWeatherData(lat, lon) {
  showLoading(true);
  hideError();
  
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    state.weatherData = data;
    
    // Save elevation if returned and not already specified
    if (data.elevation && !state.currentLocation.elev) {
      state.currentLocation.elev = Math.round(data.elevation);
    }
    
    renderAll();
  } catch (error) {
    console.error("Failed to load weather:", error);
    showError("Could not connect to weather service. Please check your internet connection or try again.");
  } finally {
    showLoading(false);
  }
}

// ==========================================
// 7. UI RENDERING FUNCTIONS
// ==========================================

function renderAll() {
  if (!state.weatherData) return;
  renderHeroCard();
  renderHourlyForecast();
  renderDailyForecast();
  renderMetrics();
  updateCityChipsSelection();
}

/**
 * Render Main Hero Card
 */
function renderHeroCard() {
  const { current, daily } = state.weatherData;
  const isDay = current.is_day;
  const weatherMeta = getWeatherMeta(current.weather_code, isDay);
  
  // Dynamic body background theme
  document.body.className = weatherMeta.theme;
  
  // Location info
  DOM.currentCityName.textContent = state.currentLocation.name;
  DOM.currentRegionName.textContent = state.currentLocation.region || `${state.currentLocation.province || 'Nepal'}`;
  
  // Time and Elevation
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  DOM.currentTimeStr.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeFormatted}`;
  
  const elev = state.currentLocation.elev || Math.round(state.weatherData.elevation || 1400);
  DOM.currentElevationStr.innerHTML = `<i class="fa-solid fa-mountain"></i> Elev: ${elev.toLocaleString()}m`;
  
  // Nepali Greeting
  const greeting = getNepaliGreeting(now.getHours());
  DOM.namasteText.textContent = state.currentLocation.nepali ? `${state.currentLocation.nepali}` : greeting.main;
  DOM.greetingSub.textContent = greeting.sub;
  
  // Temperature and Condition
  DOM.heroTemp.textContent = formatTemp(current.temperature_2m);
  DOM.heroUnit.textContent = `°${state.currentUnit}`;
  DOM.conditionTitle.textContent = weatherMeta.label;
  DOM.feelsLikeTemp.textContent = `${formatTemp(current.apparent_temperature)}°${state.currentUnit}`;
  
  if (daily && daily.temperature_2m_max && daily.temperature_2m_min) {
    DOM.todayMaxTemp.textContent = `${formatTemp(daily.temperature_2m_max[0])}°`;
    DOM.todayMinTemp.textContent = `${formatTemp(daily.temperature_2m_min[0])}°`;
  }
  
  // Icon
  DOM.heroWeatherIcon.className = `weather-hero-icon ${weatherMeta.icon}`;
  
  // Quick indicators
  const rainProb = (daily && daily.precipitation_probability_max) ? `${daily.precipitation_probability_max[0]}%` : `${current.precipitation || 0}%`;
  DOM.quickRain.textContent = rainProb;
  DOM.quickWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  
  const uvMax = (daily && daily.uv_index_max) ? daily.uv_index_max[0] : '--';
  DOM.quickUv.textContent = uvMax;
  DOM.quickHumidity.textContent = `${current.relative_humidity_2m}%`;
}

/**
 * Render 24-Hour Forecast Timeline
 */
function renderHourlyForecast() {
  const { hourly } = state.weatherData;
  if (!hourly) return;
  
  DOM.hourlyList.innerHTML = '';
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Display next 24 hourly points starting from current hour
  for (let i = currentHour; i < currentHour + 24 && i < hourly.time.length; i++) {
    const timeStr = hourly.time[i];
    const hourDate = new Date(timeStr);
    const hourFormatted = (i === currentHour) ? "Now" : hourDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    
    const temp = hourly.temperature_2m[i];
    const code = hourly.weather_code[i];
    const isDay = hourly.is_day[i];
    const rainProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
    
    const meta = getWeatherMeta(code, isDay);
    
    const item = document.createElement('div');
    item.className = `hourly-item ${i === currentHour ? 'active' : ''}`;
    item.innerHTML = `
      <span class="hourly-time">${hourFormatted}</span>
      <i class="hourly-icon ${meta.icon}"></i>
      <span class="hourly-temp">${formatTemp(temp)}°</span>
      <span class="hourly-rain" title="Precipitation Probability">
        <i class="fa-solid fa-droplet"></i> ${rainProb}%
      </span>
    `;
    DOM.hourlyList.appendChild(item);
  }
}

/**
 * Render 7-Day Forecast Rows
 */
function renderDailyForecast() {
  const { daily } = state.weatherData;
  if (!daily) return;
  
  DOM.dailyList.innerHTML = '';
  
  const count = Math.min(daily.time.length, 7);
  
  for (let i = 0; i < count; i++) {
    const timeStr = daily.time[i];
    const { day, date } = formatDayAndDate(timeStr, i);
    const code = daily.weather_code[i];
    const meta = getWeatherMeta(code, 1);
    
    const minTemp = daily.temperature_2m_min[i];
    const maxTemp = daily.temperature_2m_max[i];
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
    
    const row = document.createElement('div');
    row.className = 'daily-row';
    row.innerHTML = `
      <div class="daily-day-info">
        <span class="daily-day-name">${day}</span>
        <span class="daily-day-date">${date}</span>
      </div>
      <div class="daily-icon-box">
        <i class="${meta.icon}"></i>
      </div>
      <div class="daily-condition-label">
        ${meta.label}
        ${rainProb > 20 ? `<span class="daily-rain-chance"> • <i class="fa-solid fa-droplet"></i> ${rainProb}%</span>` : ''}
      </div>
      <div class="daily-temp-bar-wrap">
        <span class="daily-temp-min">${formatTemp(minTemp)}°</span>
        <span>/</span>
        <span class="daily-temp-max">${formatTemp(maxTemp)}°</span>
      </div>
    `;
    DOM.dailyList.appendChild(row);
  }
}

/**
 * Render Environmental Metrics Grid
 */
function renderMetrics() {
  const { current, daily } = state.weatherData;
  
  // Humidity
  DOM.metricHumidity.textContent = `${current.relative_humidity_2m}%`;
  if (current.relative_humidity_2m < 35) {
    DOM.humidityHint.textContent = "Dry air, keep hydrated";
  } else if (current.relative_humidity_2m > 75) {
    DOM.humidityHint.textContent = "High humidity / muggy";
  } else {
    DOM.humidityHint.textContent = "Comfortable humidity";
  }
  
  // Wind
  DOM.metricWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
  const windDir = getWindDirection(current.wind_direction_10m);
  DOM.windDirHint.innerHTML = `<i class="fa-solid fa-compass"></i> Direction: ${windDir} (${current.wind_direction_10m}°)`;
  
  // Sun Schedule & Daylight Marker
  if (daily && daily.sunrise && daily.sunset) {
    const sunriseStr = daily.sunrise[0];
    const sunsetStr = daily.sunset[0];
    DOM.metricSunrise.textContent = formatTime12h(sunriseStr);
    DOM.metricSunset.textContent = formatTime12h(sunsetStr);
    
    // Calculate daylight marker position
    const sunriseTime = new Date(sunriseStr).getTime();
    const sunsetTime = new Date(sunsetStr).getTime();
    const currentTime = new Date().getTime();
    
    if (currentTime < sunriseTime) {
      DOM.sunProgressMarker.style.left = '5%';
    } else if (currentTime > sunsetTime) {
      DOM.sunProgressMarker.style.left = '95%';
    } else {
      const percentage = ((currentTime - sunriseTime) / (sunsetTime - sunriseTime)) * 100;
      DOM.sunProgressMarker.style.left = `${Math.min(Math.max(percentage, 5), 95)}%`;
    }
  }
  
  // Pressure
  DOM.metricPressure.textContent = `${Math.round(current.surface_pressure)} hPa`;
  
  // UV Index
  if (daily && daily.uv_index_max) {
    const uvVal = Math.round(daily.uv_index_max[0]);
    DOM.metricUv.textContent = uvVal;
    const uvInfo = getUVInfo(uvVal);
    DOM.uvBadge.textContent = uvInfo.text;
    DOM.uvBadge.className = `uv-level-badge ${uvInfo.class}`;
    DOM.uvHint.textContent = uvInfo.hint;
  }
}

// ==========================================
// 8. PROVINCE & CITY CHIPS MANAGER
// ==========================================

function populateCityChips(province = 'all') {
  DOM.citiesChipList.innerHTML = '';
  
  const filtered = (province === 'all') 
    ? NEPAL_PRESETS 
    : NEPAL_PRESETS.filter(c => c.province.toLowerCase() === province.toLowerCase());
  
  filtered.forEach(city => {
    const chip = document.createElement('button');
    chip.className = `city-chip ${city.name.toLowerCase() === state.currentLocation.name.toLowerCase() ? 'active' : ''}`;
    chip.innerHTML = `
      <span>${city.name}</span>
      <span class="chip-temp">${city.nepali || ''}</span>
    `;
    chip.addEventListener('click', () => {
      selectLocation({
        name: city.name,
        nepali: city.nepali,
        region: `${city.province} Province, Nepal`,
        lat: city.lat,
        lon: city.lon,
        elev: city.elev
      });
    });
    DOM.citiesChipList.appendChild(chip);
  });
}

function updateCityChipsSelection() {
  const chips = DOM.citiesChipList.querySelectorAll('.city-chip');
  chips.forEach(chip => {
    const chipName = chip.querySelector('span').textContent.toLowerCase();
    if (chipName === state.currentLocation.name.toLowerCase()) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

function selectLocation(loc) {
  state.currentLocation = loc;
  saveLastLocation(loc);
  fetchWeatherData(loc.lat, loc.lon);
  closeSearchDropdown();
}

// ==========================================
// 9. SEARCH & AUTOCOMPLETE LOGIC
// ==========================================

function setupSearch() {
  DOM.searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (query.length > 0) {
      DOM.clearSearchBtn.classList.remove('hidden');
    } else {
      DOM.clearSearchBtn.classList.add('hidden');
      closeSearchDropdown();
      return;
    }
    
    clearTimeout(state.searchDebounceTimer);
    state.searchDebounceTimer = setTimeout(() => {
      handleSearchQuery(query);
    }, 280);
  });
  
  DOM.clearSearchBtn.addEventListener('click', () => {
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    closeSearchDropdown();
    DOM.searchInput.focus();
  });
  
  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!DOM.searchInput.contains(e.target) && !DOM.searchDropdown.contains(e.target)) {
      closeSearchDropdown();
    }
  });
}

async function handleSearchQuery(query) {
  DOM.searchSpinner.classList.remove('hidden');
  
  // 1. Search local preset database first
  const queryLower = query.toLowerCase();
  const localMatches = NEPAL_PRESETS.filter(c => 
    c.name.toLowerCase().includes(queryLower) || 
    (c.nepali && c.nepali.includes(query)) ||
    c.province.toLowerCase().includes(queryLower)
  );
  
  // 2. Fetch from Geocoding API
  let apiResults = [];
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const res = await fetch(geoUrl);
    if (res.ok) {
      const data = await res.json();
      apiResults = data.results || [];
    }
  } catch (err) {
    console.warn("Geocoding lookup error:", err);
  } finally {
    DOM.searchSpinner.classList.add('hidden');
  }
  
  renderSearchResults(localMatches, apiResults);
}

function renderSearchResults(localMatches, apiResults) {
  DOM.searchDropdown.innerHTML = '';
  
  // Combine local matches and API results (avoid duplicate names)
  const combined = [];
  const addedKeys = new Set();
  
  localMatches.forEach(item => {
    const key = `${item.name.toLowerCase()}-${item.province.toLowerCase()}`;
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      combined.push({
        name: item.name,
        nepali: item.nepali,
        admin: `${item.province} Province, Nepal`,
        lat: item.lat,
        lon: item.lon,
        elev: item.elev,
        isLocal: true,
        country: "Nepal",
        countryCode: "NP"
      });
    }
  });
  
  apiResults.forEach(item => {
    const key = `${item.name.toLowerCase()}-${(item.admin1 || '').toLowerCase()}`;
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      combined.push({
        name: item.name,
        nepali: '',
        admin: [item.admin1, item.country].filter(Boolean).join(', '),
        lat: item.latitude,
        lon: item.longitude,
        elev: item.elevation ? Math.round(item.elevation) : null,
        isLocal: false,
        country: item.country || "Nepal",
        countryCode: item.country_code || "NP"
      });
    }
  });
  
  if (combined.length === 0) {
    DOM.searchDropdown.innerHTML = `
      <div class="search-no-result">
        <i class="fa-solid fa-location-crosshairs"></i> No locations found for your search.
      </div>
    `;
    DOM.searchDropdown.classList.remove('hidden');
    return;
  }
  
  combined.slice(0, 8).forEach(loc => {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    
    const isNepal = loc.country === 'Nepal' || loc.countryCode === 'NP';
    const flag = isNepal ? '🇳🇵' : '🌍';
    
    div.innerHTML = `
      <div>
        <span class="item-title">
          <span class="nepal-flag">${flag}</span>
          ${loc.name} ${loc.nepali ? `(${loc.nepali})` : ''}
        </span>
        <span class="item-admin">${loc.admin}</span>
      </div>
      ${loc.elev ? `<span style="font-size:0.75rem; color:var(--text-faint);">${loc.elev}m</span>` : ''}
    `;
    
    div.addEventListener('click', () => {
      selectLocation({
        name: loc.name,
        nepali: loc.nepali,
        region: loc.admin,
        lat: loc.lat,
        lon: loc.lon,
        elev: loc.elev
      });
      DOM.searchInput.value = loc.name;
    });
    
    DOM.searchDropdown.appendChild(div);
  });
  
  DOM.searchDropdown.classList.remove('hidden');
}

function closeSearchDropdown() {
  DOM.searchDropdown.classList.add('hidden');
}

// ==========================================
// 10. GPS GEOLOCATION HANDLER
// ==========================================

function setupGeolocation() {
  DOM.geoBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser.");
      return;
    }
    
    showLoading(true);
    DOM.geoBtn.classList.add('active');
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        
        let detectedName = "My Location";
        let detectedRegion = "Nepal";
        
        // Reverse geocode via Open-Meteo or fallback
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=Nepal&count=1`);
          // Use closest city or coordinate display
          detectedName = `Lat: ${lat.toFixed(2)}°, Lon: ${lon.toFixed(2)}°`;
        } catch (e) {
          // ignore
        }
        
        selectLocation({
          name: detectedName,
          nepali: "मेरो स्थान",
          region: "Current GPS Location",
          lat: lat,
          lon: lon,
          elev: null
        });
        DOM.geoBtn.classList.remove('active');
      },
      (err) => {
        showLoading(false);
        DOM.geoBtn.classList.remove('active');
        showError("Unable to retrieve your location. Please check browser permissions or select a city.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
}

// ==========================================
// 11. TEMPERATURE UNIT TOGGLE
// ==========================================

function setupUnitToggle() {
  DOM.unitBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedUnit = btn.dataset.unit;
      if (state.currentUnit === selectedUnit) return;
      
      state.currentUnit = selectedUnit;
      
      DOM.unitBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update UI without refetching API
      renderAll();
    });
  });
}

// ==========================================
// 12. PROVINCE FILTERS HANDLER
// ==========================================

function setupProvinceFilters() {
  const buttons = DOM.provinceFilters.querySelectorAll('.pill-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const province = btn.dataset.province;
      state.activeProvince = province;
      populateCityChips(province);
    });
  });
}

// ==========================================
// 13. ERROR & LOADING STATE HELPERS
// ==========================================

function showLoading(show) {
  if (show) {
    DOM.loadingOverlay.classList.remove('hidden');
  } else {
    DOM.loadingOverlay.classList.add('hidden');
  }
}

function showError(msg) {
  DOM.errorMessage.textContent = msg;
  DOM.errorBanner.classList.remove('hidden');
}

function hideError() {
  DOM.errorBanner.classList.add('hidden');
}

// ==========================================
// 14. LOCAL STORAGE PERSISTENCE
// ==========================================

function saveLastLocation(loc) {
  try {
    localStorage.setItem('mausam_nepal_location', JSON.stringify(loc));
  } catch (e) {
    // Ignore storage issues
  }
}

function loadLastLocation() {
  try {
    const saved = localStorage.getItem('mausam_nepal_location');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return null;
}

// ==========================================
// 15. INITIALIZATION
// ==========================================

function initApp() {
  // Setup interactive event listeners
  setupSearch();
  setupGeolocation();
  setupUnitToggle();
  setupProvinceFilters();
  
  if (DOM.errorCloseBtn) {
    DOM.errorCloseBtn.addEventListener('click', hideError);
  }
  
  // Load initial city
  const savedLocation = loadLastLocation();
  if (savedLocation) {
    state.currentLocation = savedLocation;
  }
  
  populateCityChips('all');
  fetchWeatherData(state.currentLocation.lat, state.currentLocation.lon);
}

// Launch on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
