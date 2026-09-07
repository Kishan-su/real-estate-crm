from rest_framework import viewsets
from rest_framework.permissions import SAFE_METHODS

from accounts.permissions import (
    IsAdmin,
    IsAdminOrSalesEmployee,
)

from .models import Project, Building, Unit, Booking
from .serializers import (
    ProjectSerializer,
    BuildingSerializer,
    UnitSerializer,
    BookingSerializer,
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by("name")
    serializer_class = ProjectSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAdminOrSalesEmployee()]

        return [IsAdmin()]


class BuildingViewSet(viewsets.ModelViewSet):
    serializer_class = BuildingSerializer

    def get_queryset(self):
        queryset = Building.objects.all().order_by("name")

        project = self.request.query_params.get("project")

        if project:
            queryset = queryset.filter(project_id=project)

        return queryset

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAdminOrSalesEmployee()]

        return [IsAdmin()]


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all().order_by("unit_number")
    serializer_class = UnitSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsAdminOrSalesEmployee()]

        return [IsAdmin()]


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAdminOrSalesEmployee]

    # Booking records cannot be edited or deleted
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        queryset = Booking.objects.select_related(
            "lead",
            "unit",
            "booked_by"
        ).order_by("-booked_at")

        # Sales employees see only their own bookings
        if self.request.user.role == "SALES_EMPLOYEE":
            queryset = queryset.filter(
                booked_by=self.request.user
            )

        return queryset