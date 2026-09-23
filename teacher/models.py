from django.db import models
from django.conf import settings


class TeacherProfile(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='teacher_profile')
	employee_id = models.CharField(max_length=30, unique=True)
	department = models.CharField(max_length=120)
	phone = models.CharField(max_length=20, blank=True)

	def __str__(self):
		return f'{self.employee_id} - {self.user.get_full_name() or self.user.username}'
