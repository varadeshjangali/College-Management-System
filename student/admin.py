from django.contrib import admin
from .models import Announcement, Assignment, AttendanceRecord, Enrollment, Grade, StudentProfile, Subject, TimetableEntry

admin.site.register([StudentProfile, Subject, Enrollment, AttendanceRecord, Grade, Assignment, Announcement, TimetableEntry])
