from django.urls import path

from . import views

urlpatterns = [
    path('auth/login/', views.login_view, name='api-login'),
    path('auth/student-signup/', views.student_signup, name='student-signup'),
    path('auth/logout/', views.logout_view, name='api-logout'),
    path('auth/me/', views.current_user, name='api-current-user'),
    path('student/dashboard/', views.dashboard, name='student-dashboard'),
]