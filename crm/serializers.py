from rest_framework import serializers

from .models import Lead
from accounts.models import User


class LeadSerializer(serializers.ModelSerializer):

    assigned_to_name = serializers.CharField(
        source="assigned_to.username",
        read_only=True
    )

    class Meta:
        model = Lead
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "stage",
            "assigned_to",
            "assigned_to_name",
            "notes",
            "follow_up_date",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "assigned_to_name",
        ]

    def validate_phone(self, value):
        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )

        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must be between 10 and 15 digits."
            )

        return value

    def validate_assigned_to(self, value):
        request = self.context["request"]

        if value.role != User.Role.SALES_EMPLOYEE:
            raise serializers.ValidationError(
                "Lead can only be assigned to a Sales Employee."
            )

        if request.user.role == User.Role.SALES_EMPLOYEE:
            if value.id != request.user.id:
                raise serializers.ValidationError(
                    "You can only assign leads to yourself."
                )

        return value

    def create(self, validated_data):
        request = self.context["request"]

        if request.user.role == User.Role.SALES_EMPLOYEE:
            validated_data["assigned_to"] = request.user

        return Lead.objects.create(**validated_data)