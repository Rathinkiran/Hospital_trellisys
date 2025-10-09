$(document).ready(function () {
  const API_BASE = "http://localhost:8080";

  $.ajax({
    url: `${API_BASE}/hospital/list-all-Hospitals`,
    method: "GET",
    success: function (res) {
      if (res.status && res.data.length) {
        const list = $("#hospitalList");
        list.empty();
        res.data.forEach(hosp => {
          const card = `
            <div class="hospital-card" data-id="${hosp.id}">
              <i class="fa-solid fa-hospital fa-2x"></i>
              <h3>${hosp.name}</h3>
              <p>${hosp.address}</p>
            </div>`;
          list.append(card);
        });

        $(".hospital-card").on("click", function () {
          const hospitalId = $(this).data("id");
          // Store hospital_id in sessionStorage
          sessionStorage.setItem("selectedHospitalId", hospitalId);
          window.location.href = `login.html?hospital_id=${hospitalId}`;
        });
      }
    },
    error: function (err) {
      console.error("Failed to load hospitals:", err);
      alert("Unable to load hospital list");
    }
  });
});
