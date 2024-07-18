document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector("body");
    const modeToggle = body.querySelector(".mode-toggle");
    const sidebar = body.querySelector("nav");
    const sidebarToggle = body.querySelector(".sidebar-toggle");

    let getMode = localStorage.getItem("mode");
    if (getMode && getMode === "dark") {
        body.classList.toggle("dark");
    }

    let getStatus = localStorage.getItem("status");
    if (getStatus && getStatus === "close") {
        sidebar.classList.toggle("close");
    }

    modeToggle.addEventListener("click", () => {
        body.classList.toggle("dark");
        if (body.classList.contains("dark")) {
            localStorage.setItem("mode", "dark");
        } else {
            localStorage.setItem("mode", "light");
        }
    });

    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("close");
        if (sidebar.classList.contains("close")) {
            localStorage.setItem("status", "close");
        } else {
            localStorage.setItem("status", "open");
        }
    });

    const notifications = ['notification1', 'notification2', 'notification3'];

    notifications.forEach((id, index) => {
        const notification = document.getElementById(id);

        setTimeout(() => {
            notification.classList.add('visible');
        }, index * 1000);

        setTimeout(() => {
            notification.classList.remove('visible');
            notification.classList.add('hidden');
        }, (index * 1000) + 5000);
    });

    function dismissNotification(id) {
        const notification = document.getElementById(id);
        notification.classList.remove('visible');
        notification.classList.add('hidden');
    }

    // Fetch data from contact.json and display with Update column
    fetch('contact.json')
        .then(response => response.json())
        .then(data => {
            displayedContactData = data;
            displaySearchResults(data); // Include Update column
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    function displaySearchResults(data) {
        const tableBody = document.querySelector('#contactTable tbody');
        const tableHead = document.querySelector('#contactTable thead tr');

        tableBody.innerHTML = '';
        tableHead.innerHTML = '';

        if (data.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('colspan', 4); // Assuming 4 columns in your contact data
            cell.textContent = 'No contacts found';
            cell.classList.add('no-contacts-cell');
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }

        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            tableHead.appendChild(th);
        });

        const updateHeader = document.createElement('th');
        updateHeader.textContent = 'Update';
        tableHead.appendChild(updateHeader);

        data.forEach((contact, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-index', index);

            Object.entries(contact).forEach(([key, value]) => {
                const cell = document.createElement('td');
                cell.textContent = value;
                cell.setAttribute('data-key', key);
                row.appendChild(cell);
            });

            const updateCell = document.createElement('td');
            const updateButton = document.createElement('button');
            updateButton.classList.add('update-button');
            updateButton.textContent = 'Update';
            updateButton.addEventListener('click', () => openUpdateContactModal(index, data));
            updateCell.appendChild(updateButton);
            row.appendChild(updateCell);

            tableBody.appendChild(row);
        });
    }

    function openUpdateContactModal(index, data) {
        const modal = document.getElementById("updateContactModal");
        const contact = data[index];

        document.getElementById("updatePhone").value = contact.phone;
        document.getElementById("updateEmail").value = contact.email;
        document.getElementById("updateAddress").value = contact.address;
        document.getElementById("saveContactButton").dataset.index = index;

        modal.style.display = "block";
    }

    document.getElementById("saveContactButton").addEventListener("click", () => {
        const index = document.getElementById("saveContactButton").dataset.index;
        const newPhoneNumber = document.getElementById("updatePhone").value;
        const newEmail = document.getElementById("updateEmail").value;
        const newAddress = document.getElementById("updateAddress").value;

        if (newPhoneNumber && newEmail && newAddress) {
            // Perform update action on the server
            // Here you typically send the updated data to a server for persistence
            // This example just logs the updated data
            console.log('Updated contact data:', { newPhoneNumber, newEmail, newAddress });

            // Update displayedContactData with new values
            displayedContactData[index].phone = newPhoneNumber;
            displayedContactData[index].email = newEmail;
            displayedContactData[index].address = newAddress;

            // Update history report with the update information
            updateHistoryReport(displayedContactData[index].name, 'updated the data');

            // Update table row
            const row = document.querySelector(`tr[data-index="${index}"]`);
            const phoneCell = row.querySelector('td[data-key="phone"]');
            const emailCell = row.querySelector('td[data-key="email"]');
            const addressCell = row.querySelector('td[data-key="address"]');

            if (phoneCell) phoneCell.textContent = newPhoneNumber;
            if (emailCell) emailCell.textContent = newEmail;
            if (addressCell) addressCell.textContent = newAddress;

            closeModal();
        } else {
            console.error('Invalid phone number, email, or address');
        }
    });

    function closeModal() {
        const modal = document.getElementById("updateContactModal");
        modal.style.display = "none";
    }

    document.getElementsByClassName("close")[0].addEventListener("click", closeModal);

    window.addEventListener("click", (event) => {
        const modal = document.getElementById("updateContactModal");
        if (event.target === modal) {
            closeModal();
        }
    });

    const searchInput = document.getElementById('searchInput');

    // Show the table when the search input is focused
    searchInput.addEventListener('focus', () => {
        document.getElementById('contactTable').style.display = 'table'; // Show the table
    });

    // Add event listener to perform search on input change
    searchInput.addEventListener('input', searchContacts);

    function searchContacts() {
        const searchInputValue = searchInput.value.trim().toLowerCase();
        const filteredContacts = displayedContactData.filter(contact =>
            Object.values(contact).some(value => value.toLowerCase().includes(searchInputValue))
        );

        const prioritizedContacts = filteredContacts.sort((a, b) => {
            const aStartsWith = Object.values(a).some(value => value.toLowerCase().startsWith(searchInputValue));
            const bStartsWith = Object.values(b).some(value => value.toLowerCase().startsWith(searchInputValue));

            if (aStartsWith && !bStartsWith) {
                return -1;
            } else if (!aStartsWith && bStartsWith) {
                return 1;
            } else {
                return 0;
            }
        });

        displaySearchResults(prioritizedContacts);

        // Save the search term and result count
        if (searchInputValue) {
            saveSearchTerm(searchInputValue, filteredContacts.length);
        }
    }

    // Function to save search term
    function saveSearchTerm(term, resultCount) {
        const recentSearches = JSON.parse(localStorage.getItem('recentsearches1')) || [];
        const date = new Date().toISOString().split('T')[0];
        recentSearches.push({ term, date, resultCount });

        // Ensure we don't store too many search terms
        if (recentSearches.length > 10) {
            recentSearches.shift(); // Remove the oldest search term
        }

        localStorage.setItem('recentsearches1', JSON.stringify(recentSearches));
    }

    // Function to update history report
    function updateHistoryReport(fullName, action) {
        const historyReport = JSON.parse(localStorage.getItem('historyReport')) || [];

        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        const formattedTime = `${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;

        const updateDetails = `${fullName} ${action}`;
        historyReport.push({ date: formattedDate, time: formattedTime, details: updateDetails });

        localStorage.setItem('historyReport', JSON.stringify(historyReport));
    }
});
