const apiKey = "8285faf27b73df6814dc55e459b3bab1";
const input = document.getElementById("city");
const suggestions = document.getElementById("suggestions");
const myLocationBtn = document.getElementById("myLocationBtn");
const searchBtn = document.getElementById("searchBtn");
const addFavBtn = document.getElementById("addFavBtn");

const favsArray = [];


var qCity = "";


input.addEventListener("input", () =>
{
    const query = input.value;
    
    if (!query) 
    {
        suggestions.innerHTML = "";
       
    }

    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      suggestions.innerHTML = ""; 
      data.forEach(city => {
        const li = document.createElement("li");
        li.textContent = `${city.name}, ${city.country}`;
        li.addEventListener("click", () => {
          input.value = li.textContent;
          suggestions.innerHTML = "";
        });
        suggestions.appendChild(li);

        qCity = li.textContent;
      });
    })
    .catch(err => console.error("Error:", err));
});

myLocationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`)
          .then(res => res.json())
          .then(data => {
            if (data.length > 0) {
              const cityName = `${data[0].name}, ${data[0].country}`;
              input.value = cityName;   
              suggestions.innerHTML = ""; 
              qCity = cityName;
            }
          })
          .catch(err => console.error("Error", err));
      },
      error => {
        console.error("Error al obtener ubicación:", error.message);
      }
    );
  } 
});

searchBtn.addEventListener("click", (e) =>
{
    e.preventDefault();
    const query = input.value;
    getWeatherByCity(query);
});

function getWeatherByCity(qCity) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${qCity}&appid=${apiKey}&units=metric&lang=es`)
    .then(res => res.json())
    .then(data => {
      if (data.cod === 200) 
      {
        updateWeatherHTML(data);
      } else {
        alert("Ciudad no encontrada");
      }
    })
    .catch(err => console.error("Error al obtener clima:", err));
}


function updateWeatherHTML(data) {
  document.querySelector(".info-lugar h1").textContent = `${data.name}, ${data.sys.country}`;

  const now = new Date();
  document.querySelector(".info-lugar span").textContent = now.toLocaleString();

  document.querySelector(".info-data span").textContent = getWeatherEmoji(data.weather[0].main);
  document.querySelector(".info-data h1").textContent = `${Math.round(data.main.temp)}°`;
  document.querySelector(".info-data h5").textContent = data.weather[0].description;

  const cards = document.querySelectorAll(".info-detalles .c-card");
  cards[0].querySelector("h3").textContent = `${Math.round(data.main.feels_like)}°C`;
  cards[1].querySelector("h3").textContent = `${data.main.humidity}%`;                  
  cards[2].querySelector("h3").textContent = `${data.wind.speed} km/h`;                  
  cards[3].querySelector("h3").textContent = `${data.main.pressure} hPa`;                
}

function getWeatherEmoji(main) { 
  switch(main) {
    case "Clear": return "☀️";
    case "Clouds": return "🌥️";
    case "Rain": return "🌧️";
    case "Drizzle": return "🌦️";
    case "Thunderstorm": return "⛈️";
    case "Snow": return "❄️";
    case "Mist":
    case "Fog": return "🌫️";
    default: return "🌡️";
  }
}


addFavBtn.addEventListener("click", () =>
{
    var newFav = document.querySelector(".info-lugar h1").textContent
    favsArray.push(newFav);
    localStorage.setItem("favs", JSON.stringify(favsArray))

    const favs = localStorage.getItem("favs");
    console.log(favs);
});



