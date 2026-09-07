from django.conf import settings
from django.db import models

from crm.models import Lead


class Project(models.Model):
    name = models.CharField(max_length=150)
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Building(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="buildings"
    )

    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.project.name} - {self.name}"


class Unit(models.Model):

    class UnitType(models.TextChoices):
        ONE_BHK = "1BHK", "1 BHK"
        TWO_BHK = "2BHK", "2 BHK"
        THREE_BHK = "3BHK", "3 BHK"

    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        BOOKED = "BOOKED", "Booked"

    building = models.ForeignKey(
        Building,
        on_delete=models.CASCADE,
        related_name="units"
    )

    unit_number = models.CharField(max_length=20)
    unit_type = models.CharField(
        max_length=10,
        choices=UnitType.choices
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.AVAILABLE
    )

    def __str__(self):
        return self.unit_number


class Booking(models.Model):
    lead = models.ForeignKey(
        Lead,
        on_delete=models.PROTECT,
        related_name="bookings"
    )

    unit = models.OneToOneField(
        Unit,
        on_delete=models.PROTECT,
        related_name="booking"
    )

    booked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="bookings"
    )

    booked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.lead.name} - {self.unit.unit_number}"