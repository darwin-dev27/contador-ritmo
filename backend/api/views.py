from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.db.models import Sum, Avg, Count, Max, Min, Q, F
from django.db.models.functions import TruncWeek, TruncMonth
from django.utils import timezone
from datetime import timedelta
from django_filters.rest_framework import DjangoFilterBackend
import django_filters

from .models import (
    Activity, Lap, HeartRateZone, Gear,
    Race, TrainingPlan, ProviderConnection
)
from .serializers import (
    ActivityListSerializer, ActivityDetailSerializer, ActivityCreateSerializer,
    LapSerializer, HeartRateZoneSerializer, GearSerializer,
    RaceSerializer, TrainingPlanSerializer,
    ProviderConnectionSerializer, ProviderConnectionCreateSerializer,
    UserSerializer, UserRegistrationSerializer,
)


# =============================================================================
# FILTROS PERSONALIZADOS
# =============================================================================
class ActivityFilter(django_filters.FilterSet):
    date_from = django_filters.DateTimeFilter(field_name='start_time', lookup_expr='gte')
    date_to = django_filters.DateTimeFilter(field_name='start_time', lookup_expr='lte')
    min_distance = django_filters.NumberFilter(field_name='distance', lookup_expr='gte')
    max_distance = django_filters.NumberFilter(field_name='distance', lookup_expr='lte')
    min_duration = django_filters.DurationFilter(field_name='elapsed_time', lookup_expr='gte')
    max_duration = django_filters.DurationFilter(field_name='elapsed_time', lookup_expr='lte')

    class Meta:
        model = Activity
        fields = ['sport_type', 'sub_sport', 'source', 'completed', 'gear', 'plan']


# =============================================================================
# USER REGISTRATION
# =============================================================================
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# ACTIVITY VIEWSET
# =============================================================================
class ActivityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ActivityFilter
    search_fields = ['name', 'description']
    ordering_fields = [
        'start_time', 'distance', 'elapsed_time', 'avg_heart_rate',
        'calories', 'feeling', 'created_at'
    ]
    ordering = ['-start_time']

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user).select_related('gear', 'plan')

    def get_serializer_class(self):
        if self.action == 'list':
            return ActivityListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ActivityCreateSerializer
        return ActivityDetailSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # --- Laps de una actividad ---
    @action(detail=True, methods=['get'])
    def laps(self, request, pk=None):
        activity = self.get_object()
        laps = activity.laps.all()
        serializer = LapSerializer(laps, many=True)
        return Response(serializer.data)

    # --- HR Zones de una actividad ---
    @action(detail=True, methods=['get'], url_path='hr-zones')
    def hr_zones(self, request, pk=None):
        activity = self.get_object()
        zones = activity.hr_zones.all()
        serializer = HeartRateZoneSerializer(zones, many=True)
        return Response(serializer.data)

    # --- Estadísticas globales ---
    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.filter_queryset(self.get_queryset())

        # Stats generales
        general = queryset.aggregate(
            total_activities=Count('id'),
            total_distance=Sum('distance'),
            total_elapsed_time=Sum('elapsed_time'),
            total_moving_time=Sum('moving_time'),
            total_calories=Sum('calories'),
            total_ascent=Sum('total_ascent'),
            avg_heart_rate=Avg('avg_heart_rate'),
            avg_feeling=Avg('feeling'),
        )

        # Stats por deporte
        by_sport = queryset.values('sport_type').annotate(
            count=Count('id'),
            total_distance=Sum('distance'),
            total_time=Sum('elapsed_time'),
            total_calories=Sum('calories'),
            avg_hr=Avg('avg_heart_rate'),
            avg_speed=Avg('avg_speed'),
        ).order_by('sport_type')

        # Convertir durations a segundos para JSON
        if general['total_elapsed_time']:
            general['total_elapsed_time_seconds'] = int(general['total_elapsed_time'].total_seconds())
        else:
            general['total_elapsed_time_seconds'] = 0

        if general['total_moving_time']:
            general['total_moving_time_seconds'] = int(general['total_moving_time'].total_seconds())
        else:
            general['total_moving_time_seconds'] = 0

        # Convertir por deporte
        sport_stats = []
        for s in by_sport:
            entry = dict(s)
            if entry['total_time']:
                entry['total_time_seconds'] = int(entry['total_time'].total_seconds())
            else:
                entry['total_time_seconds'] = 0
            sport_stats.append(entry)

        return Response({
            'general': general,
            'by_sport': sport_stats,
        })

    # --- Resumen semanal ---
    @action(detail=False, methods=['get'], url_path='stats/weekly')
    def stats_weekly(self, request):
        weeks = int(request.query_params.get('weeks', 8))
        since = timezone.now() - timedelta(weeks=weeks)

        queryset = self.get_queryset().filter(start_time__gte=since)

        weekly = queryset.annotate(
            week=TruncWeek('start_time')
        ).values('week').annotate(
            total_activities=Count('id'),
            total_distance=Sum('distance'),
            total_time=Sum('elapsed_time'),
            total_calories=Sum('calories'),
            avg_feeling=Avg('feeling'),
        ).order_by('week')

        result = []
        for w in weekly:
            entry = dict(w)
            if entry['total_time']:
                entry['total_time_seconds'] = int(entry['total_time'].total_seconds())
            else:
                entry['total_time_seconds'] = 0
            result.append(entry)

        return Response(result)

    # --- Resumen mensual ---
    @action(detail=False, methods=['get'], url_path='stats/monthly')
    def stats_monthly(self, request):
        months = int(request.query_params.get('months', 12))
        since = timezone.now() - timedelta(days=months * 30)

        queryset = self.get_queryset().filter(start_time__gte=since)

        monthly = queryset.annotate(
            month=TruncMonth('start_time')
        ).values('month').annotate(
            total_activities=Count('id'),
            total_distance=Sum('distance'),
            total_time=Sum('elapsed_time'),
            total_calories=Sum('calories'),
            swim_distance=Sum('distance', filter=Q(sport_type='swim')),
            bike_distance=Sum('distance', filter=Q(sport_type='bike')),
            run_distance=Sum('distance', filter=Q(sport_type='run')),
        ).order_by('month')

        result = []
        for m in monthly:
            entry = dict(m)
            if entry['total_time']:
                entry['total_time_seconds'] = int(entry['total_time'].total_seconds())
            else:
                entry['total_time_seconds'] = 0
            result.append(entry)

        return Response(result)


