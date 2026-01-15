from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import CustomUser, Item, Review

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = ("username", "email", "password1", "password2")

    def clean_email(self):
        email = self.cleaned_data.get("email")
        if CustomUser.objects.filter(email=email).exists():
            raise forms.ValidationError("This email is already registered.")
        return email

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class ItemForm(forms.ModelForm):
    class Meta:
        model = Item
        fields = ("title", "description", "image", "mode")
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control", "placeholder": "e.g. DSLR Camera"}),
            "description": forms.Textarea(attrs={"class": "form-control", "rows": 3, "placeholder": "Short description"}),
            "mode": forms.Select(attrs={"class": "form-select"}),
        }

    image = forms.ImageField(required=False)


class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        fields = ("rating", "text")
        widgets = {
            "rating": forms.Select(
                choices=[(i, str(i)) for i in range(1, 6)],
                attrs={"class": "form-select"},
            ),
            "text": forms.Textarea(
                attrs={"class": "form-control", "rows": 4, "placeholder": "Optional review"},
            ),
        }

