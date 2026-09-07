let projects = [];
let buildings = [];
let units = [];
let currentUser = null;

let projectModal;
let buildingModal;
let unitModal;

async function loadCurrentUser() {

    try {

        const response =
            await fetch("/api/me/");

        if (!response.ok) {
            return;
        }

        currentUser =
            await response.json();

        applyRolePermissions();

    } catch (error) {

        console.error(
            "Unable to load current user.",
            error
        );
    }
}

function applyRolePermissions() {

    if (!currentUser) {
        return;
    }


    const isAdmin =
        currentUser.role === "ADMIN";


    const addProjectButton =
        document.querySelector(
            '[onclick="openProjectModal()"]'
        );


    const addBuildingButton =
        document.querySelector(
            '[onclick="openBuildingModal()"]'
        );


    const addUnitButton =
        document.querySelector(
            '[onclick="openUnitModal()"]'
        );


    if (!isAdmin) {

        if (addProjectButton) {
            addProjectButton.style.display = "none";
        }

        if (addBuildingButton) {
            addBuildingButton.style.display = "none";
        }

        if (addUnitButton) {
            addUnitButton.style.display = "none";
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {

    projectModal = new bootstrap.Modal(
        document.getElementById("projectModal")
    );

    buildingModal = new bootstrap.Modal(
        document.getElementById("buildingModal")
    );

    unitModal = new bootstrap.Modal(
        document.getElementById("unitModal")
    );


    document
        .getElementById("project-filter")
        .addEventListener(
            "change",
            loadProjectData
        );


    document
        .getElementById("project-form")
        .addEventListener(
            "submit",
            saveProject
        );


    document
        .getElementById("building-form")
        .addEventListener(
            "submit",
            saveBuilding
        );


    document
        .getElementById("unit-form")
        .addEventListener(
            "submit",
            saveUnit
        );


    loadCurrentUser();
loadProjects();
});


async function loadProjects() {

    try {

        const response =
            await fetch("/api/projects/");

        if (!response.ok) {
            throw new Error(
                "Unable to load projects."
            );
        }

        projects = await response.json();

        renderProjects();

    } catch (error) {

        console.error(error);

        document.getElementById(
            "project-filter"
        ).innerHTML = `
            <option value="">
                Unable to load projects
            </option>
        `;
    }
}


function renderProjects() {

    const select =
        document.getElementById(
            "project-filter"
        );


    if (projects.length === 0) {

        select.innerHTML = `
            <option value="">
                No projects available
            </option>
        `;

        return;
    }


    select.innerHTML = `
        <option value="">
            Select a project
        </option>
    `;


    projects.forEach(project => {

        select.innerHTML += `
            <option value="${project.id}">
                ${project.name} — ${project.location}
            </option>
        `;
    });
}


async function loadProjectData() {

    const projectId =
        document.getElementById(
            "project-filter"
        ).value;


    if (!projectId) {

        document.getElementById(
            "selected-project-name"
        ).textContent = "—";

        buildings = [];
        units = [];

        document.getElementById(
            "buildings-container"
        ).innerHTML = "";

        document.getElementById(
            "units-table"
        ).innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-message"
                >
                    Select a project to view units.
                </td>
            </tr>
        `;

        return;
    }


    const project =
        projects.find(
            item => item.id == projectId
        );


    if (project) {

        document.getElementById(
            "selected-project-name"
        ).textContent = project.name;
    }


    // IMPORTANT:
    // Load buildings first.
    // Units depend on the building IDs.
    await loadBuildings(projectId);

    // Only after buildings are loaded,
    // load the units.
    await loadUnits(projectId);
}


async function loadBuildings(projectId) {

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

        buildings = await response.json();

        renderBuildings();

    } catch (error) {

        console.error(error);

        buildings = [];

        document.getElementById(
            "buildings-container"
        ).innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    Unable to load buildings.
                </div>
            </div>
        `;
    }
}


function renderBuildings() {

    const container =
        document.getElementById(
            "buildings-container"
        );


    if (buildings.length === 0) {

        container.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    No buildings found.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        buildings.map(building => {

            const buildingUnits =
                units.filter(
                    unit =>
                        unit.building == building.id
                );


            const available =
                buildingUnits.filter(
                    unit =>
                        unit.status === "AVAILABLE"
                ).length;


            return `
                <div class="col-md-6 col-xl-4">

                    <div class="building-card">

                        <div class="building-icon">
                            <i class="bi bi-building"></i>
                        </div>

                        <div>

                            <h5>
                                ${building.name}
                            </h5>

                            <p>
                                ${buildingUnits.length}
                                Units
                            </p>

                        </div>

                        <div class="building-availability">
                            ${available} Available
                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


async function loadUnits(projectId) {

    try {

        const response =
            await fetch(
                "/api/units/"
            );

        if (!response.ok) {
            throw new Error(
                "Unable to load units."
            );
        }

        const data = await response.json();


        // Get the building IDs belonging
        // to the selected project.
        const projectBuildings =
            buildings.map(
                building => building.id
            );


        // Only keep units belonging
        // to those buildings.
        units = data.filter(
            unit =>
                projectBuildings.includes(
                    unit.building
                )
        );


        // Now that units are loaded,
        // render buildings again so that
        // their unit counts are correct.
        renderBuildings();

        renderUnits();

    } catch (error) {

        console.error(error);

        units = [];

        document.getElementById(
            "units-table"
        ).innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-message"
                >
                    Unable to load units.
                </td>
            </tr>
        `;
    }
}


function renderUnits() {

    const table =
        document.getElementById(
            "units-table"
        );


    if (units.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="table-message"
                >
                    No units found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML =
        units.map(unit => {

            const building =
                buildings.find(
                    item =>
                        item.id == unit.building
                );


            const statusClass =
                unit.status === "AVAILABLE"
                    ? "status-available"
                    : "status-booked";


            const statusText =
                unit.status === "AVAILABLE"
                    ? "Available"
                    : "Booked";


            const price =
                new Intl.NumberFormat(
                    "en-IN",
                    {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0
                    }
                ).format(unit.price);


            return `
                <tr>

                    <td>
                        <strong>
                            ${unit.unit_number}
                        </strong>
                    </td>

                    <td>
                        ${building
                            ? building.name
                            : "—"}
                    </td>

                    <td>
                        ${unit.unit_type}
                    </td>

                    <td>
                        ${price}
                    </td>

                    <td>
                        <span
                            class="property-status
                            ${statusClass}"
                        >
                            ${statusText}
                        </span>
                    </td>

                </tr>
            `;

        }).join("");
}


function openProjectModal() {

    document
        .getElementById("project-form")
        .reset();

    projectModal.show();
}


function openBuildingModal() {

    const projectId =
        document.getElementById(
            "project-filter"
        ).value;


    if (!projectId) {

        alert(
            "Please select a project first."
        );

        return;
    }


    document
        .getElementById("building-form")
        .reset();

    buildingModal.show();
}


function openUnitModal() {

    const projectId =
        document.getElementById(
            "project-filter"
        ).value;


    if (!projectId) {

        alert(
            "Please select a project first."
        );

        return;
    }


    const form =
        document.getElementById(
            "unit-form"
        );


    // Reset first.
    form.reset();


    const select =
        document.getElementById(
            "unit-building"
        );


    // Then populate the building dropdown.
    select.innerHTML =
        buildings.map(
            building => `
                <option value="${building.id}">
                    ${building.name}
                </option>
            `
        ).join("");


    unitModal.show();
}


async function saveProject(event) {

    event.preventDefault();


    const csrfToken =
        document.querySelector(
            'meta[name="csrf-token"]'
        ).content;


    const payload = {

        name:
            document.getElementById(
                "project-name"
            ).value,

        location:
            document.getElementById(
                "project-location"
            ).value,

        description:
            document.getElementById(
                "project-description"
            ).value
    };


    try {

        const response =
            await fetch(
                "/api/projects/",
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
                getPropertyError(data)
            );
        }


        projectModal.hide();

        await loadProjects();

    } catch (error) {

        alert(error.message);
    }
}


async function saveBuilding(event) {

    event.preventDefault();


    const projectId =
        document.getElementById(
            "project-filter"
        ).value;


    const csrfToken =
        document.querySelector(
            'meta[name="csrf-token"]'
        ).content;


    const payload = {

        project: projectId,

        name:
            document.getElementById(
                "building-name"
            ).value
    };


    try {

        const response =
            await fetch(
                "/api/buildings/",
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
                getPropertyError(data)
            );
        }


        buildingModal.hide();

        await loadProjectData();

    } catch (error) {

        alert(error.message);
    }
}


async function saveUnit(event) {

    event.preventDefault();


    const csrfToken =
        document.querySelector(
            'meta[name="csrf-token"]'
        ).content;


    const payload = {

        building:
            document.getElementById(
                "unit-building"
            ).value,

        unit_number:
            document.getElementById(
                "unit-number"
            ).value,

        unit_type:
            document.getElementById(
                "unit-type"
            ).value,

        price:
            document.getElementById(
                "unit-price"
            ).value
    };


    try {

        const response =
            await fetch(
                "/api/units/",
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
                getPropertyError(data)
            );
        }


        unitModal.hide();

        await loadProjectData();

    } catch (error) {

        alert(error.message);
    }
}


function getPropertyError(data) {

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

            }

        }
    );


    return messages.join(" | ")
        || "Something went wrong.";
}