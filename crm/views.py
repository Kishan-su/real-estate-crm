from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from rest_framework import filters, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response

from accounts.permissions import IsAdminOrSalesEmployee

from properties.models import Booking, Unit

from .models import Lead
from .serializers import LeadSerializer


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [IsAdminOrSalesEmployee]

    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "email", "phone"]

    def get_queryset(self):
        queryset = Lead.objects.all().order_by("-created_at")

        if self.request.user.role == "SALES_EMPLOYEE":
            queryset = queryset.filter(
                assigned_to=self.request.user
            )

        stage = self.request.query_params.get("stage")
        assigned_to = self.request.query_params.get("assigned_to")
        follow_up = self.request.query_params.get("follow_up")

        if stage:
            queryset = queryset.filter(stage=stage)

        if assigned_to:
            queryset = queryset.filter(
                assigned_to_id=assigned_to
            )

        today = timezone.localdate()

        if follow_up == "today":
            queryset = queryset.filter(
                follow_up_date=today
            )

        elif follow_up == "upcoming":
            queryset = queryset.filter(
                follow_up_date__gt=today
            )

        elif follow_up == "overdue":
            queryset = queryset.filter(
                follow_up_date__lt=today
            )

        return queryset

class DashboardView(APIView):
    permission_classes = [IsAdminOrSalesEmployee]

    def get(self, request):
        # Leads
        leads = Lead.objects.all()

        # Bookings
        bookings = Booking.objects.all()

        # Sales employees see only their own data
        if request.user.role == "SALES_EMPLOYEE":
            leads = leads.filter(assigned_to=request.user)
            bookings = bookings.filter(booked_by=request.user)

        # Lead stage counts
        stage_counts = {}

        for stage_value, stage_label in Lead.Stage.choices:
            stage_counts[stage_label] = leads.filter(
                stage=stage_value
            ).count()

        # Follow-ups from today onwards
        today = timezone.localdate()

        upcoming_followups = leads.filter(
            follow_up_date__gte=today
        ).order_by("follow_up_date")[:5]

        followups = []

        for lead in upcoming_followups:
            followups.append({
                "id": lead.id,
                "name": lead.name,
                "phone": lead.phone,
                "stage": lead.get_stage_display(),
                "follow_up_date": lead.follow_up_date,
            })

        # Property availability
        available_units = Unit.objects.filter(
            status=Unit.Status.AVAILABLE
        ).count()

        booked_units = Unit.objects.filter(
            status=Unit.Status.BOOKED
        ).count()

        return Response({
            "total_leads": leads.count(),
            "total_bookings": bookings.count(),
            "available_units": available_units,
            "booked_units": booked_units,
            "stage_counts": stage_counts,
            "upcoming_followups": followups,
        })

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "role": request.user.role,
        })