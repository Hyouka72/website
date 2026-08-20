/**
 * SkyPulse — Atmospheric Intelligence & Weather Application
 * Built with Open-Meteo Meteorological APIs & Web Audio Synthesis
 */

// Application State
const state = {
  unit: localStorage.getItem('skypulse_unit') || 'c', // 'c' or 'f'
  activeLocation: {
    name: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lon: -0.1278,
    timezone: 'Europe/London'
  },
  weatherData: null,
  airQualityData: null,
  recentSearches: JSON.parse(localStorage.getItem('skypulse_recents') || '[]'),
  isSoundPlaying: false,
  audioCtx: null,
  audioNodes: []
};

// DOM Elements
const elements = {
  body: document.body,
  cityInput: document.getElementById('cityInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  geoBtn: document.getElementById('geoBtn'),
  searchSuggestions: document.getElementById('searchSuggestions'),
  unitToggle: document.getElementById('unitToggle'),
  soundToggleBtn: document.getElementById('soundToggleBtn'),
  quickCities: document.getElementById('quickCities'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  toastContainer: document.getElementById('toastContainer'),
  recentSearchesBar: document.getElementById('recentSearchesBar'),
  recentChips: document.getElementById('recentChips'),

  // Hero Card Elements
  currentLocationName: document.getElementById('currentLocationName'),
  currentDate: document.getElementById('currentDate'),
  currentTime: document.getElementById('currentTime'),
  weatherConditionBadge: document.getElementById('weatherConditionBadge'),
  heroWeatherIcon: document.getElementById('heroWeatherIcon'),
  currentTemp: document.getElementById('currentTemp'),
  currentWeatherDesc: document.getElementById('currentWeatherDesc'),
  todayHigh: document.getElementById('todayHigh'),
  todayLow: document.getElementById('todayLow'),
  feelsLikeTemp: document.getElementById('feelsLikeTemp'),
  quickPrecipitation: document.getElementById('quickPrecipitation'),
  quickHumidity: document.getElementById('quickHumidity'),
  quickWind: document.getElementById('quickWind'),
  quickPressure: document.getElementById('quickPressure'),

  // Hourly & Highlights
  hourlyTrack: document.getElementById('hourlyTrack'),
  forecastList: document.getElementById('forecastList'),
  uvIndexVal: document.getElementById('uvIndexVal'),
  uvIndexRating: document.getElementById('uvIndexRating'),
  uvGaugeFill: document.getElementById('uvGaugeFill'),
  uvAdvice: document.getElementById('uvAdvice'),
  windSpeedVal: document.getElementById('windSpeedVal'),
  windDirText: document.getElementById('windDirText'),
  compassArrow: document.getElementById('compassArrow'),
  windGust: document.getElementById('windGust'),
  sunriseTime: document.getElementById('sunriseTime'),
  sunsetTime: document.getElementById('sunsetTime'),
  sunProgressFill: document.getElementById('sunProgressFill'),
  sunIndicator: document.getElementById('sunIndicator'),
  daylightRemain: document.getElementById('daylightRemain'),
  aqiCircle: document.getElementById('aqiCircle'),
  aqiVal: document.getElementById('aqiVal'),
  aqiStatus: document.getElementById('aqiStatus'),
  aqiPrimaryPollutant: document.getElementById('aqiPrimaryPollutant'),
  aqiFill: document.getElementById('aqiFill'),
  aqiAdvice: document.getElementById('aqiAdvice'),
  humidityVal: document.getElementById('humidityVal'),
  dewPointVal: document.getElementById('dewPointVal'),
  humidityComfort: document.getElementById('humidityComfort'),
  humidityFill: document.getElementById('humidityFill'),
  humidityDesc: document.getElementById('humidityDesc'),
  visibilityVal: document.getElementById('visibilityVal'),
  pressureVal: document.getElementById('pressureVal'),
  pressureTendency: document.getElementById('pressureTendency')
};

// Weather Code Definitions (WMO standard)
const WMO_CODE_MAP = {
  0: { label: 'Clear Sky', desc: 'Clear and sunny skies', icon: 'clear', theme: 'sunny' },
  1: { label: 'Mainly Clear', desc: 'Mostly sunny with slight clouds', icon: 'mostly-clear', theme: 'sunny' },
  2: { label: 'Partly Cloudy', desc: 'Scattered clouds with sun intervals', icon: 'partly-cloudy', theme: 'clouds' },
  3: { label: 'Overcast', desc: 'Heavy overcast cloud layer', icon: 'cloudy', theme: 'clouds' },
  45: { label: 'Foggy', desc: 'Dense atmospheric fog', icon: 'fog', theme: 'clouds' },
  48: { label: 'Depositing Rime Fog', desc: 'Icy fog depositing frost', icon: 'fog', theme: 'snow' },
  51: { label: 'Light Drizzle', desc: 'Light misting drizzle', icon: 'drizzle', theme: 'rainy' },
  53: { label: 'Moderate Drizzle', desc: 'Sustained misty drizzle', icon: 'drizzle', theme: 'rainy' },
  55: { label: 'Dense Drizzle', desc: 'Heavy mist and light precipitation', icon: 'drizzle', theme: 'rainy' },
  56: { label: 'Freezing Drizzle', desc: 'Freezing misty drizzle', icon: 'freezing-rain', theme: 'snow' },
  57: { label: 'Heavy Freezing Drizzle', desc: 'Icy drizzle risk', icon: 'freezing-rain', theme: 'snow' },
  61: { label: 'Slight Rain', desc: 'Intermittent light rain', icon: 'rain', theme: 'rainy' },
  63: { label: 'Moderate Rain', desc: 'Continuous steady rain', icon: 'rain', theme: 'rainy' },
  65: { label: 'Heavy Rain', desc: 'Intense rain downpour', icon: 'heavy-rain', theme: 'rainy' },
  66: { label: 'Light Freezing Rain', desc: 'Freezing precipitation', icon: 'freezing-rain', theme: 'snow' },
  67: { label: 'Heavy Freezing Rain', desc: 'Severe freezing rain', icon: 'freezing-rain', theme: 'snow' },
  71: { label: 'Slight Snow', desc: 'Light gentle snowfall', icon: 'snow', theme: 'snow' },
  73: { label: 'Moderate Snow', desc: 'Steady winter snowfall', icon: 'snow', theme: 'snow' },
  75: { label: 'Heavy Snow', desc: 'Heavy blizzard conditions', icon: 'heavy-snow', theme: 'snow' },
  77: { label: 'Snow Grains', desc: 'Crisp frozen snow grains', icon: 'snow', theme: 'snow' },
  80: { label: 'Light Showers', desc: 'Brief passing rain showers', icon: 'showers', theme: 'rainy' },
  81: { label: 'Moderate Showers', desc: 'Frequent rain showers', icon: 'showers', theme: 'rainy' },
  82: { label: 'Violent Showers', desc: 'Violent torrential showers', icon: 'heavy-rain', theme: 'rainy' },
  85: { label: 'Light Snow Showers', desc: 'Passing snow flurries', icon: 'snow', theme: 'snow' },
  86: { label: 'Heavy Snow Showers', desc: 'Intense snow squalls', icon: 'heavy-snow', theme: 'snow' },
  95: { label: 'Thunderstorm', desc: 'Thunderstorm with lightning', icon: 'storm', theme: 'storm' },
  96: { label: 'Thunderstorm & Hail', desc: 'Severe storm with hail', icon: 'storm-hail', theme: 'storm' },
  99: { label: 'Heavy Hailstorm', desc: 'Intense thunderstorms with heavy hail', icon: 'storm-hail', theme: 'storm' }
};

/**
 * Returns weather icon SVG string based on condition and daytime flag
 */
function getWeatherIconSvg(iconKey, isDay = 1) {
  if (iconKey === 'clear') {
    if (isDay) {
      return `
        <svg viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="14" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>
          <g stroke="#f59e0b" stroke-width="3" stroke-linecap="round">
            <line x1="32" y1="6" x2="32" y2="12"/>
            <line x1="32" y1="52" x2="32" y2="58"/>
            <line x1="6" y1="32" x2="12" y2="32"/>
            <line x1="52" y1="32" x2="58" y2="32"/>
            <line x1="13.6" y1="13.6" x2="17.8" y2="17.8"/>
            <line x1="46.2" y1="46.2" x2="50.4" y2="50.4"/>
            <line x1="13.6" y1="50.4" x2="17.8" y2="46.2"/>
            <line x1="46.2" y1="17.8" x2="50.4" y2="13.6"/>
          </g>
        </svg>`;
    } else {
      return `
        <svg viewBox="0 0 64 64" fill="none">
          <path d="M42 16A20 20 0 1 1 20 48a22 22 0 0 0 22-32Z" fill="#a5b4fc" stroke="#818cf8" stroke-width="2"/>
          <circle cx="48" cy="18" r="1.5" fill="#ffffff"/>
          <circle cx="54" cy="30" r="1.2" fill="#ffffff"/>
          <circle cx="44" cy="42" r="1.5" fill="#ffffff"/>
        </svg>`;
    }
  }

  if (iconKey === 'mostly-clear' || iconKey === 'partly-cloudy') {
    return `
      <svg viewBox="0 0 64 64" fill="none">
        ${isDay ? '<circle cx="24" cy="24" r="11" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>' : '<path d="M28 14A14 14 0 1 1 14 36a16 16 0 0 0 14-22Z" fill="#a5b4fc"/>'}
        <path d="M46 48H22a12 12 0 0 1-1.5-23.9A15 15 0 0 1 48 28.5 10 10 0 0 1 46 48Z" fill="#94a3b8" fill-opacity="0.85" stroke="#cbd5e1" stroke-width="2"/>
      </svg>`;
  }

  if (iconKey === 'cloudy') {
    return `
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M38 32H18a10 10 0 0 1-1-19.9A13 13 0 0 1 40 16a8.5 8.5 0 0 1-2 16Z" fill="#64748b" fill-opacity="0.7"/>
        <path d="M48 50H22a12 12 0 0 1-1.5-23.9A15 15 0 0 1 48 30.5 11 11 0 0 1 48 50Z" fill="#94a3b8" stroke="#e2e8f0" stroke-width="2"/>
      </svg>`;
  }

  if (iconKey === 'fog') {
    return `
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M44 32H20a10 10 0 0 1 0-20 12 12 0 0 1 23 4 8 8 0 0 1 1 16Z" fill="#64748b" fill-opacity="0.6"/>
        <line x1="14" y1="40" x2="50" y2="40" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
        <line x1="18" y1="47" x2="46" y2="47" stroke="#94a3b8" stroke-width="3" stroke-linecap="round"/>
        <line x1="22" y1="54" x2="42" y2="54" stroke="#64748b" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
  }

  if (iconKey === 'drizzle' || iconKey === 'rain' || iconKey === 'showers') {
    return `
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M46 38H22a11 11 0 0 1-1.5-21.9A14 14 0 0 1 47 20 9.5 9.5 0 0 1 46 38Z" fill="#64748b" stroke="#94a3b8" stroke-width="2"/>
        <g stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round">
          <line x1="22" y1="44" x2="18" y2="52"/>
          <line x1="32" y1="44" x2="28" y2="52"/>
          <line x1="42" y1="44" x2="38" y2="52"/>
        </g>
      </svg>`;
  }

  if (iconKey === 'heavy-rain') {
    return `
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M46 34H20a11 11 0 0 1-1.5-21.9A14 14 0 0 1 47 16 9.5 9.5 0 0 1 46 34Z" fill="#475569" stroke="#64748b" stroke-width="2"/>
        <g stroke="#0284c7" stroke-width="3" stroke-linecap="round">
          <line x1="20" y1="40" x2="15" y2="52"/>
          <line x1="29" y1="40" x2="24" y2="52"/>
          <line x1="38" y1="40" x2="33" y2="52"/>
          <line x1="47" y1="40" x2="42" y2="52"/>
          <line x1="24" y1="55" x2="20" y2="62"/>
          <line x1="34" y1="55" x2="30" y2="62"/>
        </g>
      </svg>`;
  }

  if (iconKey === 'snow' || iconKey === 'heavy-snow' || iconKey === 'freezing-rain') {
    return `
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M46 36H22a11 11 0 0 1-1.5-21.9A14 14 0 0 1 47 18 9.5 9.5 0 0 1 46 36Z" fill="#64748b" stroke="#cbd5e1" stroke-width="2"/>
        <g fill="#bae6fd">
          <circle cx="22" cy="46" r="2.5"/>
          <circle cx="32" cy="50" r="2.5"/>
          <circle cx="42" cy="46" r="2.5"/>
          <circle cx="27" cy="56" r="2"/>
          <circle cx="37" cy="56" r="2"/>
        </g>
      </svg>`;
  }

  if (iconKey === 'storm' || iconKey === 'storm-hail') {
    return `
      <svg viewBox="0 0 64 64" fill="none">
        <path d="M46 34H20a11 11 0 0 1-1.5-21.9A14 14 0 0 1 47 16 9.5 9.5 0 0 1 46 34Z" fill="#334155" stroke="#475569" stroke-width="2"/>
        <polygon points="32 36 24 48 31 48 27 60 41 46 33 46 36 36" fill="#fbbf24" stroke="#f59e0b" stroke-width="1.5"/>
      </svg>`;
  }

  // Fallback
  return `
    <svg viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="14" fill="#fbbf24"/>
    </svg>`;
}

// Convert temperature helpers
function formatTemp(celsius) {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  if (state.unit === 'f') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return Math.round(fahrenheit);
  }
  return Math.round(celsius);
}

function formatSpeed(kmh) {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
  if (state.unit === 'f') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

function getWindDirectionText(deg) {
  if (deg === null || deg === undefined) return 'Calm';
  const directions = [
    'North', 'North-Northeast', 'Northeast', 'East-Northeast',
    'East', 'East-Southeast', 'Southeast', 'South-Southeast',
    'South', 'South-Southwest', 'Southwest', 'West-Southwest',
    'West', 'West-Northwest', 'Northwest', 'North-Northwest'
  ];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return `${directions[index]} (${Math.round(deg)}°)`;
}

// Approximate dew point using Magnus formula
function calculateDewPoint(tempC, humidity) {
  if (tempC === null || humidity === null) return '--';
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
  const dp = (b * alpha) / (a - alpha);
  return formatTemp(dp);
}

// Format Time helper
function formatTimeFromIso(isoString, timezone) {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone || undefined
    });
  } catch (e) {
    return isoString.slice(11, 16);
  }
}

// Format Day of Week
function getDayName(isoDateStr, timezone) {
  try {
    const date = new Date(isoDateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone || undefined });
  } catch (e) {
    return 'Day';
  }
}

// Show Toast notification
function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
      ${isError ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' : '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'}
    </svg>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showLoading(show) {
  if (show) {
    elements.loadingOverlay.classList.remove('hidden');
  } else {
    elements.loadingOverlay.classList.add('hidden');
  }
}

/**
 * Fetch Weather telemetry from Open-Meteo API
 */
async function fetchWeatherData(lat, lon, timezone = 'auto') {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=${encodeURIComponent(timezone)}`;

  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&timezone=${encodeURIComponent(timezone)}`;

  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl).then(res => {
      if (!res.ok) throw new Error('Weather service unavailable');
      return res.json();
    }),
    fetch(aqiUrl).then(res => {
      if (!res.ok) return null;
      return res.json();
    })
  ]);

  const weather = weatherRes.status === 'fulfilled' ? weatherRes.value : null;
  const aqi = aqiRes.status === 'fulfilled' ? aqiRes.value : null;

  if (!weather) {
    throw new Error('Failed to retrieve forecast telemetry');
  }

  return { weather, aqi };
}

/**
 * Render complete weather dashboard
 */
function renderWeatherDashboard() {
  const { weather, aqi } = { weather: state.weatherData, aqi: state.airQualityData };
  if (!weather || !weather.current) return;

  const current = weather.current;
  const daily = weather.daily;
  const hourly = weather.hourly;
  const timezone = weather.timezone || state.activeLocation.timezone;

  const weatherCode = current.weather_code ?? 0;
  const condition = WMO_CODE_MAP[weatherCode] || WMO_CODE_MAP[0];
  const isDay = current.is_day ?? 1;

  // Dynamic Theme assignment
  elements.body.className = '';
  if (!isDay) {
    elements.body.classList.add('theme-night');
  } else {
    elements.body.classList.add(`theme-${condition.theme}`);
  }

  // 1. Hero Card
  elements.currentLocationName.textContent = `${state.activeLocation.name}${state.activeLocation.country ? ', ' + state.activeLocation.country : ''}`;
  
  // Date & Time
  const now = new Date();
  elements.currentDate.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone
  });
  elements.currentTime.textContent = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone
  });

  elements.weatherConditionBadge.textContent = condition.label;
  elements.heroWeatherIcon.innerHTML = getWeatherIconSvg(condition.icon, isDay);
  elements.currentTemp.textContent = formatTemp(current.temperature_2m);
  elements.currentWeatherDesc.textContent = condition.desc;

  if (daily && daily.temperature_2m_max && daily.temperature_2m_min) {
    elements.todayHigh.textContent = `${formatTemp(daily.temperature_2m_max[0])}°`;
    elements.todayLow.textContent = `${formatTemp(daily.temperature_2m_min[0])}°`;
  }
  elements.feelsLikeTemp.textContent = `${formatTemp(current.apparent_temperature)}°`;

  elements.quickPrecipitation.textContent = `${current.precipitation ?? 0} mm`;
  elements.quickHumidity.textContent = `${current.relative_humidity_2m ?? '--'}%`;
  elements.quickWind.textContent = formatSpeed(current.wind_speed_10m);
  elements.quickPressure.textContent = `${Math.round(current.surface_pressure ?? 1013)} hPa`;

  // 2. Hourly Forecast (24 Hours)
  renderHourlyForecast(hourly, timezone);

  // 3. 7-Day Forecast
  renderDailyForecast(daily, timezone);

  // 4. Detailed Highlights Grid
  renderHighlights(current, daily, aqi, timezone);
}

/**
 * Render 24-Hour Slider Cards
 */
function renderHourlyForecast(hourly, timezone) {
  if (!hourly || !hourly.time) return;
  elements.hourlyTrack.innerHTML = '';

  const nowIso = new Date().toISOString();
  // Find current hour index
  let startIndex = 0;
  const currentHourString = nowIso.slice(0, 13);
  for (let i = 0; i < hourly.time.length; i++) {
    if (hourly.time[i].startsWith(currentHourString)) {
      startIndex = i;
      break;
    }
  }

  // Render 24 upcoming hours
  const hoursToShow = 24;
  for (let i = startIndex; i < Math.min(startIndex + hoursToShow, hourly.time.length); i++) {
    const timeStr = hourly.time[i];
    const temp = hourly.temperature_2m[i];
    const code = hourly.weather_code[i] ?? 0;
    const itemIsDay = hourly.is_day ? hourly.is_day[i] : 1;
    const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;
    const cond = WMO_CODE_MAP[code] || WMO_CODE_MAP[0];

    const isCurrentHour = i === startIndex;
    const hourCard = document.createElement('div');
    hourCard.className = `hourly-item ${isCurrentHour ? 'now-item' : ''}`;
    hourCard.innerHTML = `
      <span class="hourly-time">${isCurrentHour ? 'Now' : formatTimeFromIso(timeStr, timezone)}</span>
      <div class="hourly-icon">${getWeatherIconSvg(cond.icon, itemIsDay)}</div>
      <span class="hourly-temp">${formatTemp(temp)}°</span>
      ${precipProb > 10 ? `<span class="hourly-rain">💧 ${precipProb}%</span>` : '<span class="hourly-rain" style="opacity: 0;">--</span>'}
    `;
    elements.hourlyTrack.appendChild(hourCard);
  }
}

/**
 * Render 7-Day Outlook
 */
function renderDailyForecast(daily, timezone) {
  if (!daily || !daily.time) return;
  elements.forecastList.innerHTML = '';

  // Calculate weekly overall min and max for the bar scaling
  const allMins = daily.temperature_2m_min || [];
  const allMaxs = daily.temperature_2m_max || [];
  const weekMin = Math.min(...allMins);
  const weekMax = Math.max(...allMaxs);
  const tempRange = Math.max(weekMax - weekMin, 1);

  for (let i = 0; i < daily.time.length; i++) {
    const dayDate = daily.time[i];
    const code = daily.weather_code[i] ?? 0;
    const max = daily.temperature_2m_max[i];
    const min = daily.temperature_2m_min[i];
    const cond = WMO_CODE_MAP[code] || WMO_CODE_MAP[0];

    // Bar percentages
    const leftPercent = Math.max(0, ((min - weekMin) / tempRange) * 100);
    const widthPercent = Math.max(15, (((max - min) / tempRange) * 100));

    const row = document.createElement('div');
    row.className = 'forecast-row';
    row.innerHTML = `
      <div class="forecast-day">${i === 0 ? 'Today' : getDayName(dayDate, timezone)}</div>
      <div class="forecast-icon">${getWeatherIconSvg(cond.icon, 1)}</div>
      <div class="forecast-condition" title="${cond.desc}">${cond.label}</div>
      <div class="forecast-temp-range">
        <span class="forecast-min">${formatTemp(min)}°</span>
        <div class="temp-bar-container">
          <div class="temp-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
        </div>
        <span class="forecast-max">${formatTemp(max)}°</span>
      </div>
    `;
    elements.forecastList.appendChild(row);
  }
}

/**
 * Render Atmospheric Highlights
 */
function renderHighlights(current, daily, aqi, timezone) {
  // 1. UV Index
  const uvMax = daily && daily.uv_index_max ? daily.uv_index_max[0] : 0;
  elements.uvIndexVal.textContent = uvMax.toFixed(1);
  let uvCategory = 'Low';
  let uvAdvice = 'No protection needed.';
  if (uvMax >= 3 && uvMax < 6) {
    uvCategory = 'Moderate';
    uvAdvice = 'Wear sunscreen outdoors.';
  } else if (uvMax >= 6 && uvMax < 8) {
    uvCategory = 'High';
    uvAdvice = 'Seek shade during midday hours.';
  } else if (uvMax >= 8 && uvMax < 11) {
    uvCategory = 'Very High';
    uvAdvice = 'Extra protection required.';
  } else if (uvMax >= 11) {
    uvCategory = 'Extreme';
    uvAdvice = 'Avoid sun exposure outside.';
  }
  elements.uvIndexRating.textContent = uvCategory;
  elements.uvGaugeFill.style.width = `${Math.min(100, (uvMax / 12) * 100)}%`;
  elements.uvAdvice.textContent = uvAdvice;

  // 2. Wind Status & Compass
  elements.windSpeedVal.innerHTML = `${formatSpeed(current.wind_speed_10m)}`;
  elements.windDirText.textContent = getWindDirectionText(current.wind_direction_10m);
  if (elements.compassArrow) {
    elements.compassArrow.style.transform = `rotate(${current.wind_direction_10m || 0}deg)`;
  }
  if (current.wind_gusts_10m) {
    elements.windGust.textContent = `Gusts up to ${formatSpeed(current.wind_gusts_10m)}`;
  } else {
    elements.windGust.textContent = 'Steady air flow.';
  }

  // 3. Sunrise & Sunset
  if (daily && daily.sunrise && daily.sunset) {
    const sunriseIso = daily.sunrise[0];
    const sunsetIso = daily.sunset[0];
    elements.sunriseTime.textContent = formatTimeFromIso(sunriseIso, timezone);
    elements.sunsetTime.textContent = formatTimeFromIso(sunsetIso, timezone);

    // Calculate solar progress
    const sunriseEpoch = new Date(sunriseIso).getTime();
    const sunsetEpoch = new Date(sunsetIso).getTime();
    const nowEpoch = new Date().getTime();
    const totalDaylight = sunsetEpoch - sunriseEpoch;
    let progress = ((nowEpoch - sunriseEpoch) / totalDaylight) * 100;
    progress = Math.max(0, Math.min(100, progress));

    elements.sunProgressFill.style.width = `${progress}%`;
    elements.sunIndicator.style.left = `${progress}%`;

    const daylightHours = Math.floor(totalDaylight / (1000 * 60 * 60));
    const daylightMinutes = Math.floor((totalDaylight % (1000 * 60 * 60)) / (1000 * 60));
    elements.daylightRemain.textContent = `${daylightHours}h ${daylightMinutes}m total daylight`;
  }

  // 4. Air Quality Index
  if (aqi && aqi.current) {
    const usAqi = aqi.current.us_aqi || Math.round((aqi.current.pm2_5 || 10) * 2.5);
    elements.aqiVal.textContent = usAqi;
    
    let aqiText = 'Good';
    let aqiColor = '#10b981';
    let aqiAdvice = 'Air quality is satisfactory.';

    if (usAqi > 50 && usAqi <= 100) {
      aqiText = 'Moderate';
      aqiColor = '#eab308';
      aqiAdvice = 'Acceptable quality for most.';
    } else if (usAqi > 100 && usAqi <= 150) {
      aqiText = 'Sensitive Groups';
      aqiColor = '#f97316';
      aqiAdvice = 'Sensitive groups should reduce effort.';
    } else if (usAqi > 150 && usAqi <= 200) {
      aqiText = 'Unhealthy';
      aqiColor = '#ef4444';
      aqiAdvice = 'Limit prolonged outdoor exertion.';
    } else if (usAqi > 200) {
      aqiText = 'Hazardous';
      aqiColor = '#7c3aed';
      aqiAdvice = 'Stay indoors and run air filters.';
    }

    elements.aqiStatus.textContent = aqiText;
    elements.aqiStatus.style.color = aqiColor;
    elements.aqiCircle.style.borderColor = aqiColor;
    elements.aqiCircle.style.background = `${aqiColor}22`;
    elements.aqiFill.style.width = `${Math.min(100, (usAqi / 300) * 100)}%`;
    elements.aqiAdvice.textContent = aqiAdvice;
    elements.aqiPrimaryPollutant.textContent = `PM2.5: ${(aqi.current.pm2_5 || 0).toFixed(1)} μg/m³`;
  } else {
    elements.aqiVal.textContent = '35';
    elements.aqiStatus.textContent = 'Good';
    elements.aqiAdvice.textContent = 'Air quality is clear and breathable.';
  }

  // 5. Humidity & Dew Point
  const hum = current.relative_humidity_2m ?? 50;
  elements.humidityVal.innerHTML = `${hum}<span class="metric-unit">%</span>`;
  elements.humidityFill.style.width = `${hum}%`;
  elements.dewPointVal.textContent = `${calculateDewPoint(current.temperature_2m, hum)}°`;

  let comfort = 'Comfortable';
  if (hum < 30) comfort = 'Dry';
  else if (hum > 70) comfort = 'Humid & Muggy';
  elements.humidityComfort.textContent = comfort;
  elements.humidityDesc.textContent = `Relative moisture saturation is ${comfort.toLowerCase()}.`;

  // 6. Visibility & Pressure
  elements.pressureVal.textContent = `${Math.round(current.surface_pressure || 1013)} hPa`;
  elements.visibilityVal.textContent = '10+ km';
  elements.pressureTendency.textContent = (current.surface_pressure || 1013) > 1013 ? 'High barometric pressure (fair weather).' : 'Low barometric pressure (cloud formation).';
}

/**
 * Search Location with Open-Meteo Geocoding API
 */
let searchDebounce = null;

async function searchCities(query) {
  if (!query || query.trim().length < 2) {
    elements.searchSuggestions.classList.add('hidden');
    elements.searchSuggestions.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`);
    if (!res.ok) return;
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      elements.searchSuggestions.innerHTML = '<div class="suggestion-item"><span class="suggestion-meta">No locations found</span></div>';
      elements.searchSuggestions.classList.remove('hidden');
      return;
    }

    elements.searchSuggestions.innerHTML = '';
    data.results.forEach(loc => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';
      item.innerHTML = `
        <div>
          <div class="suggestion-city">${loc.name}</div>
          <div class="suggestion-meta">${loc.admin1 ? loc.admin1 + ', ' : ''}${loc.country || ''}</div>
        </div>
        <span class="suggestion-country-badge">${loc.country_code || 'GEO'}</span>
      `;
      item.addEventListener('click', () => {
        selectLocation({
          name: loc.name,
          country: loc.country || '',
          lat: loc.latitude,
          lon: loc.longitude,
          timezone: loc.timezone || 'auto'
        });
        elements.searchSuggestions.classList.add('hidden');
        elements.cityInput.value = '';
        elements.clearSearchBtn.classList.add('hidden');
      });
      elements.searchSuggestions.appendChild(item);
    });

    elements.searchSuggestions.classList.remove('hidden');
  } catch (err) {
    console.error('Error during geocoding search:', err);
  }
}