# =============================================================================
# GEAR VIEWSET
# =============================================================================
class GearViewSet(viewsets.ModelViewSet):
    serializer_class = GearSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['gear_type', 'active']
    search_fields = ['name', 'brand', 'model_name']

    def get_queryset(self):
        return Gear.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =============================================================================
# RACE VIEWSET
# =============================================================================
class RaceViewSet(viewsets.ModelViewSet):
    serializer_class = RaceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['sport_type', 'season']
    ordering_fields = ['date', 'season']
    ordering = ['-date']

    def get_queryset(self):
        return Race.objects.filter(user=self.request.user).select_related('activity')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =============================================================================
# TRAINING PLAN VIEWSET
# =============================================================================
class TrainingPlanViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TrainingPlan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        plan = self.get_object()
        activities = plan.activities.all()
        serializer = ActivityListSerializer(activities, many=True)
        return Response(serializer.data)


# =============================================================================
# PROVIDER CONNECTION VIEWSET
# =============================================================================
class ProviderConnectionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['provider', 'is_active']

    def get_queryset(self):
        return ProviderConnection.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProviderConnectionCreateSerializer
        return ProviderConnectionSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Trigger manual sync con el proveedor (Suunto/Garmin)."""
        connection = self.get_object()
        if not connection.is_active:
            return Response(
                {"error": "La conexión no está activa."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if connection.is_token_expired:
            return Response(
                {"error": "El token ha expirado. Reconecta tu cuenta."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # TODO: Implementar lógica real de sync con Suunto/Garmin
        # Aquí iría la llamada al servicio correspondiente:
        # from .services.suunto import SuuntoService
        # from .services.garmin import GarminService
        #
        # if connection.provider == 'suunto':
        #     service = SuuntoService(connection)
        #     imported = service.sync_activities()
        # elif connection.provider == 'garmin':
        #     service = GarminService(connection)
        #     imported = service.sync_activities()

        connection.last_sync = timezone.now()
        connection.save()

        return Response({
            "status": "sync_triggered",
            "provider": connection.provider,
            "message": "Sincronización preparada. Conector pendiente de implementación con API real.",
            "last_sync": connection.last_sync,
        })

    @action(detail=True, methods=['post'])
    def disconnect(self, request, pk=None):
        """Desconectar proveedor (desactiva sin borrar)."""
        connection = self.get_object()
        connection.is_active = False
        connection.access_token = ''
        connection.refresh_token = ''
        connection.save()
        return Response({"status": "disconnected", "provider": connection.provider})
