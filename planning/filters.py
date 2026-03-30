import django_filters #app de terceiros
from django.utils import timezone
from .models import Atividade

class Atividadefilter(django_filters.FilterSet):
    
    data_inicio = django_filters.DateFilter(
        field_name='data_prog',
        lookup_expr='gte'
    )
    
    data_fim = django_filters.DateFilter(
        field_name='data_prog',
        lookup_expr='lte'
    )
    
    atrasadas = django_filters.BooleanFilter(method='filtrar_atrasadas')
    
    def filtrar_atrasadas(self, queryset, name, value):
        if value:
            hoje = timezone.now().date()
            return queryset.filter(
                data_prog__lt=hoje,
                status__in=['pendente', 'andamento']
            )
        return queryset
    
    class Meta:
        model = Atividade
        fields = ['status', 'encarregado']