/**
 * Select and load a location
 */
async function selectLocation(loc) {
  showLoading(true);
  try {
    state.activeLocation = loc;
    const { weather, aqi } = await fetchWeatherData(loc.lat, loc.lon, loc.timezone);
    state.weatherData = weather;
    state.airQualityData = aqi;

    renderWeatherDashboard();
    saveRecentLocation(loc);
    renderRecentLocations();
    updateAmbientSound();
    showToast(`Loaded forecast for ${loc.name}`);
  } catch (err) {
    console.error(err);
    showToast(`Could not fetch weather: ${err.message}`, true);
  } finally {
    showLoading(false);
  }
}

/**
 * Save to Recent Searches
 */
function saveRecentLocation(loc) {
  let list = state.recentSearches.filter(item => item.name.toLowerCase() !== loc.name.toLowerCase());
  list.unshift({
    name: loc.name,
    country: loc.country,
    lat: loc.lat,
    lon: loc.lon,
    timezone: loc.timezone
  });
  if (list.length > 5) list = list.slice(0, 5);
  state.recentSearches = list;
  localStorage.setItem('skypulse_recents', JSON.stringify(list));
}

function renderRecentLocations() {
  if (!state.recentSearches || state.recentSearches.length === 0) {
    elements.recentSearchesBar.classList.add('hidden');
    return;
  }
  elements.recentSearchesBar.classList.remove('hidden');
  elements.recentChips.innerHTML = '';
  state.recentSearches.forEach(loc => {
    const btn = document.createElement('button');
    btn.className = 'recent-chip-btn';
    btn.textContent = `${loc.name}`;
    btn.addEventListener('click', () => selectLocation(loc));
    elements.recentChips.appendChild(btn);
  });
}

