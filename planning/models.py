from django.db import models
from django.contrib.auth.models import User

class Atividade(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('andamento', 'Andamento'),
        ('concluido', 'Concluido'),
        ('cancelado', 'Cancelado'),
    ]
    
    
    #card das atividades
    numero_chamdo = models.CharField(max_length=50)
    descricao = models.TextField()
    disciplina = models.CharField(max_length=100)
    local = models.CharField(max_length=150)
    data_prog = models.DateField()
    hh_previstas = models.DecimalField(max_digits=5, decimal_places=2)
    encarregado = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='atividades'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pendente'
    )
    
    
    #fotos
    fotos_chamado = models.ImageField(
        upload_to='solicitacoes/',
        blank=True,
        null=True
    )
    
    foto_execucao = models.ImageField(
        upload_to='execucoes/',
        blank=True,
        null=True
    )
    
    #observação
    
    observacao_admin = models.TextField(blank=True)
    observacao_encarregado = models.TextField(blank=True)
    
    data_conclusao = models.DateTimeField(blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.numero_chamdo} - {self.local}'