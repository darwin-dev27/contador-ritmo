from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    ActivityViewSet, GearViewSet, RaceViewSet,
    TrainingPlanViewSet, ProviderConnectionViewSet,
    RegisterView, UserProfileView, ChangePasswordView,
)

router = DefaultRouter()
router.register(r'activities', ActivityViewSet, basename='activity')
router.register(r'gear', GearViewSet, basename='gear')
router.register(r'races', RaceViewSet, basename='race')
router.register(r'plans', TrainingPlanViewSet, basename='plan')
router.register(r'providers', ProviderConnectionViewSet, basename='provider')

urlpatterns = [
    # --- Router endpoints ---
    path('', include(router.urls)),

    # --- Auth: JWT ---
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/register/', RegisterView.as_view(), name='register'),

    # --- User profile ---
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
]
