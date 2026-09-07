function toggleSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const mainContent = document.querySelector(".main-content");

    if (!sidebar) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Mobile: open / close sidebar
        sidebar.classList.toggle("show");
    } else {
        // Desktop: collapse / expand sidebar
        sidebar.classList.toggle("collapsed");

        if (mainContent) {
            mainContent.classList.toggle("sidebar-collapsed");
        }
    }
}

function logout() {
    window.location.href = "/accounts/logout/";
}


document.addEventListener("DOMContentLoaded", function () {

    const currentPath = window.location.pathname;

    const navLinks = document.querySelectorAll(".sidebar .nav-link");

    navLinks.forEach(function (link) {

        const href = link.getAttribute("href");

        if (
            href &&
            href !== "/accounts/logout/" &&
            currentPath.startsWith(href)
        ) {
            link.classList.add("active");
        }

    });

});