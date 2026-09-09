import os
from datetime import date, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from crm.models import Lead
from properties.models import Booking, Building, Project, Unit


class Command(BaseCommand):
    help = "Create/update demo users and sample CRM data for a deployment."

    def handle(self, *args, **options):
        User = get_user_model()

        admin_password = os.getenv("DEMO_ADMIN_PASSWORD")
        sales_password = os.getenv("DEMO_SALES_PASSWORD")
        if not admin_password or not sales_password:
            self.stdout.write("Demo passwords not configured; skipping seed.")
            return

        admin, _ = User.objects.get_or_create(
            username=os.getenv("DEMO_ADMIN_USERNAME", "admin"),
            defaults={"email": "admin@example.com"},
        )
        admin.email = "admin@example.com"
        admin.role = User.Role.ADMIN
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password(admin_password)
        admin.save()

        sales, _ = User.objects.get_or_create(
            username=os.getenv("DEMO_SALES_USERNAME", "sales1"),
            defaults={"email": "sales@example.com"},
        )
        sales.email = "sales@example.com"
        sales.role = User.Role.SALES_EMPLOYEE
        sales.is_staff = False
        sales.is_superuser = False
        sales.set_password(sales_password)
        sales.save()

        project, _ = Project.objects.get_or_create(
            name="Green Valley Residency",
            defaults={
                "location": "Bengaluru",
                "description": "Demo residential apartment project.",
            },
        )
        project.location = "Bengaluru"
        project.description = "Demo residential apartment project."
        project.save()

        building_a, _ = Building.objects.get_or_create(
            project=project, name="Building A"
        )
        building_b, _ = Building.objects.get_or_create(
            project=project, name="Building B"
        )

        units = {}
        for building, number, unit_type, price in [
            (building_a, "A-101", Unit.UnitType.TWO_BHK, 4500000),
            (building_a, "A-102", Unit.UnitType.TWO_BHK, 6500000),
            (building_a, "A-103", Unit.UnitType.THREE_BHK, 8500000),
            (building_b, "B-201", Unit.UnitType.TWO_BHK, 5500000),
        ]:
            unit, _ = Unit.objects.get_or_create(
                building=building,
                unit_number=number,
                defaults={
                    "unit_type": unit_type,
                    "price": price,
                    "status": Unit.Status.AVAILABLE,
                },
            )
            units[number] = unit

        leads_data = [
            ("Rahul Sharma", "rahul@example.com", "9876543210", Lead.Stage.BOOKED, "Interested in residential property."),
            ("Priya N", "priya@example.com", "8765432109", Lead.Stage.INTERESTED, "Interested in a 2 BHK."),
            ("Kiran Kumar", "kiran@example.com", "7654321098", Lead.Stage.NEGOTIATION, "Discussing price."),
            ("Ravi", "ravi@example.com", "7349603159", Lead.Stage.SITE_VISIT, "Wants to visit the site."),
            ("Arjun Desai", "arjun@example.com", "9876543211", Lead.Stage.CONTACTED, "Discussed available 2 BHK units."),
            ("Sneha Kulkarni", "sneha@example.com", "9876543212", Lead.Stage.NEW, "Requested project details and pricing."),
        ]
        leads = {}
        for name, email, phone, stage, notes in leads_data:
            lead, _ = Lead.objects.get_or_create(
                email=email,
                defaults={
                    "name": name,
                    "phone": phone,
                    "stage": stage,
                    "assigned_to": sales,
                    "notes": notes,
                    "follow_up_date": date.today() + timedelta(days=2),
                },
            )
            leads[name] = lead

        # Create two demo bookings only if the unit is not already booked.
        for lead_name, unit_number in [("Rahul Sharma", "A-101")]:
            lead = leads[lead_name]
            unit = units[unit_number]
            booking, created = Booking.objects.get_or_create(
                unit=unit,
                defaults={"lead": lead, "booked_by": admin},
            )
            if created:
                unit.status = Unit.Status.BOOKED
                unit.save(update_fields=["status"])
                lead.stage = Lead.Stage.BOOKED
                lead.save(update_fields=["stage"])

        self.stdout.write(self.style.SUCCESS("Demo CRM data is ready."))