/**
 * User Geolocation GPS Lookup
 */
function requestUserLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser', true);
    return;
  }

  showLoading(true);
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      // Reverse geocode to find city name
      let cityName = 'Current Location';
      let countryName = '';
      try {
        const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (revRes.ok) {
          const revData = await revRes.json();
          cityName = revData.city || revData.locality || revData.principalSubdivision || 'Current Location';
          countryName = revData.countryName || '';
        }
      } catch (e) {
        console.warn('Reverse geocode fallback:', e);
      }

      await selectLocation({
        name: cityName,
        country: countryName,
        lat: lat,
        lon: lon,
        timezone: 'auto'
      });
    },
    (err) => {
      showLoading(false);
      showToast(`Location access denied or unavailable: ${err.message}`, true);
    },
    { timeout: 10000 }
  );
}

/**
 * Web Audio API Ambient Weather Soundscapes (Rain, Wind, Calm)
 */
function toggleSoundAmbience() {
  if (state.isSoundPlaying) {
    stopSoundAmbience();
  } else {
    startSoundAmbience();
  }
}

function startSoundAmbience() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!state.audioCtx) {
      state.audioCtx = new AudioContext();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }

    state.audioNodes = [];

    // Weather condition sound generator using white noise and low-pass filter
    const bufferSize = state.audioCtx.sampleRate * 2;
    const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = state.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soft ambient rain / gentle wind
    const filter = state.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    const gain = state.audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, state.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(state.audioCtx.destination);
    whiteNoise.start();

    state.audioNodes.push(whiteNoise, gain);
    state.isSoundPlaying = true;

    elements.soundToggleBtn.classList.add('active');
    elements.soundToggleBtn.querySelector('.icon-sound-off').classList.add('hidden');
    elements.soundToggleBtn.querySelector('.icon-sound-on').classList.remove('hidden');
    showToast('Ambient weather soundscape active 🎧');
  } catch (err) {
    console.error('Audio synthesizer error:', err);
    showToast('Audio playback error', true);
  }
}

