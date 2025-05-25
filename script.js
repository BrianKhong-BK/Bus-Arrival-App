const arrivalListHeader = document.getElementById('tableHead');
const arrivalList = document.getElementById('tableBody');
const busStopIdInput = document.getElementById('busStopIdInput');
const busStopName = document.getElementById('busStopName');
let map;
let marker;

async function fetchMapData(lat, long) {
    map = L.map('map').setView([lat, long], 17);
    marker = L.marker([lat, long]).addTo(map)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
}

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
async function fetchBusStopInfo() {
  const response = await fetch('https://data.busrouter.sg/v1/stops.json');

  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Error fetching bus stop info');
  }
}

async function displayArrival() {
  const regex = /[A-Za-z]/;
  if (busStopIdInput.value.length <= 5 && !regex.test(busStopIdInput.value)) {
    const busData = await fetchBusStopData(busStopIdInput.value);
    const busInfo = await fetchBusStopInfo();
    const lat = busInfo[busStopIdInput.value][1];
    const long = busInfo[busStopIdInput.value][0];
    busStopName.innerHTML = '';
    arrivalList.innerHTML = '';

    if (busData.hasOwnProperty('response')) {
      console.log(busData.response);
    } else {
      if (map){
        map.remove();
        map = null;
      }
      
      await fetchMapData(lat, long);
      busStopName.innerHTML = busInfo[busStopIdInput.value][2];
      arrivalListHeader.innerHTML = `
        <th>Bus No</th>
        <th>Operator</th>
        <th>Arrival</th>
      `;
      arrivalList.innerHTML = busData.services
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
  } else {
    alert(
      'Please enter a valid bus stop ID\n-contain only 5 digit\n-does not have any alphabet'
    );
  }
}
