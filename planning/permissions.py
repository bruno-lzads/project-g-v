from rest_framework.permissions import BasePermission

"""
Validando acesso ao OBJETO específico
obejto: Atividades
Admin acessa tudo
Encarregado acessa as próprias atividades
"""


class IsAdminOrEncarregado(BasePermission):
    
    def has_object_permission(self, request, view, obj):
        
        #Admin pode tude
        if request.user.groups.filter(name='Admin').exists():
            return True
        
        # Encarregado só pode acessar as próprias atividades
        if request.user.groups.filter(name="Encarregado").exists():
            return obj.encarregado == request.user    
        return False