from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from datetime import timedelta
from rest_framework.decorators import action


from .filters import Atividadefilter
from .models import Atividade
from .serializers import AtividadeSerializaer
from .permissions import IsAdminOrEncarregado



class AtividadeViewSet(ModelViewSet):
    
    serializer_class = AtividadeSerializaer
    permission_classes = [IsAuthenticated, IsAdminOrEncarregado]
    
    filter_backends = [DjangoFilterBackend]
    filterset_class = Atividadefilter
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin vê tudo
        if user.groups.filter(name='Admin').exists():
            return Atividade.objects.all()
        
        # Encarregado vê apenas suas atividades
        return Atividade.objects.filter(encarregado=user)
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        # 🔐 Se for encarregado, restringe campos permitidos
        if user.groups.filter(name='Encarregado').exists():
            campos_permitidos = {
                'status',
                'observacao_encarregado',
                'foto_execucao',
            }
        
            # Verifica se tentou alterar algo proibido
            for campo in request.data.keys():
                if campo not in campos_permitidos:
                    return Response(
                        {"erro": f"Você não pode alterar o campo '{campo}'."},
                        status=status.HTTP_403_FORBIDDEN
                    )
        response = super().update(request, *args, **kwargs)
    
        # 🤖 Automação: se concluir, salva data_conclusao
        instance.refresh_from_db()
        if instance.status == 'concluído' and not instance.data_conclusao:
            instance.data_conclusao = timezone.now()
            instance.save()
        
        return response
    
    @action(detail=False, methods=['get'])
    def minhas_hoje(self, request):
        user = request.user
        hoje = timezone.now().date()
        
        queryset = self.get_queryset().filter(data_prog=hoje)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    
    @action(detail=False, methods=['get'])
    def minhas_semana(self, request):
        user = request.user
        hoje = timezone.now().date()
        inicio_semana = hoje - timedelta(days=hoje.weekday())
        fim_semana = inicio_semana + timedelta(days=6)
        
        queryset = self.get_queryset().filter(
            data_prog__range=[inicio_semana, fim_semana]
        )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

# class AtividadeViewSet(ModelViewSet):
#     serializer_class = AtividadeSerializaer
#     permission_classes = [IsAuthenticated, IsAdminOrEncarregado]
    
#     def get_queryset(self):
#         user = self.request.user
        
#         # Admin vê tudo
#         if user.groups.filter(name='Admin').exists():
#             return Atividade.objects.all()
        
#         # Encarregado vê apenas suas atividades
#         return Atividade.objects.filter(encarregado=user)
    
#     def perform_update(self, serializer):
#         instance = serializer.save()
        
#         # Automação: se status virar concluído
#         if instance.status == 'concluído' and not instance.data_conclusao:
#             instance.data_conclusao = timezone.now()
#             instance.save()