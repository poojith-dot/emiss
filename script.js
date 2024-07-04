const validUsername = "poojith";
const validPassword = "123";
const googleSheetUrl = "https://docs.google.com/spreadsheets/d/13xoZDCCvtwc_AXRyuGwRaxZz2ul_ska9o2p5C1xun0w/edit?usp=sharing";
const apiKey = "AIzaSyD_4939BqS3_I4X8RmaOx7AUErcbawGo6c";

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (username === validUsername && password === validPassword) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('vehicle-container').style.display = 'block';
    } else {
        errorMessage.textContent = 'Invalid username or password';
    }
}

function checkVehicle() {
    const vehicleNumber = document.getElementById('vehicle-number').value;
    fetchGoogleSheetData().then(data => {
        const row = data.find(row => row.VehicleNumber === vehicleNumber);
        if (row) {
            displayVehicleData(row);
        } else {
            document.getElementById('vehicle-data').textContent = 'Vehicle number not found';
        }
    });
}

function fetchGoogleSheetData() {
    const sheetId = '13xoZDCCvtwc_AXRyuGwRaxZz2ul_ska9o2p5C1xun0w';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1?key=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const rows = data.values.slice(1); // Skip the header row
            return rows.map(row => ({
                VehicleNumber: row[0],
                Co2: row[1],
                HC: row[2],
                CO: row[3],
                NOX: row[4]
            }));
        });
}

function displayVehicleData(row) {
    document.getElementById('vehicle-data').innerHTML = `
        <p>CO2: ${row.Co2}</p>
        <p>HC: ${row.HC}</p>
        <p>CO: ${row.CO}</p>
        <p>NOX: ${row.NOX}</p>
    `;
}
