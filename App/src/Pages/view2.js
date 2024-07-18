document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch data from contact.json
    function fetchDataFromJSON() {
        fetch('contact.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Load all data into the table
                loadTableData(data);
            })
            .catch(error => {
                console.error('Error fetching contact data:', error);
            });
    }

    // Function to load data into the table
    function loadTableData(data) {
        const tableBody = document.querySelector('#contactTable tbody');
        const tableHead = document.querySelector('#contactTable thead tr');

        tableBody.innerHTML = ''; // Clear existing data
        tableHead.innerHTML = ''; // Clear existing headers

        if (data.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('colspan', 5); // Assuming 5 columns in your contact data
            cell.textContent = 'No contacts found';
            cell.classList.add('no-contacts-cell');
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        // Create table headers
        Object.keys(data[0]).forEach(key => {
            if (key.toLowerCase() !== 'update') { // Skip creating header for 'Update' column
                const th = document.createElement('th');
                th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                tableHead.appendChild(th);
            }
        });

        // Create table rows
        data.forEach(contact => {
            const row = document.createElement('tr');
            Object.entries(contact).forEach(([key, value]) => {
                if (key.toLowerCase() !== 'update') { // Skip rendering 'Update' column data
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.appendChild(cell);
                }
            });
            tableBody.appendChild(row);
        });

        // Show the table
        const contactTable = document.getElementById('contactTable');
        contactTable.style.display = 'table';
    }

    // Initial fetch from contact.json
    fetchDataFromJSON();
});
