from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required(login_url="/accounts/login/")
def dashboard(request):
    return render(request, "dashboard.html")


@login_required(login_url="/accounts/login/")
def leads(request):
    return render(request, "leads.html")


@login_required(login_url="/accounts/login/")
def properties(request):
    return render(request, "properties.html")


@login_required(login_url="/accounts/login/")
def bookings(request):
    return render(request, "bookings.html")

def health(request):
    from django.http import JsonResponse
    return JsonResponse({"status": "ok"})
