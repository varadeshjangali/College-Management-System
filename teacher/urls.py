from django.urls import path

from . import views

urlpatterns = [
    path('teacher/dashboard/', views.dashboard, name='teacher-dashboard'),
    path('teacher/attendance/', views.mark_attendance, name='teacher-mark-attendance'),
    path('teacher/enrollments/', views.enroll_student, name='teacher-enroll-student'),
    path('teacher/assignments/', views.publish_assignment, name='teacher-publish-assignment'),
    path('teacher/announcements/', views.publish_announcement, name='teacher-publish-announcement'),
]