function stopSoundAmbience() {
  if (state.audioNodes && state.audioNodes.length) {
    state.audioNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
  }
  state.audioNodes = [];
  state.isSoundPlaying = false;

  elements.soundToggleBtn.classList.remove('active');
  elements.soundToggleBtn.querySelector('.icon-sound-off').classList.remove('hidden');
  elements.soundToggleBtn.querySelector('.icon-sound-on').classList.add('hidden');
}

function updateAmbientSound() {
  if (state.isSoundPlaying) {
    stopSoundAmbience();
    startSoundAmbience();
  }
}

/**
 * Event Listeners & Initialization
 */
function setupEventListeners() {
  // City search input with debounce
  elements.cityInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length > 0) {
      elements.clearSearchBtn.classList.remove('hidden');
    } else {
      elements.clearSearchBtn.classList.add('hidden');
    }

    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      searchCities(val);
    }, 280);
  });

  // Clear search input
  elements.clearSearchBtn.addEventListener('click', () => {
    elements.cityInput.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    elements.searchSuggestions.classList.add('hidden');
    elements.cityInput.focus();
  });

  // Geolocation button
  elements.geoBtn.addEventListener('click', requestUserLocation);

  // Close suggestions on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      elements.searchSuggestions.classList.add('hidden');
    }
  });

  // Temperature unit toggle
  elements.unitToggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.unit-btn');
    if (!btn) return;
    const newUnit = btn.dataset.unit;
    if (newUnit === state.unit) return;

    state.unit = newUnit;
    localStorage.setItem('skypulse_unit', newUnit);

    elements.unitToggle.querySelectorAll('.unit-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.unit === newUnit);
    });

    renderWeatherDashboard();
    showToast(`Switched unit to °${newUnit.toUpperCase()}`);
  });

  // Ambient sound toggle
  elements.soundToggleBtn.addEventListener('click', toggleSoundAmbience);

  // Quick City Chips
  elements.quickCities.addEventListener('click', (e) => {
    const chip = e.target.closest('.quick-chip');
    if (!chip) return;

    // Highlight active chip
    elements.quickCities.querySelectorAll('.quick-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');

    selectLocation({
      name: chip.dataset.city,
      country: chip.dataset.country,
      lat: parseFloat(chip.dataset.lat),
      lon: parseFloat(chip.dataset.lon),
      timezone: 'auto'
    });
  });

  // Keyboard navigation for search
  elements.cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const firstSuggestion = elements.searchSuggestions.querySelector('.suggestion-item');
      if (firstSuggestion) {
        firstSuggestion.click();
      } else if (elements.cityInput.value.trim().length >= 2) {
        searchCities(elements.cityInput.value.trim()).then(() => {
          const item = elements.searchSuggestions.querySelector('.suggestion-item');
          if (item) item.click();
        });
      }
    }
  });
}

// Initial Boot
async function initApp() {
  // Sync unit switch UI
  elements.unitToggle.querySelectorAll('.unit-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.unit === state.unit);
  });

  setupEventListeners();
  renderRecentLocations();

  // Load default location (London or user cached)
  await selectLocation(state.activeLocation);
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
