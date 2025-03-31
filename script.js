// script.js

// Select DOM elements
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const currentWeather = document.getElementById('current-weather');
const cityName = document.getElementById('city-name');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const weatherIcon = document.getElementById('weather-icon');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const forecastContainer = document.getElementById('forecast-container');
const historyList = document.getElementById('history-list');
const errorMessage = document.getElementById('error-message');
const currentLocationBtn = document.getElementById('current-location-btn');
const themeToggle = document.getElementById('theme-toggle');
const africaCountries = document.getElementById('africa-countries');

// OpenWeatherMap API key
const apiKey = 'c592eb42ab553fadee9f8002f7f3cece'; // Replace with the working API key
const currentWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastUrl = 'https://api.openweathermap.org/data/2.5/forecast';

// Add unit conversion logic
let unit = 'metric';

// Add dark/light mode toggle
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
  });
} else {
  console.error('Theme toggle button not found in the DOM.');
}

// Function to fetch current weather data
async function fetchCurrentWeather(city) {
  try {
    const url = `${currentWeatherUrl}?q=${city}&appid=${apiKey}&units=${unit}`;
    console.log(`Fetching current weather: ${url}`); // Debugging
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`City not found: ${city}`);
    }
    const data = await response.json();
    console.log('Current weather data:', data); // Debugging
    displayCurrentWeather(data);
  } catch (error) {
    console.error(error); // Log the error for debugging
    showError(error.message);
  }
}

// Function to fetch 6-day forecast data
async function fetchForecast(city) {
  try {
    const url = `${forecastUrl}?q=${city}&appid=${apiKey}&units=${unit}`;
    console.log(`Fetching forecast: ${url}`); // Debugging
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`City not found: ${city}`);
    }
    const data = await response.json();
    console.log('Forecast data:', data); // Debugging
    displayForecast(data.list);
  } catch (error) {
    console.error(error); // Log the error for debugging
    showError(error.message);
  }
}

// Update display functions to include animations
function displayCurrentWeather(data) {
  errorMessage.classList.add('hidden'); // Hide error message
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  temperature.textContent = data.main.temp;
  condition.textContent = data.weather[0].description;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  humidity.textContent = data.main.humidity;
  windSpeed.textContent = data.wind.speed;
  currentWeather.classList.remove('hidden'); // Show current weather
}

function displayForecast(forecastData) {
  forecastContainer.innerHTML = '';
  const uniqueDays = [];
  forecastData.forEach((item) => {
    const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
    if (!uniqueDays.includes(date)) {
      uniqueDays.push(date);
      const card = document.createElement('div');
      card.className = 'forecast-card';
      card.innerHTML = `
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="Weather Icon">
        <p>Temp: ${item.main.temp}°C</p>
        <p>Condition: ${item.weather[0].description}</p>
        <p>Humidity: ${item.main.humidity}%</p>
      `;
      forecastContainer.appendChild(card);
    }
  });
  forecastContainer.parentElement.classList.add('show');
}

// Function to show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  currentWeather.classList.add('hidden');
  forecastContainer.parentElement.classList.add('hidden');
}

// Event listener for form submission
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) {
    console.log(`Searching for city: ${city}`); // Debugging
    fetchCurrentWeather(city);
    fetchForecast(city);
    addToHistory(city); // Add city to search history
    cityInput.value = '';
  }
});

// Function to add city to search history
function addToHistory(city) {
  const li = document.createElement('li');
  li.textContent = city;
  li.className = 'history-item';
  historyList.appendChild(li);

  // Add click event to search history items
  li.addEventListener('click', () => {
    fetchCurrentWeather(city);
    fetchForecast(city);
  });
}

// Clear hardcoded history and dynamically add cities
historyList.innerHTML = '';

// Add geolocation support
currentLocationBtn.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const response = await fetch(`${currentWeatherUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${unit}`);
        if (!response.ok) throw new Error('Unable to fetch weather for your location');
        const data = await response.json();
        displayCurrentWeather(data);
        fetchForecast(data.name);
      } catch (error) {
        showError(error.message);
      }
    });
  } else {
    showError('Geolocation is not supported by your browser.');
  }
});

// Event listener for selecting a country in Africa
africaCountries.addEventListener('change', () => {
  const country = africaCountries.value;
  if (country) {
    fetchCurrentWeather(country);
    fetchForecast(country);
  }
});