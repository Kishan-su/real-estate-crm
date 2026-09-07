from django.db import IntegrityError, transaction
from rest_framework import serializers
from crm.models import Lead
from .models import Project, Building, Unit, Booking


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["id", "name", "location", "description"]


class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = ["id", "project", "name"]


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = [
            "id",
            "building",
            "unit_number",
            "unit_type",
            "price",
            "status",
        ]
        read_only_fields = ["id"]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price must be greater than zero."
            )
        return value


class BookingSerializer(serializers.ModelSerializer):

    lead_name = serializers.CharField(
        source="lead.name",
        read_only=True
    )

    unit_number = serializers.CharField(
        source="unit.unit_number",
        read_only=True
    )

    unit_price = serializers.DecimalField(
        source="unit.price",
        max_digits=12,
        decimal_places=2,
        read_only=True
    )

    booked_by_name = serializers.CharField(
        source="booked_by.username",
        read_only=True
    )


    class Meta:

        model = Booking

        fields = [
            "id",

            "lead",
            "lead_name",

            "unit",
            "unit_number",
            "unit_price",

            "booked_by",
            "booked_by_name",

            "booked_at",
        ]

        read_only_fields = [
            "id",
            "booked_by",
            "booked_by_name",
            "booked_at",
            "lead_name",
            "unit_number",
            "unit_price",
        ]


    def validate(self, attrs):

        request = self.context["request"]

        lead = attrs["lead"]


        if request.user.role == "SALES_EMPLOYEE":

            if lead.assigned_to_id != request.user.id:

                raise serializers.ValidationError({
                    "lead":
                        "You can only book your assigned leads."
                })


        return attrs


    def create(self, validated_data):

        request = self.context["request"]

        lead = validated_data["lead"]

        unit_id = validated_data["unit"].id


        try:

            with transaction.atomic():

                unit = (
                    Unit.objects
                    .select_for_update()
                    .get(id=unit_id)
                )


                if unit.status != Unit.Status.AVAILABLE:

                    raise serializers.ValidationError({
                        "unit":
                            "This unit is already booked."
                    })


                booking = Booking.objects.create(
                    lead=lead,
                    unit=unit,
                    booked_by=request.user
                )


                unit.status = Unit.Status.BOOKED

                unit.save(
                    update_fields=["status"]
                )


                lead.stage = Lead.Stage.BOOKED

                lead.save(
                    update_fields=["stage"]
                )


                return booking


        except IntegrityError:

            raise serializers.ValidationError({
                "unit":
                    "This unit has already been booked."
            })