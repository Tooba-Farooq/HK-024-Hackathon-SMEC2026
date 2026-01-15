from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import CustomUser

class EmailOrUsernameModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        user = CustomUser.objects.filter(
            Q(username__iexact=username) | Q(email__iexact=username)
        ).first()
        if user and user.check_password(password):
            return user
        return None
