from django.shortcuts import render


def login_view(request):
    return render(request, "login.html")


def encarregado_dashboard(request):
    return render(request, "encarregado_dashboard.html")