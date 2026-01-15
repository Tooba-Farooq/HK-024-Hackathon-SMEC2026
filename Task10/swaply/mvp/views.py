from django.db import IntegrityError
from django.db.models import Avg, Count, Exists, OuterRef
from django.http import HttpResponseBadRequest
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils.http import url_has_allowed_host_and_scheme
from .forms import CustomUserCreationForm, ItemForm, ReviewForm
from .models import Item, ItemRequest, Review

# Create your views here.

def signup(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("mvp:login")
    else:
        form = CustomUserCreationForm()
    return render(request, "registration/signup.html", {"form": form})

@login_required
def dashboard(request):
    mode = request.GET.get("mode")
    items = (
        Item.objects.exclude(owner=request.user)
        .select_related("owner")
        .order_by("-created_at")
    )
    if mode in (Item.MODE_RENT, Item.MODE_SWAP):
        items = items.filter(mode=mode)

    return render(request, "mvp/dashboard.html", {"items": items, "mode": mode})

@login_required
def profile(request):
    return render(request, "mvp/profile.html")


def _redirect_next_or(request, fallback_url_name, **fallback_kwargs):
    next_url = request.POST.get("next") or request.GET.get("next")
    if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
        return redirect(next_url)
    return redirect(fallback_url_name, **fallback_kwargs)


@login_required
def my_items(request):
    mode = request.GET.get("mode")
    items = Item.objects.filter(owner=request.user).order_by("-created_at")
    if mode in (Item.MODE_RENT, Item.MODE_SWAP):
        items = items.filter(mode=mode)

    if request.method == "POST":
        form = ItemForm(request.POST, request.FILES)
        if form.is_valid():
            item = form.save(commit=False)
            item.owner = request.user
            item.save()
            return redirect("mvp:my_items")
    else:
        form = ItemForm()

    return render(
        request,
        "mvp/my_items.html",
        {
            "items": items,
            "item_form": form,
            "mode": mode,
        },
    )


@login_required
def my_requests(request):
    my_requests_pending = (
        ItemRequest.objects.filter(
            requester=request.user,
            status=ItemRequest.STATUS_PENDING,
        )
        .select_related("item", "item__owner")
        .order_by("-created_at")
    )

    my_requests_completed = (
        ItemRequest.objects.filter(
            requester=request.user,
            status__in=[ItemRequest.STATUS_ACCEPTED, ItemRequest.STATUS_REJECTED],
        )
        .select_related("item", "item__owner")
        .annotate(
            has_review=Exists(Review.objects.filter(item_request=OuterRef("pk"))),
        )
        .order_by("-created_at")
    )

    return render(
        request,
        "mvp/my_requests.html",
        {
            "my_requests_pending": my_requests_pending,
            "my_requests_completed": my_requests_completed,
        },
    )


@login_required
def requests_on_my_items(request):
    incoming_requests = (
        ItemRequest.objects.filter(
            item__owner=request.user,
            status=ItemRequest.STATUS_PENDING,
        )
        .select_related("item", "requester")
        .order_by("-created_at")
    )

    completed_transactions = (
        ItemRequest.objects.filter(
            item__owner=request.user,
            status__in=[ItemRequest.STATUS_ACCEPTED, ItemRequest.STATUS_REJECTED],
        )
        .select_related("item", "requester")
        .order_by("-created_at")
    )

    return render(
        request,
        "mvp/requests_on_my_items.html",
        {
            "incoming_requests": incoming_requests,
            "completed_transactions": completed_transactions,
        },
    )


@login_required
def reviews(request):
    rating_stats = Review.objects.filter(reviewed_user=request.user).aggregate(
        rating_avg=Avg("rating"),
        rating_count=Count("id"),
    )
    reviews_received = (
        Review.objects.filter(reviewed_user=request.user)
        .select_related("reviewer", "item_request__item")
        .order_by("-created_at")[:10]
    )

    return render(
        request,
        "mvp/reviews.html",
        {
            "rating_avg": rating_stats.get("rating_avg"),
            "rating_count": rating_stats.get("rating_count"),
            "reviews_received": reviews_received,
        },
    )


@login_required
def item_edit(request, item_id):
    item = get_object_or_404(Item, id=item_id, owner=request.user)
    if request.method == "POST":
        form = ItemForm(request.POST, request.FILES, instance=item)
        if form.is_valid():
            form.save()
            return _redirect_next_or(request, "mvp:my_items")
    else:
        form = ItemForm(instance=item)

    return render(request, "mvp/item_form.html", {"form": form, "item": item})


@login_required
def item_delete(request, item_id):
    item = get_object_or_404(Item, id=item_id, owner=request.user)
    if request.method == "POST":
        item.delete()
        return _redirect_next_or(request, "mvp:my_items")

    return render(request, "mvp/item_confirm_delete.html", {"item": item})


@login_required
def item_detail(request, item_id):
    item = get_object_or_404(Item.objects.select_related("owner"), id=item_id)
    return render(request, "mvp/item_detail.html", {"item": item})


@login_required
def item_request(request, item_id):
    item = get_object_or_404(Item, id=item_id)
    if item.owner_id == request.user.id:
        return HttpResponseBadRequest("You can't request your own item.")
    if request.method != "POST":
        return HttpResponseBadRequest("Invalid request method.")

    created = False
    try:
        ItemRequest.objects.create(item=item, requester=request.user, status=ItemRequest.STATUS_PENDING)
        created = True
    except IntegrityError:
        # Duplicate request due to unique constraint.
        created = False

    if created:
        messages.success(request, "Request sent to item owner")
    else:
        messages.info(request, "Request already sent")

    next_url = request.POST.get("next")
    if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
        return redirect(next_url)
    return redirect("mvp:item_detail", item_id=item.id)


@login_required
def request_accept(request, request_id):
    if request.method != "POST":
        return HttpResponseBadRequest("Invalid request method.")

    req = get_object_or_404(
        ItemRequest.objects.select_related("item", "requester"),
        id=request_id,
        item__owner=request.user,
    )
    if req.status != ItemRequest.STATUS_PENDING:
        messages.info(request, "That request is already processed")
        return _redirect_next_or(request, "mvp:requests_on_my_items")

    req.status = ItemRequest.STATUS_ACCEPTED
    req.save(update_fields=["status"])
    messages.success(request, "Request accepted")
    return _redirect_next_or(request, "mvp:requests_on_my_items")


@login_required
def request_reject(request, request_id):
    if request.method != "POST":
        return HttpResponseBadRequest("Invalid request method.")

    req = get_object_or_404(
        ItemRequest.objects.select_related("item", "requester"),
        id=request_id,
        item__owner=request.user,
    )
    if req.status != ItemRequest.STATUS_PENDING:
        messages.info(request, "That request is already processed")
        return _redirect_next_or(request, "mvp:requests_on_my_items")

    req.status = ItemRequest.STATUS_REJECTED
    req.save(update_fields=["status"])
    messages.success(request, "Request rejected")
    return _redirect_next_or(request, "mvp:requests_on_my_items")


@login_required
def leave_review(request, request_id):
    item_request = get_object_or_404(
        ItemRequest.objects.select_related("item", "item__owner", "requester"),
        id=request_id,
    )
    if item_request.requester_id != request.user.id:
        return HttpResponseBadRequest("You can only review your own requests.")
    if item_request.status != ItemRequest.STATUS_ACCEPTED:
        return HttpResponseBadRequest("You can only review accepted requests.")

    # Prevent duplicates (also enforced by OneToOneField).
    if hasattr(item_request, "review"):
        messages.info(request, "You already left a review for this transaction")
        return _redirect_next_or(request, "mvp:my_requests")

    if request.method == "POST":
        form = ReviewForm(request.POST)
        if form.is_valid():
            review = form.save(commit=False)
            review.item_request = item_request
            review.reviewed_user = item_request.item.owner
            review.reviewer = request.user
            review.save()
            messages.success(request, "Thanks! Your review was submitted")

            next_url = request.POST.get("next")
            if next_url and url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
                return redirect(next_url)
            return redirect("mvp:item_detail", item_id=item_request.item_id)
    else:
        form = ReviewForm()

    return render(
        request,
        "mvp/review_form.html",
        {
            "form": form,
            "item": item_request.item,
            "reviewed_user": item_request.item.owner,
            "item_request": item_request,
        },
    )