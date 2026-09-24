from django.contrib import admin
from .models import Announcement, Assignment, AttendanceRecord, Enrollment, Grade, StudentProfile, Subject, TimetableEntry


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
	list_display = ('id', 'student_id', 'user', 'branch', 'semester')
	ordering = ('id',)


admin.site.register([Subject, Enrollment, AttendanceRecord, Grade, Assignment, Announcement, TimetableEntry])
