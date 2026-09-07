from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    LeadViewSet,
    DashboardView,
    CurrentUserView,
)


router = DefaultRouter()

router.register(
    "leads",
    LeadViewSet,
    basename="lead"
)


urlpatterns = [

    path(
    "dashboard/",
    DashboardView.as_view(),
    name="dashboard-api"
),

    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user"
    ),

] + router.urls