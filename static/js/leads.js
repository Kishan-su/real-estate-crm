let allLeads = [];

let leadModal;


document.addEventListener("DOMContentLoaded", () => {

    leadModal = new bootstrap.Modal(
        document.getElementById("leadModal")
    );

    loadLeads();

    document
        .getElementById("search-input")
        .addEventListener("input", loadLeads);

    document
        .getElementById("stage-filter")
        .addEventListener("change", loadLeads);

    document
        .getElementById("followup-filter")
        .addEventListener("change", loadLeads);

    document
        .getElementById("lead-form")
        .addEventListener("submit", saveLead);

});


async function loadLeads() {

    const search =
        document.getElementById("search-input").value;

    const stage =
        document.getElementById("stage-filter").value;

    const followup =
        document.getElementById("followup-filter").value;


    const params = new URLSearchParams();

    if (search) {
        params.append("search", search);
    }

    if (stage) {
        params.append("stage", stage);
    }

    if (followup) {
        params.append("follow_up", followup);
    }


    try {

        const response =
            await fetch(`/api/leads/?${params.toString()}`);

        if (!response.ok) {
            throw new Error("Unable to load leads.");
        }

        const data = await response.json();

        allLeads = data;

        renderLeads(data);

    } catch (error) {

        console.error(error);

        document.getElementById("leads-table").innerHTML = `
            <tr>
                <td colspan="6" class="table-message">
                    Unable to load leads.
                </td>
            </tr>
        `;
    }
}


function renderLeads(leads) {

    const table =
        document.getElementById("leads-table");


    if (leads.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6" class="table-message">
                    No leads found.
                </td>
            </tr>
        `;

        return;
    }


    table.innerHTML = leads.map(
        (lead) => {

            const assignedName =
    lead.assigned_to_name || "Unassigned";


            return `
                <tr>

                    <td>

                        <div class="lead-name">
                            ${lead.name}
                        </div>

                        <div class="lead-email">
                            ${lead.email}
                        </div>

                    </td>


                    <td>
                        ${lead.phone}
                    </td>


                    <td>

                        <span class="stage-badge">
                            ${formatStage(lead.stage)}
                        </span>

                    </td>


                    <td>
                        ${assignedName}
                    </td>


                    <td>
                        ${lead.follow_up_date || "—"}
                    </td>


                    <td class="text-end">

    <button
        class="action-btn me-1"
        onclick="viewLead(${lead.id})"
        title="View"
    >
        <i class="bi bi-eye"></i>
    </button>

    <button
        class="action-btn"
        onclick="editLead(${lead.id})"
        title="Edit"
    >
        <i class="bi bi-pencil"></i>
    </button>

</td>

                </tr>
            `;
        }
    ).join("");
}


function formatStage(stage) {

    const labels = {
        NEW: "New",
        CONTACTED: "Contacted",
        SITE_VISIT: "Site Visit",
        INTERESTED: "Interested",
        NEGOTIATION: "Negotiation",
        BOOKED: "Booked",
        LOST: "Lost"
    };

    return labels[stage] || stage;
}


function openLeadModal() {

    document.getElementById("lead-modal-title")
        .textContent = "Add Lead";

    document.getElementById("lead-form")
        .reset();

    document.getElementById("lead-id")
        .value = "";

    hideFormError();

    leadModal.show();
}


async function editLead(id) {

    try {

        const response =
            await fetch(`/api/leads/${id}/`);

        if (!response.ok) {
            throw new Error("Unable to load lead.");
        }

        const lead = await response.json();


        document.getElementById("lead-modal-title")
            .textContent = "Edit Lead";

        document.getElementById("lead-id")
            .value = lead.id;

        document.getElementById("lead-name")
            .value = lead.name;

        document.getElementById("lead-email")
            .value = lead.email;

        document.getElementById("lead-phone")
            .value = lead.phone;

        document.getElementById("lead-stage")
            .value = lead.stage;

        document.getElementById("lead-followup")
            .value = lead.follow_up_date || "";

        document.getElementById("lead-notes")
            .value = lead.notes || "";

        hideFormError();

        leadModal.show();

    } catch (error) {

        console.error(error);

        alert("Unable to load lead.");
    }
}


async function saveLead(event) {

    event.preventDefault();

    hideFormError();


    const id =
        document.getElementById("lead-id").value;


    const payload = {

        name:
            document.getElementById("lead-name").value,

        email:
            document.getElementById("lead-email").value,

        phone:
            document.getElementById("lead-phone").value,

        stage:
            document.getElementById("lead-stage").value,

        follow_up_date:
            document.getElementById("lead-followup").value || null,

        notes:
            document.getElementById("lead-notes").value

    };


    const url = id
        ? `/api/leads/${id}/`
        : "/api/leads/";


    const method = id
        ? "PUT"
        : "POST";


    const button =
        document.getElementById("save-lead-btn");

    button.disabled = true;

    button.textContent = "Saving...";


    try {

        const csrfToken =
    document.querySelector('meta[name="csrf-token"]').content;


const response = await fetch(url, {

    method: method,

    headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken
    },

    body: JSON.stringify(payload)

});


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                getErrorMessage(data)
            );
        }


        leadModal.hide();

        await loadLeads();

    } catch (error) {

        showFormError(error.message);

    } finally {

        button.disabled = false;

        button.textContent = "Save Lead";
    }
}


function getErrorMessage(data) {

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

            } else if (typeof errors === "string") {

                messages.push(
                    `${field}: ${errors}`
                );

            }
        }
    );

    return messages.join(" | ")
        || "Something went wrong.";
}


function showFormError(message) {

    const error =
        document.getElementById("form-error");

    error.textContent = message;

    error.classList.remove("d-none");
}


function hideFormError() {

    document
        .getElementById("form-error")
        .classList.add("d-none");
}


function resetFilters() {

    document.getElementById("search-input")
        .value = "";

    document.getElementById("stage-filter")
        .value = "";

    document.getElementById("followup-filter")
        .value = "";

    loadLeads();
}

async function viewLead(id) {

    try {

        const response =
            await fetch(`/api/leads/${id}/`);

        if (!response.ok) {
            throw new Error("Unable to load lead.");
        }

        const lead = await response.json();


        document.getElementById("view-name")
            .textContent = lead.name;

        document.getElementById("view-email")
            .textContent = lead.email;

        document.getElementById("view-phone")
            .textContent = lead.phone;

        document.getElementById("view-stage")
            .textContent = formatStage(lead.stage);

        document.getElementById("view-assigned")
            .textContent =
                lead.assigned_to_name || "Unassigned";

        document.getElementById("view-followup")
            .textContent =
                lead.follow_up_date || "No follow-up scheduled";

        document.getElementById("view-notes")
            .textContent =
                lead.notes || "No notes added.";


        const modal = new bootstrap.Modal(
            document.getElementById("viewLeadModal")
        );

        modal.show();

    } catch (error) {

        console.error(error);

        alert("Unable to load lead.");
    }
}