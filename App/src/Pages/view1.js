document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch data from contact.json
    function fetchDataFromJSON() {
        fetch('contact.json')
            .then(response => response.json())
            .then(data => {
                // Load all data into the table
                loadTableData(data);

                // Display only newly added data
                displayNewlyAddedData(data);
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
            cell.setAttribute('colspan', Object.keys(data[0]).length); // Adjust colspan dynamically
            cell.textContent = 'No contacts found';
            cell.classList.add('no-contacts-cell');
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        // Create table headers excluding 'Update' column
        Object.keys(data[0]).forEach(key => {
            if (key.toLowerCase() !== 'update') { // Skip 'Update' column
                const th = document.createElement('th');
                th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
                tableHead.appendChild(th);
            }
        });

        // Create table rows excluding 'Update' column
        data.forEach(contact => {
            const row = document.createElement('tr');
            Object.entries(contact).forEach(([key, value]) => {
                if (key.toLowerCase() !== 'update') { // Skip 'Update' column
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

    // Function to display only newly added data
    function displayNewlyAddedData(newData) {
        const previousData = JSON.parse(localStorage.getItem('previousContactData') || '[]');

        // Compare newData with previousData to find newly added items
        const newlyAddedData = newData.filter(newItem => {
            return !previousData.some(oldItem => oldItem.id === newItem.id); // Assuming id is unique
        });

        // If there are newly added items, show the table; otherwise, hide it
        const contactListTable = document.querySelector('.contact-list');
        const table = document.querySelector('#contactTable');

        if (newlyAddedData.length > 0) {
            contactListTable.style.display = 'block';
            table.style.display = 'table'; // Ensure the table is displayed

            // Load only newly added data into the table
            loadTableData(newlyAddedData);
        } else {
            contactListTable.style.display = 'none';
            table.style.display = 'none'; // Hide the table if no new data
        }

        // Store current newData in localStorage as previousData for future comparison
        localStorage.setItem('previousContactData', JSON.stringify(newData));
    }

    // Initial fetch from contact.json
    fetchDataFromJSON();
});
