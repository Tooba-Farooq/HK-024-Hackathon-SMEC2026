from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required

app_name = 'mvp'

urlpatterns = [
    path('', login_required(views.dashboard), name='dashboard'),

    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='login'), name='logout'),
    path('signup/', views.signup, name='signup'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('profile/', views.profile, name='profile'),

    # Profile sub-pages
    path('my-items/', views.my_items, name='my_items'),
    path('my-requests/', views.my_requests, name='my_requests'),
    path('requests-on-my-items/', views.requests_on_my_items, name='requests_on_my_items'),
    path('reviews/', views.reviews, name='reviews'),

    # Public-ish item pages (still login required for MVP)
    path('items/<int:item_id>/', views.item_detail, name='item_detail'),
    path('items/<int:item_id>/request/', views.item_request, name='item_request'),

    # Incoming request actions (only item owner)
    path('requests/<int:request_id>/accept/', views.request_accept, name='request_accept'),
    path('requests/<int:request_id>/reject/', views.request_reject, name='request_reject'),

    # Reviews (requester can review after accepted)
    path('requests/<int:request_id>/review/', views.leave_review, name='leave_review'),

    # Item CRUD (only for logged-in owner's items)
    path('items/<int:item_id>/edit/', views.item_edit, name='item_edit'),
    path('items/<int:item_id>/delete/', views.item_delete, name='item_delete'),

]