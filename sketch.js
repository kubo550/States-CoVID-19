let mymap
let currentDate;
// const toFirebase = []
const stateInfo = []

async function getCovidData() {
  const covidDataQuery = "https://covidtracking.com/api/v1/states/current.json";

  const state = [];
  const totalTestResults = [];
  const positive = [];
  const hospitalized = [];
  const recovered = [];
  const death = [];


  const resoults = await fetch(covidDataQuery);
  const data = await resoults.json();
  for (let d of data) {
    state.push(d.state);
    totalTestResults.push(d.totalTestResults);
    positive.push(d.positive)
    hospitalized.push(d.hospitalized);
    recovered.push(d.recovered);
    death.push(d.death);
  }

  return {state, totalTestResults, positive, hospitalized, recovered, death}
}

async function getGeoData(place) {
  const q = "https://api.opencagedata.com/geocode/v1/json?q="
  const apikey = "&key=65656e8b270b4958b8fb3a00d896b1a6";
  const apikey2 = "&key=fe6f1aaafb48485aaadf002eeca6131f"
  const code = "&countrycode=us"

  const results = await fetch(q+place+apikey2+ code)
  const data = await results.json()
  const res = data.results[0]
  const re = {

  }
  return{
    name: res.formatted,
    lat: res.geometry.lat,
    lng: res.geometry.lng
  }
}



async function obliczenia() {

  const coviDdata = await getCovidData()

  for (var i = 0; i < coviDdata.state.length; i++) {
    const d = {
      name: coviDdata.state[i],
      totalTestResults: coviDdata.totalTestResults[i],
      positive: coviDdata.positive[i],
      hospitalized: coviDdata.hospitalized[i],
      recovered: coviDdata.recovered[i],
      death: coviDdata.death[i],
    }
    stateInfo.push(d)
  }
  // const database = firebase.database()
  // const ref = database.ref('States')

  for (let [i,d] of stateInfo.entries()) {
    const geoData = await getGeoData(d.name)
    const part = {
       lat: geoData.lat,
       lng: geoData.lng,
       cases: stateInfo[i].positive,
       name: stateInfo[i].name
    }
    const f = {
      name : stateInfo[i].name,
      fullName: "",
      lat: geoData.lat,
      lng: geoData.lng
    }
    // ref.push(f)

    // toFirebase.push(f)
    let circle = L.circle([part.lat, part.lng], {
     color: 'red',
     fillColor: '#f03',
     fillOpacity: 0.5,
     radius: part.cases
   }).addTo(mymap);
   circle.bindPopup(` <i> ${part.name} </i><b> ${part.cases} </b> Confirmed Cases.`);

  }
}

async function drawChart() {
  const data = await getCovidData()
  const ctx = document.getElementById('myChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: data.state,
        datasets: [
          {
            label: 'CoViD-19 Potwierdzone Przypadki',
            fill:true,
            backgroundColor: 'rgba(255, 10, 20, 0.9)',
            borderColor: 'rgb(255, 50, 25)',
            data: data.positive
        },
        {
            label: 'Liczba Wyzdrowień',
            fill:true,
            backgroundColor: 'rgba(20, 165, 50, 0.9)',
            borderColor: 'rgb(60, 50, 25)',
            data: data.recovered
        },
        {
            label: 'Liczba Hospitalizowanych',
            fill:true,
            backgroundColor: 'rgba(20, 65, 150, 0.9)',
            borderColor: 'rgb(60, 50, 25)',
            data: data.hospitalized
        },
        {
            label: 'Liczba Śmierci',
            fill:true,
            backgroundColor: 'rgba(60, 50, 25, 1)',
            borderColor: 'rgb(60, 50, 25)',
            data: data.death
        }
        ]
    }
  });
}


 function setup() {
  //  const firebaseConfig = {
  //   apiKey: "AIzaSyDPg8SYbt1HxJLl5Abc5509XlbJeiMWj_Y",
  //   authDomain: "statesusak.firebaseapp.com",
  //   databaseURL: "https://statesusak.firebaseio.com",
  //   projectId: "statesusak",
  //   storageBucket: "statesusak.appspot.com",
  //   messagingSenderId: "757324500160",
  //   appId: "1:757324500160:web:3a757b4b17e68607c43125",
  //   measurementId: "G-LQE8SEVM7D"
  // };
  //  Initialize Firebase
  // firebase.initializeApp(firebaseConfig);
  // firebase.analytics();


    mymap = L.map('mapid').setView([40.0796606, -99.4337288], 4);
   L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
     maxZoom: 18,
     id: 'mapbox/streets-v11',
     tileSize: 512,
     zoomOffset: -1,
     accessToken: 'pk.eyJ1IjoicG93ZXJ0eSIsImEiOiJjazl4YWo5ZnEwZG51M210ZTQydWs4b3Z0In0.CVm-lqH-utbrOgPiuaWF6w'
   }).addTo(mymap);

  noCanvas()
  drawChart()
  obliczenia()


}
