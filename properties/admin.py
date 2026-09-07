from django.contrib import admin
from .models import Project, Building, Unit, Booking


admin.site.register(Project)
admin.site.register(Building)
admin.site.register(Unit)
admin.site.register(Booking)