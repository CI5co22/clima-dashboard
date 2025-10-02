let apiKey = '';
const input = document.getElementById("city");
const suggestions = document.getElementById("suggestions");
const myLocationBtn = document.getElementById("myLocationBtn");
const searchBtn = document.getElementById("searchBtn");
const addFavBtn = document.getElementById("addFavBtn");
const body = document.getElementsByTagName("body");
const favsContainer = document.getElementById("container-favs");
const favTemplate = document.getElementById("favTemplate");


const favsArray = JSON.parse(localStorage.getItem("favs")) || [];

async function cargarKey() {
  const response = await fetch("/api/getKey");
  apiKey = await response.text();
   // apiKey = '8285faf27b73df6814dc55e459b3bab1';
}


function showFavs() {
    favsContainer.innerHTML = ""; 
    favsArray.forEach(cityName => {
        const clone = favTemplate.content.cloneNode(true);
        clone.querySelector(".fav-name").textContent = cityName;
        favsContainer.appendChild(clone);

    });
}

favsContainer.addEventListener("click", async (e) => {
    if (e.target.classList.contains("removeFav")) {
        const favElement = e.target.closest(".fav");
        const cityName = favElement.querySelector(".fav-name").textContent;
        const indice = favsArray.indexOf(cityName);
        
        favsArray.splice(indice, 1);
        localStorage.setItem("favs", JSON.stringify(favsArray));
        
        favElement.remove();
    }

    if (e.target.classList.contains("fav-name"))
    {
        const favElement = e.target.closest(".fav");
        const cityName = favElement.querySelector(".fav-name").textContent;

        await getWeatherByCity(cityName);
        await getForeCast(cityName);

    }
});

showFavs();


input.addEventListener("input", async () =>
{
    const query = input.value;
    
    if (!query) 
    {
        suggestions.innerHTML = "";
    }
    try
    {
    if (!apiKey) await cargarKey();
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
    const data = await response.json();

    
    suggestions.innerHTML = ""; 
    data.forEach(city => {
      const li = document.createElement("li");
      cityName = `${city.name}, ${city.country}`
      li.textContent = cityName;
      li.addEventListener("click", async () => {
        input.value = li.textContent;
        suggestions.innerHTML = "";
        await getWeatherByCity(input.value);
        await getForeCast(input.value);
      });
      suggestions.appendChild(li);

        
      });
    }
    catch(err)
    {
      console.error("Error en la lista:", err);
    }
});

myLocationBtn.addEventListener("click", async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async position => {
        try
        {
        if (!apiKey) await cargarKey();
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const response = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`)
        const data = await response.json();

        if (data.length > 0) {
          const cityName = `${data[0].name}, ${data[0].country}`;
          input.value = cityName;   
          suggestions.innerHTML = ""; 
          await getWeatherByCity(cityName);
          await getForeCast(cityName);
        }
        } catch(err){
         console.error("Error", err);
        }
      },
      error => {
        console.error("Error al obtener ubicación:", error.message);
      }
    );
  } 
});

searchBtn.addEventListener("click", async (e) =>
{
  if(!input.value.trim())
  {
    createToast('No se puede enviar el campo vacio')
    return;
  }

  const query = input.value;
  await getWeatherByCity(query);
  await getForeCast(query);

});



async function getWeatherByCity(qCity) {
  try
  {
    if (!apiKey) await cargarKey();
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${qCity}&appid=${apiKey}&units=metric&lang=es`)
    const data = await response.json()


    if (data.cod === 200) 
    {
      updateWeatherHTML(data);
      addFavBtn.removeAttribute("disabled");
      input.value = qCity;

    } else {
      createToast("Ciudad no encontrada")
    }
  }
  catch(err)
  {
    console.error("Error al obtener clima:", err);
  }

}


