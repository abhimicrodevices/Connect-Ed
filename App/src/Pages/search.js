const localStorageKey = 'newDisplayedContactData';

document.addEventListener('DOMContentLoaded', () => {
    const displayedContactData = JSON.parse(localStorage.getItem(localStorageKey) || '[]');

    function searchContacts() {
        const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
        const filteredContacts = displayedContactData
            .map(contact => {
                const relevance = Object.values(contact).some(value => value.toLowerCase().startsWith(searchInput)) ? 1 : 0;
                return { contact, relevance };
            })
            .sort((a, b) => b.relevance - a.relevance)
            .map(item => item.contact);

        displaySearchResults(filteredContacts);
    }

    function displaySearchResults(data) {
        const tableBody = document.querySelector('#contactTable tbody');
        const tableHead = document.querySelector('#contactTable thead tr');

        tableBody.innerHTML = ''; // Clear previous results
        tableHead.innerHTML = ''; // Clear previous headers

        if (data.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('colspan', Object.keys(displayedContactData[0]).length);
            cell.textContent = 'No contacts found';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        // Create headers
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            tableHead.appendChild(th);
        });

        // Populate table body
        data.forEach(contact => {
            const row = document.createElement('tr');
            Object.values(contact).forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
    }

    function searchContactsFullName() {
        const searchInput = document.getElementById('searchInput').value.trim().toLowerCase();
        const filteredContacts = displayedContactData.filter(contact =>
            Object.values(contact).some(value => value.toLowerCase().includes(searchInput))
        );

        if (filteredContacts.length === 0) {
            displaySearchResults([]);
        } else {
            displaySearchResults(filteredContacts);
        }
    }

    // Attach the search function to the input field for real-time search
    document.getElementById('searchInput').addEventListener('input', searchContacts);
    // Attach the search function to the search button for full name search
    document.querySelector('.search__button').addEventListener('click', searchContactsFullName);

    // Initial display of contact data
    displaySearchResults(displayedContactData);
});
