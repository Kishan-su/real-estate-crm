document.addEventListener("DOMContentLoaded", loadDashboard);


async function loadDashboard() {

    try {

        const response = await fetch("/api/dashboard/");

        if (!response.ok) {
            throw new Error("Unable to load dashboard.");
        }

        const data = await response.json();

        updateStats(data);
        updatePipeline(data.stage_counts);
        updateFollowups(data.upcoming_followups);

    } catch (error) {

        console.error(error);

        document.getElementById("lead-pipeline").innerHTML = `
            <div class="empty-state">
                Unable to load dashboard data.
            </div>
        `;

        document.getElementById("followups").innerHTML = `
            <div class="empty-state">
                Unable to load follow-ups.
            </div>
        `;
    }
}


function updateStats(data) {

    document.getElementById("total-leads").textContent =
        data.total_leads;

    document.getElementById("total-bookings").textContent =
        data.total_bookings;

    document.getElementById("available-units").textContent =
        data.available_units;

    document.getElementById("booked-units").textContent =
        data.booked_units;
}


function updatePipeline(stageCounts) {

    const container =
        document.getElementById("lead-pipeline");

    const stages = Object.entries(stageCounts);

    const total = stages.reduce(
        (sum, [, count]) => sum + count,
        0
    );

    if (stages.length === 0 || total === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No leads available.
            </div>
        `;

        return;
    }


    container.innerHTML = stages.map(
        ([stage, count]) => {

            const percentage =
                total > 0
                    ? (count / total) * 100
                    : 0;

            return `
                <div class="pipeline-row">

                    <div class="pipeline-info">
                        <span>${stage}</span>
                        <strong>${count}</strong>
                    </div>

                    <div class="pipeline-bar">
                        <div
                            class="pipeline-fill"
                            style="width: ${percentage}%"
                        ></div>
                    </div>

                </div>
            `;
        }
    ).join("");
}


function updateFollowups(followups) {

    const container =
        document.getElementById("followups");

    if (!followups || followups.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No upcoming follow-ups.
            </div>
        `;

        return;
    }


    container.innerHTML = followups.map(
        (lead) => {

            return `
                <div class="followup-item">

                    <div>
                        <div class="followup-name">
                            ${lead.name}
                        </div>

                        <div class="followup-stage">
                            ${lead.stage}
                        </div>
                    </div>

                    <div class="followup-date">
                        ${lead.follow_up_date}
                    </div>

                </div>
            `;
        }
    ).join("");
}