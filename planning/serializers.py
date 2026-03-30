from rest_framework import serializers
from .models import Atividade

class AtividadeSerializaer(serializers.ModelSerializer):
    
    class Meta:
        model = Atividade
        fields = '__all__'
        # read_only_fields = ['data_criacao', 'data_conclusao']