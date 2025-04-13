document.addEventListener("DOMContentLoaded", () => {
  // Check if admin is logged in
  const isAdmin = sessionStorage.getItem("hourglassAdmin");

  if (!isAdmin) {
    // If admin is not logged in, display a message and stop further execution
    document.body.innerHTML =
      "<h1 style='text-align: center; color: red;'>Admin is not logged in</h1>";
    return;
  }

  // If admin is logged in, proceed with loading the dashboard
  const tableBody = document.querySelector("#requestTable tbody");

  // Fetch data from the API
  async function fetchRequestHistory() {
    try {
      const response = await fetch(
        "https://hourglass-corp-server.onrender.com/get-request-history"
      );
      const data = await response.json();
      populateTable(data.message.reverse());
      // Check if the response is empty and display a message
      if (data.message.length === 0) {
        tableBody.innerHTML =
          "<tr><td colspan='6' style='text-align: center;'>No request history available.</td></tr>";
      }
    } catch (error) {
      console.error("Error fetching request history:", error);
    }
  }

  // Populate the table with data
  function populateTable(data) {
    tableBody.innerHTML = ""; // Clear existing rows
    data.forEach((item) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.phone}</td>
        <td>${item.service}</td>
        <td>${item.category || "N/A"}</td>
        <td>
          <select class="status-dropdown" data-id="${item.id}">
            <option value="pending" ${
              item.status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="approved" ${
              item.status === "approved" ? "selected" : ""
            }>Approved</option>
            <option value="declined" ${
              item.status === "declined" ? "selected" : ""
            }>Declined</option>
          </select>
        </td>
      `;

      tableBody.appendChild(row);
    });

    // Add event listeners to dropdowns
    document.querySelectorAll(".status-dropdown").forEach((dropdown) => {
      dropdown.addEventListener("change", handleStatusChange);
    });
  }

  // Handle status change
  async function handleStatusChange(event) {
    const dropdown = event.target;
    const id = dropdown.getAttribute("data-id");
    const newStatus = dropdown.value;

    try {
      const response = await fetch(
        `https://hourglass-corp-server.onrender.com/edit-request-status/${id}/${newStatus}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        alert("Status updated successfully!");
      } else {
        alert("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("An error occurred while updating the status.");
    }
  }

  // Initialize the dashboard
  fetchRequestHistory();
});
// Add event listener to the logout button
document.getElementById("logoutButton").addEventListener("click", () => {
  sessionStorage.removeItem("hourglassAdmin");
  window.location.href = "/index.html";
});
