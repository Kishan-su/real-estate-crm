from rest_framework.routers import DefaultRouter

from .views import (
    ProjectViewSet,
    BuildingViewSet,
    UnitViewSet,
    BookingViewSet,
)


router = DefaultRouter()

router.register("projects", ProjectViewSet, basename="project")
router.register("buildings", BuildingViewSet, basename="building")
router.register("units", UnitViewSet, basename="unit")
router.register("bookings", BookingViewSet, basename="booking")

urlpatterns = router.urls