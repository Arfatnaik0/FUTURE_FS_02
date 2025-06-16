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




// adds an event listener to the search button so when it is clicked and the input value is not an empty string it passes the value to updateweatherinfo function
searchButton.addEventListener('click',()=>
{
    if(searchInput.value.trim() != ''){
    updateWeatherInfo(searchInput.value)
    searchInput.value='';
    }
})


// this is so that the enter key also does the same search as above
searchInput.addEventListener("keydown",(e)=>
{
    if(e.key=="Enter" && searchInput.value.trim() != ''){
        updateWeatherInfo(searchInput.value)
        searchInput.value='';
    }
})

// takes the endpoint which can be weather or forecast and the city and fetches the data and if response is not okay display an error message if it okay then return data
async function getFetchData(endpoint,city){
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!response.ok) {
            showDisplaySection(errorMessage);
            throw new Error(data.message || 'Failed to fetch weather data');
        }
        return data;
    } catch (error) {
        showDisplaySection(errorMessage);
        throw error;
    }
}

// used to get the id of icon
function getWeatherIcon(id) {
    if(id<=232) return 'thunderstorm';
    if(id<=321) return 'drizzle';
    if(id<=531) return 'rain';
    if(id<=622) return 'snow';
    if(id<=781) return 'mist';
    if(id===800) return 'clear';
    if(id<=804) return 'clouds';
}

// used for determining the suffix of date
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

// function to get current day
function getCurrentDay() {
    const now = new Date();
    const day = now.getDate(); // numeric day (1-31)
    const suffix = getOrdinalSuffix(day);
    
    return `${day}${suffix}`; // e.g., 13th June 2025
}

// similarly gets month and year
function getCurrentMonthYear() {
    const now = new Date();
    const month = now.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    const year = now.getFullYear();
    return `${month}, ${year}`;
}


// city is passed in the function it then runs and stores data in weatherData if data code is not 200 which signifies proper expected output it displays error message else takes the value from
// we need only like name of city temp and humidty wind etc.
// then replaces the text in html to suitable weather info then runs the forecast function and displays it.
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

// simliar to above the forecast function
// sets the inner html to empty so that the data can show and not cause problems like double
// if necessary values return from the api updateforecastitems function runs.
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

// similar to updateweatherinfo
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

// it disables all sections then loops over all sections and then displays only the one you need
function showDisplaySection(section1,section2){
[errorMessage,defaultMessage,weatherInfo,forecast].forEach(section=> section.style.display='none');
section1.style.display='flex';
section2.style.display='flex';
}