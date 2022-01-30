var cityInput = document.querySelector(".cityInput");
var searchBtn = document.querySelector(".btn");
var currentWeather = document.querySelector(".currentWeather");
var fiveDaysForecastContainer = document.querySelector(".fiveDaysForecast");
var currentDay = moment().format('L');

var historySearchList = [];



var apiKey = "0f8e0078b0885b8a28646e75d16c09f3";

var weatherToday = function(cityName) {
    cityName = cityInput.value;

    var url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${apiKey}`;

    console.log(url);


    //get city name, temp, wind speed, humidity and uv value
    fetch(url)
        .then(function(weatherInfo) {
            return weatherInfo.json();
        })
        .then(function(data) {
            //get city name, temp, wind speed, humidity
            var weatherHeading = data.name;
            var weatherTemp = data.main.temp;
            var weatherWind = data.wind.speed;
            var weatherHumidity = data.main.humidity;

            var lat = data.coord.lat;
            var lon = data.coord.lat;
            var uvIndexUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

            //get uv value
            fetch(uvIndexUrl)
                .then(function(uvIndexInfo) {
                    return uvIndexInfo.json();
                })
                .then(function(uvData) {
                    var uvValue = uvData.value;

                    //display weather today
                    var weather = $(`
                        <h2 >${weatherHeading} (${currentDay})</h2>
                        <p>Temp: ${weatherTemp}</p>
                        <p>Wind: ${weatherWind} MPH</p>
                        <p>Humidity: ${weatherHumidity}</p>
                        <p>UV Index: <span class="uvColour">${uvValue}</span></p>
                    `);


                    currentWeather.textContent = "";
                    $(".currentWeather").append(weather);

                    //conditions are favorable, moderate, or severe


                    if (uvValue >= 0 && uvValue <= 4) {
                        $(".uvColour").addClass("bg-success");
                    } else if (uvValue > 4 && uvValue < 8) {
                        $(".uvColour").addClass("bg-warning");
                    } else if (uvValue >= 8) {
                        $(".uvColour").addClass("bg-danger");
                    };

                    fiveDaysForecast(lat, lon);

                })
                .catch(function(error) {
                    alert("No UV Value record.");
                });
        })
        .catch(function(error) {
            alert("No city found, please enter correct city and try again.");
        });
}


var fiveDaysForecast = function(lat, lon) {
    var fiveDaysForeCastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;


    fetch(fiveDaysForeCastURL)
        .then(function(forecastInfo) {
            return forecastInfo.json();
        })
        .then(function(forecastData) {

            //clear forecast container
            fiveDaysForecastContainer.textContent = "";

            //create heading
            var forecastHeading = document.createElement("h2");
            forecastHeading.textContent = "5 Days Forecast";
            fiveDaysForecastContainer.append(forecastHeading);

            //display 5 days weather forecast info
            for (var i = 0; i < 5; i++) {
                var cityWeather = {
                    date: forecastData.daily[i].dt,
                    icon: forecastData.daily[i].weather[0].icon,
                    temp: forecastData.daily[i].temp.day,
                    humidity: forecastData.daily[i].humidity,
                }
                var displayDate = moment.unix(cityWeather.date).format("MM/DD/YYYY");
                var iconImageURL = `<img src="https://openweathermap.org/img/w/${cityWeather.icon}.png" alt="${forecastData.daily[i].weather[0].main}" />`;

                var displayForecast = $(`

                    <div class=row>

                        <div class="card-body">
                            <h5>${displayDate}</h5>
                            <p> ${iconImageURL}</p>
                            <p>Temp: ${cityWeather.temp} °F</p>
                            <p>Humidity: ${cityWeather.humidity}\%</p>
                        </div>

                    </div>
                `);

                $(".fiveDaysForecast").append(displayForecast);

            }
        })
        .catch(function(error) {
            alert("Unable to get data. Please try again.");
        });

}

searchBtn.addEventListener("click", function(e) {
    e.preventDefault();


    var searchedCity = $(".cityInput").val().trim();
    weatherToday(searchedCity);

    //add searched city into history search list and avoid repeat history city name in the array
    if (!historySearchList.includes(searchedCity)) {
        historySearchList.push(searchedCity);
        var displayHistoryList = $(`
            <li class="list-group-item">${searchedCity}</li>
            `);
        $("#recentSearch").append(displayHistoryList);
    };

    localStorage.setItem("searchedCity", JSON.stringify(historySearchList));
    console.log(historySearchList);
});

$(document).ready(function() {
    var retrieveHistory = JSON.parse(localStorage.getItem('searchedCity'));
});