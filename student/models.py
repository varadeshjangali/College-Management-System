from django.db import models
from django.conf import settings


class StudentProfile(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
	student_id = models.CharField(max_length=30, unique=True)
	phone = models.CharField(max_length=20, blank=True)
	branch = models.CharField(max_length=120)
	semester = models.PositiveSmallIntegerField(default=1)
	avatar_url = models.URLField(blank=True)

	def __str__(self):
		return f'{self.student_id} - {self.user.get_full_name() or self.user.username}'


class Subject(models.Model):
	code = models.CharField(max_length=20, unique=True)
	name = models.CharField(max_length=120)
	credits = models.PositiveSmallIntegerField(default=3)
	teacher = models.ForeignKey('teacher.TeacherProfile', on_delete=models.PROTECT, related_name='subjects')

	class Meta:
		ordering = ['code']

	def __str__(self):
		return f'{self.code} - {self.name}'


class Enrollment(models.Model):
	student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='enrollments')
	subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='enrollments')
	academic_year = models.CharField(max_length=9)

	class Meta:
		constraints = [models.UniqueConstraint(fields=['student', 'subject', 'academic_year'], name='unique_student_subject_year')]


class AttendanceRecord(models.Model):
	enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendance')
	date = models.DateField()
	present = models.BooleanField(default=False)

	class Meta:
		ordering = ['-date']
		constraints = [models.UniqueConstraint(fields=['enrollment', 'date'], name='unique_attendance_day')]


class Grade(models.Model):
	enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='grades')
	assessment_name = models.CharField(max_length=120)
	score = models.DecimalField(max_digits=5, decimal_places=2)
	maximum_score = models.DecimalField(max_digits=5, decimal_places=2, default=100)

	class Meta:
		constraints = [models.UniqueConstraint(fields=['enrollment', 'assessment_name'], name='unique_assessment_grade')]


class Assignment(models.Model):
	subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='assignments')
	title = models.CharField(max_length=160)
	description = models.TextField(blank=True)
	due_date = models.DateTimeField()
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['due_date']


class Announcement(models.Model):
	subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='announcements', null=True, blank=True)
	title = models.CharField(max_length=160)
	message = models.TextField()
	published_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		ordering = ['-published_at']


class TimetableEntry(models.Model):
	WEEKDAYS = [(index, name) for index, name in enumerate(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], start=1)]
	subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='timetable_entries')
	weekday = models.PositiveSmallIntegerField(choices=WEEKDAYS)
	start_time = models.TimeField()
	end_time = models.TimeField()
	room = models.CharField(max_length=40)
