"""URL configuration for the EstateFlow project."""

from django.contrib import admin
from django.urls import include, path
from django.views.generic import RedirectView
from .views import dashboard, leads, properties, bookings, health


urlpatterns = [

    path("", RedirectView.as_view(url="/accounts/login/", permanent=False)),

    path("health/", health, name="health"),

    path("admin/", admin.site.urls),

    path(
        "accounts/",
        include("accounts.urls")
    ),

    path(
        "dashboard/",
        dashboard,
        name="dashboard"
    ),

    path(
        "leads/",
        leads,
        name="leads"
    ),

    path(
        "properties/",
        properties,
        name="properties"
    ),

    path(
        "bookings/",
        bookings,
        name="bookings"
    ),

    path(
        "api/",
        include("crm.urls")
    ),

    path(
        "api/",
        include("properties.urls")
    ),
]