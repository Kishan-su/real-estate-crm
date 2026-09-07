let bookingModal;

let bookingLeads = [];
let bookingProjects = [];
let bookingBuildings = [];
let bookingUnits = [];


document.addEventListener("DOMContentLoaded", () => {

    bookingModal = new bootstrap.Modal(
        document.getElementById("bookingModal")
    );


    document
        .getElementById("booking-form")
        .addEventListener(
            "submit",
            saveBooking
        );


    document
        .getElementById("booking-project")
        .addEventListener(
            "change",
            loadBookingBuildings
        );


    document
        .getElementById("booking-building")
        .addEventListener(
            "change",
            loadBookingUnits
        );


    loadBookings();
});


/* =========================
   LOAD BOOKINGS
========================= */

async function loadBookings() {

    try {

        const response =
            await fetch("/api/bookings/");

        if (!response.ok) {
            throw new Error(
                "Unable to load bookings."
            );
        }

        const data =
            await response.json();

        renderBookings(data);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "bookings-table"
        ).innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-message"
                >
                    Unable to load bookings.
                </td>
            </tr>
        `;
    }
}


/* =========================
   RENDER BOOKINGS
========================= */

function renderBookings(bookings) {

    const table =
        document.getElementById(
            "bookings-table"
        );


    document.getElementById(
        "total-bookings"
    ).textContent = bookings.length;


    document.getElementById(
        "booked-units"
    ).textContent = bookings.length;


    const uniqueLeads =
        new Set(
            bookings.map(
                booking => booking.lead
            )
        );


    document.getElementById(
        "booked-leads"
    ).textContent =
        uniqueLeads.size;


    if (bookings.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-message"
                >
                    No bookings found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        bookings.map(
            booking => {

                const date =
                    booking.booked_at
                        ? new Date(
                            booking.booked_at
                        ).toLocaleDateString(
                            "en-IN"
                        )
                        : "—";


                return `
    <tr>

        <td>
            <strong>
                ${booking.lead_name}
            </strong>
        </td>

        <td>
            ${booking.unit_number}
        </td>

        <td>
            ${new Intl.NumberFormat(
                "en-IN",
                {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0
                }
            ).format(booking.unit_price)}
        </td>

        <td>
            ${booking.booked_by_name}
        </td>

        <td>
            ${date}
        </td>

    </tr>
`;

            }
        ).join("");
}


/* =========================
   OPEN BOOKING MODAL
========================= */

async function openBookingModal() {

    document
        .getElementById("booking-form")
        .reset();


    document
        .getElementById("booking-error")
        .classList.add("d-none");


    resetBookingSelects();


    try {

        await Promise.all([
            loadBookingLeads(),
            loadBookingProjects()
        ]);

        bookingModal.show();

    } catch (error) {

        console.error(error);

        showBookingError(
            "Unable to load booking information."
        );

        bookingModal.show();
    }
}


/* =========================
   LOAD LEADS
========================= */

async function loadBookingLeads() {

    const response =
        await fetch("/api/leads/");

    if (!response.ok) {
        throw new Error(
            "Unable to load leads."
        );
    }


    bookingLeads =
        await response.json();


    const select =
        document.getElementById(
            "booking-lead"
        );


    select.innerHTML = `
        <option value="">
            Select a lead
        </option>
    `;


    bookingLeads
        .filter(
            lead =>
                lead.stage !== "BOOKED" &&
                lead.stage !== "LOST"
        )
        .forEach(lead => {

            select.innerHTML += `
                <option value="${lead.id}">
                    ${lead.name} — ${lead.phone}
                </option>
            `;
        });
}


/* =========================
   LOAD PROJECTS
========================= */

async function loadBookingProjects() {

    const response =
        await fetch("/api/projects/");

    if (!response.ok) {
        throw new Error(
            "Unable to load projects."
        );
    }


    bookingProjects =
        await response.json();


    const select =
        document.getElementById(
            "booking-project"
        );


    select.innerHTML = `
        <option value="">
            Select a project
        </option>
    `;


    bookingProjects.forEach(
        project => {

            select.innerHTML += `
                <option value="${project.id}">
                    ${project.name}
                </option>
            `;
        }
    );
}


/* =========================
   LOAD BUILDINGS
========================= */

async function loadBookingBuildings() {

    const projectId =
        document.getElementById(
            "booking-project"
        ).value;


    const buildingSelect =
        document.getElementById(
            "booking-building"
        );


    const unitSelect =
        document.getElementById(
            "booking-unit"
        );


    unitSelect.innerHTML = `
        <option value="">
            Select a unit
        </option>
    `;

    unitSelect.disabled = true;


    if (!projectId) {

        buildingSelect.innerHTML = `
            <option value="">
                Select a building
            </option>
        `;

        buildingSelect.disabled = true;

        return;
    }


    try {

        const response =
            await fetch(
                `/api/buildings/?project=${projectId}`
            );


        if (!response.ok) {
            throw new Error(
                "Unable to load buildings."
            );
        }


        bookingBuildings =
            await response.json();


        buildingSelect.innerHTML = `
            <option value="">
                Select a building
            </option>
        `;


        bookingBuildings.forEach(
            building => {

                buildingSelect.innerHTML += `
                    <option value="${building.id}">
                        ${building.name}
                    </option>
                `;
            }
        );


        buildingSelect.disabled = false;

    } catch (error) {

        console.error(error);

        showBookingError(
            "Unable to load buildings."
        );
    }
}


/* =========================
   LOAD AVAILABLE UNITS
========================= */

async function loadBookingUnits() {

    const buildingId =
        document.getElementById(
            "booking-building"
        ).value;


    const unitSelect =
        document.getElementById(
            "booking-unit"
        );


    unitSelect.innerHTML = `
        <option value="">
            Select a unit
        </option>
    `;


    unitSelect.disabled = true;


    if (!buildingId) {
        return;
    }


    try {

        const response =
            await fetch("/api/units/");


        if (!response.ok) {
            throw new Error(
                "Unable to load units."
            );
        }


        const data =
            await response.json();


        bookingUnits =
            data.filter(
                unit =>
                    unit.building == buildingId &&
                    unit.status === "AVAILABLE"
            );


        if (bookingUnits.length === 0) {

            unitSelect.innerHTML = `
                <option value="">
                    No available units
                </option>
            `;

            return;
        }


        bookingUnits.forEach(
            unit => {

                const price =
                    new Intl.NumberFormat(
                        "en-IN",
                        {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 0
                        }
                    ).format(unit.price);


                unitSelect.innerHTML += `
                    <option value="${unit.id}">
                        ${unit.unit_number}
                        — ${unit.unit_type}
                        — ${price}
                    </option>
                `;
            }
        );


        unitSelect.disabled = false;

    } catch (error) {

        console.error(error);

        showBookingError(
            "Unable to load available units."
        );
    }
}


/* =========================
   SAVE BOOKING
========================= */

async function saveBooking(event) {

    event.preventDefault();


    const leadId =
        document.getElementById(
            "booking-lead"
        ).value;


    const unitId =
        document.getElementById(
            "booking-unit"
        ).value;


    if (!leadId || !unitId) {

        showBookingError(
            "Please select a lead and an available unit."
        );

        return;
    }


    const csrfToken =
        document.querySelector(
            'meta[name="csrf-token"]'
        ).content;


    const payload = {

        lead: leadId,

        unit: unitId
    };


    try {

        const response =
            await fetch(
                "/api/bookings/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "X-CSRFToken":
                            csrfToken
                    },

                    body:
                        JSON.stringify(payload)
                }
            );


        if (!response.ok) {

            const data =
                await response.json();

            throw new Error(
                getBookingError(data)
            );
        }


        bookingModal.hide();


        await loadBookings();


        alert(
            "Booking created successfully."
        );

    } catch (error) {

        console.error(error);

        showBookingError(
            error.message
        );
    }
}


/* =========================
   RESET SELECTS
========================= */

function resetBookingSelects() {

    document.getElementById(
        "booking-lead"
    ).innerHTML = `
        <option value="">
            Select a lead
        </option>
    `;


    document.getElementById(
        "booking-project"
    ).innerHTML = `
        <option value="">
            Select a project
        </option>
    `;


    document.getElementById(
        "booking-building"
    ).innerHTML = `
        <option value="">
            Select a building
        </option>
    `;


    document.getElementById(
        "booking-unit"
    ).innerHTML = `
        <option value="">
            Select a unit
        </option>
    `;


    document.getElementById(
        "booking-building"
    ).disabled = true;


    document.getElementById(
        "booking-unit"
    ).disabled = true;
}


/* =========================
   ERROR MESSAGE
========================= */

function showBookingError(message) {

    const errorBox =
        document.getElementById(
            "booking-error"
        );


    errorBox.textContent = message;

    errorBox.classList.remove(
        "d-none"
    );
}


/* =========================
   API ERROR HANDLER
========================= */

function getBookingError(data) {

    if (typeof data === "string") {
        return data;
    }


    const messages = [];


    Object.entries(data).forEach(
        ([field, errors]) => {

            if (Array.isArray(errors)) {

                messages.push(
                    `${field}: ${errors.join(", ")}`
                );

            } else if (
                typeof errors === "string"
            ) {

                messages.push(
                    `${field}: ${errors}`
                );
            }

        }
    );


    return messages.join(" | ")
        || "Unable to create booking.";
}