function updateWeatherHTML(data) {
  document.querySelector(".info-lugar h1").textContent = `${data.name}, ${data.sys.country}`;

  const now = new Date();
  document.querySelector(".info-lugar span").textContent = now.toLocaleString();

  modifyBackground(data.weather[0].main);
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

function modifyBackground(main) { 
  switch(main) {
    case "Clear":
      document.body.className = "";
      document.body.className = "Clear";
      break;
    case "Clouds":
      document.body.className = "";
      document.body.className = "Clouds";
      break;
    case "Rain": 
      document.body.className = "";
      document.body.className = "Rain";
      break;
    case "Drizzle": 
      document.body.className = "";
      document.body.className = "Drizzle";
      break;
    case "Thunderstorm": 
      document.body.className = "";
      document.body.className = "Thunderstorm";
      break;
    case "Snow": 
      document.body.className = "";
      document.body.className = "Snow";
      break;
    case "Mist":
      document.body.className = "";
      document.body.className = "Mist";
      break;
    case "Fog": 
      document.body.className = "";
      document.body.className = "Fog";
      break;
    default: return "🌡️";
  }
}


if(document.querySelector(".info-lugar h1").textContent == "— —")
{
    addFavBtn.setAttribute("disabled", "disabled")
}

addFavBtn.addEventListener("click", () =>
{
    var newFav = document.querySelector(".info-lugar h1").textContent

    if(!favsArray.includes(newFav))
    {
        favsArray.push(newFav);
        localStorage.setItem("favs", JSON.stringify(favsArray))

        const favs = localStorage.getItem("favs");
        createFav(newFav);
    }
    else
    {
        createToast(`${newFav} ya está en favoritos`)
    }
});



function createFav(cityName)
{ 
    const clone = favTemplate.content.cloneNode(true);
    clone.querySelector(".fav-name").textContent = cityName;

    favsContainer.appendChild(clone);
    
}



async function getForeCast(qCity) {
  try
  {
    if (!apiKey) await cargarKey();

    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${qCity}&appid=${apiKey}&units=metric&lang=es`)
    const data = await response.json()

    if (data.cod === "200"  || data.cod === 200) 
    {  
      updateForeCastHTML(data);
    } else 
    {
      createToast("No se pudo obtener el pronóstico")
    }
  
  } catch(err)
  {
    console.error("Error al obtener forecast:", err);
  }

}

function updateForeCastHTML(data) {
  const forecastContainer = document.querySelector(".forecast-container");
  forecastContainer.innerHTML = ""; 

  
  const daysMap = {};

  data.list.forEach(item => {
   
    const date = item.dt_txt.split(" ")[0]; 

    if (!daysMap[date]) {
      daysMap[date] = [];
    }
    daysMap[date].push(item);
  });

  
  const dates = Object.keys(daysMap).slice(0, 5);

  dates.forEach(date => {
    const dayData = daysMap[date];


    const tempsMax = dayData.map(d => d.main.temp_max);
    const tempsMin = dayData.map(d => d.main.temp_min);

    const maxTemp = Math.round(Math.max(...tempsMax));
    const minTemp = Math.round(Math.min(...tempsMin));

  
    let weatherItem = dayData.find(d => d.dt_txt.includes("12:00:00")) || dayData[0];
    const weatherMain = weatherItem.weather[0].main;
   
    const emoji = getWeatherEmoji(weatherMain);
   
    const dateObj = new Date(date);
    const options = { weekday: 'short', day: 'numeric' };
    const dayFormatted = dateObj.toLocaleDateString('es-ES', options);

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    dayDiv.innerHTML = `
      <h4 class="day-day">${dayFormatted}</h4>
      <span class="day-emoji">${emoji}</span>
      <div class="day-data">
        <span>Max: <b>${maxTemp}°</b></span>
        <span>Min: <b>${minTemp}°</b></span>
      </div>
    `;

    forecastContainer.appendChild(dayDiv);
  });
}




  const container = document.getElementById('toast-container');

  function createToast(msg) {
      const toast = document.createElement('div');
      toast.classList.add('toast-custom');

      toast.innerHTML = `
            <i class="fa-solid fa-circle-exclamation" style="color:red"></i>
            ${msg}
            <button class="close-btn">&times;</button>
        `;

      container.appendChild(toast);


      setTimeout(() => {
          toast.classList.add('show');
      }, 100);

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 500);
      }, 4200);

      toast.querySelector('.close-btn').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => container.removeChild(toast), 500);
      });
    }
