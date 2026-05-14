from django.contrib import admin
from .models import (
    Activity, Lap, HeartRateZone, Gear,
    Race, TrainingPlan, ProviderConnection
)


# =============================================================================
# INLINES
# =============================================================================
class LapInline(admin.TabularInline):
    model = Lap
    extra = 0
    fields = [
        'lap_index', 'sport_type', 'elapsed_time', 'distance',
        'avg_heart_rate', 'avg_speed', 'avg_cadence', 'avg_power', 'lap_trigger'
    ]
    readonly_fields = []
    ordering = ['lap_index']


class HeartRateZoneInline(admin.TabularInline):
    model = HeartRateZone
    extra = 0
    fields = ['zone_number', 'zone_name', 'min_hr', 'max_hr', 'time_in_zone']
    ordering = ['zone_number']


# =============================================================================
# ACTIVITY
# =============================================================================
@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = [
        'name_display', 'user', 'sport_type', 'sub_sport', 'source',
        'start_time', 'distance_km', 'elapsed_time',
        'avg_heart_rate', 'calories', 'feeling', 'completed'
    ]
    list_filter = ['sport_type', 'sub_sport', 'source', 'completed', 'start_time']
    search_fields = ['name', 'description', 'user__username']
    date_hierarchy = 'start_time'
    readonly_fields = ['created_at', 'updated_at']
    inlines = [LapInline, HeartRateZoneInline]
    raw_id_fields = ['user', 'plan', 'gear']

    fieldsets = (
        ('Identificación', {
            'fields': ('user', 'external_id', 'source', 'sport_type', 'sub_sport', 'name', 'description')
        }),
        ('Tiempo', {
            'fields': ('start_time', 'end_time', 'elapsed_time', 'moving_time')
        }),
        ('Distancia y Altitud', {
            'fields': ('distance', 'total_ascent', 'total_descent')
        }),
        ('Frecuencia Cardíaca', {
            'fields': ('avg_heart_rate', 'max_heart_rate', 'min_heart_rate')
        }),
        ('Velocidad', {
            'fields': ('avg_speed', 'max_speed')
        }),
        ('Energía y Percepción', {
            'fields': ('calories', 'feeling', 'training_effect_aerobic', 'training_effect_anaerobic')
        }),
        ('Datos Específicos', {
            'fields': ('sport_specific_data',),
            'classes': ('collapse',)
        }),
        ('Archivo FIT', {
            'fields': ('raw_fit_file',),
            'classes': ('collapse',)
        }),
        ('Relaciones', {
            'fields': ('plan', 'gear', 'completed')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def name_display(self, obj):
        return obj.name or obj.get_sport_type_display()
    name_display.short_description = 'Actividad'

    def distance_km(self, obj):
        if obj.distance:
            return f"{float(obj.distance) / 1000:.2f} km"
        return '-'
    distance_km.short_description = 'Distancia'


# =============================================================================
# GEAR
# =============================================================================
@admin.register(Gear)
class GearAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'gear_type', 'brand', 'distance_km', 'usage_pct', 'active']
    list_filter = ['gear_type', 'active']
    search_fields = ['name', 'brand', 'model_name']

    def distance_km(self, obj):
        return f"{float(obj.distance_logged) / 1000:.1f} km"
    distance_km.short_description = 'Uso'

    def usage_pct(self, obj):
        pct = obj.usage_percentage
        if pct is not None:
            return f"{pct}%"
        return '-'
    usage_pct.short_description = '% Vida útil'


# =============================================================================
# RACE
# =============================================================================
@admin.register(Race)
class RaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'sport_type', 'date', 'season', 'target_time', 'result_time']
    list_filter = ['sport_type', 'season']
    search_fields = ['name', 'location']
    date_hierarchy = 'date'


# =============================================================================
# TRAINING PLAN
# =============================================================================
@admin.register(TrainingPlan)
class TrainingPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'start_date', 'end_date', 'goal']
    search_fields = ['name', 'goal']


# =============================================================================
# PROVIDER CONNECTION
# =============================================================================
@admin.register(ProviderConnection)
class ProviderConnectionAdmin(admin.ModelAdmin):
    list_display = ['user', 'provider', 'is_active', 'last_sync', 'sync_errors', 'is_token_expired']
    list_filter = ['provider', 'is_active']
    readonly_fields = ['created_at', 'updated_at']

    def is_token_expired(self, obj):
        return obj.is_token_expired
    is_token_expired.boolean = True
    is_token_expired.short_description = 'Token expirado'
