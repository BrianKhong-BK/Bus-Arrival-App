//Declaration
const arrivalListHeader = document.getElementById('tableHead');
const arrivalList = document.getElementById('tableBody');
const busStopIdInput = document.getElementById('busStopIdInput');
const busStopName = document.getElementById('busStopName');
const busStopID = document.getElementById('busStopID');
const errorMessage = document.getElementById('errorMessage');
let map;
let marker;
let refreshInterval;

//Fetch data from map API (leaflet)
async function fetchMapData(lat, long) {
    map = L.map('map').setView([lat, long], 17);
    marker = L.marker([lat, long]).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
}

//Fetch data from SG bus API
async function fetchBusStopData(busStopId) {
  const response = await fetch(
    `https://sg-bus-arrivals.vercel.app/?id=${busStopId}`
  );

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Error fetching bus arrival data');
  }
}

//Fetch data from SG bus API v1 with name, lat and long data
async function fetchBusStopInfo() {
  const response = await fetch('https://data.busrouter.sg/v1/stops.json');

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Error fetching bus stop info');
  }
}

//Function to overwrite table content
function getArrivalData(busData) {
  arrivalList.innerHTML = busData
      .map(
        (info) => `
    <tr>
      <td>${info.bus_no}</td>
      <td>${info.operator}</td>
      <td>${info.next_bus_mins > 0 ? `${info.next_bus_mins} minutes` : 'Arrived'}</td>
    </tr>
    `
      )
      .join('');
}

//Main function
async function displayArrival() {
  const isFiveNumber = busStopIdInput.value.length <= 5;
  const isPositive = busStopIdInput.value > 0

  //Verify input
  if (isFiveNumber && isPositive) {
    const busData = await fetchBusStopData(busStopIdInput.value);
    const busInfo = await fetchBusStopInfo();
    errorMessage.innerHTML = ""
    //To detect for API response
    if (busData.hasOwnProperty('response')) {
      errorMessage.innerHTML = busData.response;
    } else {
      const lat = busInfo[busStopIdInput.value][1];
      const long = busInfo[busStopIdInput.value][0];
      
      //To clear map variable if there is any data
      if (map){
        map.remove();
        map = null;
      }
      
      await fetchMapData(lat, long);
      busStopName.innerHTML = busInfo[busStopIdInput.value][2];
      busStopID.innerHTML = busStopIdInput.value;
      arrivalListHeader.innerHTML = `
        <th>Bus No</th>
        <th>Operator</th>
        <th>Arrival</th>
      `;
      
      getArrivalData(busData.services)

      //Update table content every 10s
      clearInterval(refreshInterval);
      refreshInterval = setInterval(async() => {
        const busData = await fetchBusStopData(busStopID.innerHTML);
        getArrivalData(busData.services);
      }, 10000);
    }
  } else { 
    errorMessage.innerHTML = `<h5 class="text-center" style="color: red;">Please enter a valid bus stop ID</h5>`
    busStopIdInput.value = ""
  }
}

