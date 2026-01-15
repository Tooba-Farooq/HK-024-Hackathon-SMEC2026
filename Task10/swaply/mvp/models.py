from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.email


class Item(models.Model):
    MODE_RENT = "rent"
    MODE_SWAP = "swap"
    MODE_CHOICES = [
        (MODE_RENT, "Rent"),
        (MODE_SWAP, "Swap"),
    ]

    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="items")
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="items/", blank=True, null=True)
    mode = models.CharField(max_length=10, choices=MODE_CHOICES, default=MODE_SWAP)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.mode})"


class ItemRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_REJECTED = "rejected"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_REJECTED, "Rejected"),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="requests")
    requester = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="requests")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["item", "requester"], name="uniq_request_per_item_per_user"),
        ]

    def __str__(self):
        return f"{self.requester_id} -> {self.item_id} ({self.status})"


class Review(models.Model):
    item_request = models.OneToOneField(ItemRequest, on_delete=models.CASCADE, related_name="review")
    reviewed_user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="reviews_received")
    reviewer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="reviews_written")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating}/5 by {self.reviewer_id} for {self.reviewed_user_id}"
