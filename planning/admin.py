from django.contrib import admin
from .models import *

@admin.register(Atividade)
class AtividadeAdmin(admin.ModelAdmin):
    list_display = ['numero_chamdo', 'descricao', 'disciplina', 'local', 'data_prog', 'hh_previstas', 'encarregado', 'data_criacao']
    list_filter = ['disciplina', 'data_prog', 'encarregado']
    search_fields = ['numero_chamdo', 'encarregado']