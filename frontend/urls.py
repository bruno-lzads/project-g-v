from django.urls import path
from .views import login_view, encarregado_dashboard

urlpatterns = [
    path('', login_view, name='login'),
    path('encarregado/', encarregado_dashboard, name='encarregado'),
]