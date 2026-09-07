from django.conf import settings
from django.db import models


class Lead(models.Model):

    class Stage(models.TextChoices):
        NEW = "NEW", "New"
        CONTACTED = "CONTACTED", "Contacted"
        SITE_VISIT = "SITE_VISIT", "Site Visit"
        INTERESTED = "INTERESTED", "Interested"
        NEGOTIATION = "NEGOTIATION", "Negotiation"
        BOOKED = "BOOKED", "Booked"
        LOST = "LOST", "Lost"

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    stage = models.CharField(
        max_length=20,
        choices=Stage.choices,
        default=Stage.NEW
    )

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads"
    )

    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name