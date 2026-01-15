from django.contrib import admin
from .models import Item, ItemRequest, Review

# Register your models here.


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
	list_display = ("title", "mode", "owner", "created_at")
	list_filter = ("mode", "created_at")
	search_fields = ("title", "description", "owner__email", "owner__username")


@admin.register(ItemRequest)
class ItemRequestAdmin(admin.ModelAdmin):
	list_display = ("item", "requester", "status", "created_at")
	list_filter = ("status", "created_at")
	search_fields = ("item__title", "requester__email", "requester__username")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
	list_display = ("reviewed_user", "reviewer", "rating", "created_at")
	list_filter = ("rating", "created_at")
	search_fields = (
		"reviewed_user__email",
		"reviewed_user__username",
		"reviewer__email",
		"reviewer__username",
		"text",
	)
