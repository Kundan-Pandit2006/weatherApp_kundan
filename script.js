const container = document.querySelector('.container');
const searchInput = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const error404 = document.querySelector('.not-found');
const searchResultsContainer = document.querySelector('.search-results');
const cityHide = document.querySelector('.city-hide');

// Select all weather data elements once at the top
const image = document.querySelector('.weather-box img');
const temperature = document.querySelector('.weather-box .temperature');
const description = document.querySelector('.weather-box .description');
const humidity = document.querySelector('.weather-details .humidity span');
const wind = document.querySelector('.weather-details .wind span');

const APIKey = 'e0eaf13108eb372114c7911121aaeaeb';

// Function to reset the UI to the "not found" state
function showError(message = 'Oops! Location not Found!') {
    container.style.height = '400px';
    weatherBox.classList.remove('active');
    weatherDetails.classList.remove('active');
    searchResultsContainer.classList.remove('active');
    error404.classList.add('active');
    const notFoundText = document.querySelector('.not-found p');
    if (notFoundText) {
        notFoundText.textContent = message;
    }
}

// Function to fetch and display weather data using latitude and longitude
function fetchWeather(lat, lon, cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKey}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(json => {
                    throw new Error(json.message || 'API error');
                });
            }
            return response.json();
        })
        .then(json => {
            // Update the display for the new weather data
            cityHide.textContent = cityName;
            container.style.height = '555px';
            weatherBox.classList.add('active');
            weatherDetails.classList.add('active');
            error404.classList.remove('active');
            searchResultsContainer.classList.remove('active');
            container.classList.add('active'); // Activate the container for your animations

            // Set the correct weather image
            switch (json.weather[0].main) {
                case 'Clear':
                    image.src = 'clear.png';
                    break;
                case 'Rain':
                    image.src = 'rain.png';
                    break;
                case 'Snow':
                    image.src = 'snow.png';
                    break;
                case 'Clouds':
                    image.src = 'cloud.png';
                    break;
                case 'Mist':
                case 'Haze':
                    image.src = 'mist.png';
                    break;
                default:
                    image.src = 'cloud.png';
            }

            // Update the weather details with a slight delay to allow for animations
            setTimeout(() => {
                // Corrected: Uses <sup> for the degree symbol
                temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
                description.innerHTML = `${json.weather[0].description}`;
                humidity.textContent = `${json.main.humidity}%`;
                // Corrected: Uses the correct path for the wind speed
                wind.textContent = `${parseInt(json.wind.speed)}Km/h`;
            }, 600); // This delay syncs with your container's transition time
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            showError('Failed to get weather data for this location.');
        });
}

// Function to handle fetching and displaying possible city locations
function fetchLocations(city) {
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${APIKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }
            return response.json();
        })
        .then(locations => {
            if (locations.length === 0) {
                showError('No results found for this city.');
                return;
            }

            // Clear previous content and show a list of results
            searchResultsContainer.innerHTML = '';
            error404.classList.remove('active');
            weatherBox.classList.remove('active');
            weatherDetails.classList.remove('active');
            
            // Adjust container height to show results
            container.style.height = 'auto';
            searchResultsContainer.classList.add('active');
            container.classList.remove('active'); // Deactivate container before showing results

            locations.forEach(location => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('result-item');
                let locationName = `${location.name}, ${location.country}`;
                if (location.state) {
                    locationName = `${location.name}, ${location.state}, ${location.country}`;
                }
                resultItem.textContent = locationName;
                
                resultItem.addEventListener('click', () => {
                    fetchWeather(location.lat, location.lon, locationName);
                });

                searchResultsContainer.appendChild(resultItem);
            });
        })
        .catch(error => {
            console.error('Error fetching geocoding data:', error);
            showError('Failed to find locations. Please try again.');
        });
}

// Event listener for the search button
searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city === '') return;
    fetchLocations(city);
});

// Optional: Add a listener for the Enter key on the input field
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city === '') return;
        fetchLocations(city);
    }
});
