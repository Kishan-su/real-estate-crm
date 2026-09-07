from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        SALES_EMPLOYEE = "SALES_EMPLOYEE", "Sales Employee"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.SALES_EMPLOYEE
    )

    def __str__(self):
        return self.username