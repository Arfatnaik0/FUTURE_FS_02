const searchInput=document.querySelector('.search-input');
const searchButton=document.querySelector('.search-button');

const errorMessage= document.querySelector('.weather-error');
const defaultMessage=document.querySelector('.weather-default');
const weatherInfo=document.querySelector('.weather-show');
const forecast=document.querySelector('.body-forecast')

const cityName=document.querySelector('.stat-cityname');
const weatherTemp=document.querySelector('.stat-temp');
const conditionTxt=document.querySelector('.stat-txt');
const weatherHumidity=document.querySelector('.stat-humidity');
const weatherAir=document.querySelector('.stat-air');
const weatherImg=document.querySelector('.stat-img');
const currentDateDay=document.querySelector('.day');
const currentMonthYear=document.querySelector('.month-year');

const forecastContainer=document.querySelector('.body-forecast');





searchButton.addEventListener('click',()=>
{
    if(searchInput.value.trim() != ''){
    updateWeatherInfo(searchInput.value)
    searchInput.value='';
    }
})

searchInput.addEventListener("keydown",(e)=>
{
    if(e.key=="Enter" && searchInput.value.trim() != ''){
        updateWeatherInfo(searchInput.value)
        searchInput.value='';
    }
})

async function getFetchData(endpoint,city){
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await fetch(apiUrl);
    return response.json();
}

function getWeatherIcon(id) {
    if(id<=232) return 'thunderstorm';
    if(id<=321) return 'drizzle';
    if(id<=531) return 'rain';
    if(id<=622) return 'snow';
    if(id<=781) return 'mist';
    if(id===800) return 'clear';
    if(id<=804) return 'clouds';
}

function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function getCurrentDay() {
    const now = new Date();
    const day = now.getDate(); // numeric day (1-31)
    const suffix = getOrdinalSuffix(day);
    
    return `${day}${suffix}`; // e.g., 13th June 2025
}

function getCurrentMonthYear() {
    const now = new Date();
    const month = now.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    return `${month}, ${year}`;
}



async function updateWeatherInfo(city){
    const weatherData= await getFetchData('weather',city)
    if(weatherData.cod !=200){
    showDisplaySection(errorMessage)
    return
    }
    const {
        name:country,
        main:{temp,humidity},
        weather:[{id,main}],
        wind:{speed}

    }=weatherData

    cityName.textContent=country;
    weatherTemp.textContent=Math.round(temp)+"°C";
    conditionTxt.textContent=main;
    weatherHumidity.textContent=humidity+'%';
    weatherAir.textContent=speed+'m/s';
    currentDateDay.textContent=getCurrentDay();
    currentMonthYear.textContent=getCurrentMonthYear();

    weatherImg.src=`assets/weather/${getWeatherIcon(id)}.svg`;

    await updateForecastInfo(city)
    showDisplaySection(weatherInfo,forecast)
}

async function updateForecastInfo(city){
    const forecastData=await getFetchData('forecast',city);
    const timeTaken='12:00:00'
    const todayDate=new Date().toISOString().split('T')[0]

    forecastContainer.innerHTML=''
    forecastData.list.forEach(forecastweather=>
    {
        if(forecastweather.dt_txt.includes(timeTaken) && !forecastweather.dt_txt.includes(todayDate)){
           updateForecastItems(forecastweather)
        }
        
    }
    )
    
    
}

function updateForecastItems(weatherData){
    const {
        dt_txt:date,
        weather:[{id}],
        main:{temp}
    }=weatherData

    const dataTaken= new Date(date);
    const dateOption={
        day:'2-digit',
        month:'short'
    }
    const dateResult= dataTaken.toLocaleDateString('en-US',dateOption)

    const forecastItem=`
    <div class="forecast"> 
                <div class="forecast-date">
                    <h2 class="stat-fore-date">${dateResult}</h2>
                </div>
                <div class="forecast-icon">
                    <img class="stat-fore-icon" src="assets/weather/${getWeatherIcon(id)}.svg" alt="">
                </div>
                <div class="forecast-temp">
                    <h2 class="stat-fore-temp">${Math.round(temp)}°C</h2>
                </div>
    </div>
    </div>
    `

    forecast.insertAdjacentHTML('beforeend',forecastItem)
}


function showDisplaySection(section1,section2){
[errorMessage,defaultMessage,weatherInfo,forecast].forEach(section=> section.style.display='none');
section1.style.display='flex';
section2.style.display='flex';
}