import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Avg, Count, Q

from .models import Announcement, Assignment, AttendanceRecord, Enrollment, StudentProfile


def _user_payload(user):
	role = 'student' if hasattr(user, 'student_profile') else 'teacher' if hasattr(user, 'teacher_profile') else 'admin'
	return {'id': user.id, 'username': user.username, 'name': user.get_full_name(), 'role': role}


@csrf_exempt
@require_http_methods(['POST'])
def login_view(request):
	try:
		credentials = json.loads(request.body or '{}')
	except json.JSONDecodeError:
		return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)

	user = authenticate(request, username=credentials.get('username', ''), password=credentials.get('password', ''))
	if user is None:
		return JsonResponse({'detail': 'Invalid username or password.'}, status=401)

	account_type = credentials.get('account_type')
	if account_type not in {'student', 'teacher'}:
		return JsonResponse({'detail': 'Choose Student or Teacher before signing in.'}, status=400)
	actual_role = 'student' if hasattr(user, 'student_profile') else 'teacher' if hasattr(user, 'teacher_profile') else None
	if actual_role != account_type:
		return JsonResponse({'detail': f'This account is not registered as a {account_type} account.'}, status=403)

	login(request, user)
	return JsonResponse({'user': _user_payload(user)})


@csrf_exempt
@require_http_methods(['POST'])
def student_signup(request):
	try:
		registration = json.loads(request.body or '{}')
	except json.JSONDecodeError:
		return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)

	required_fields = ['first_name', 'last_name', 'username', 'email', 'student_id', 'program', 'semester', 'password', 'password_confirm']
	missing_fields = [field for field in required_fields if not str(registration.get(field, '')).strip()]
	if missing_fields:
		return JsonResponse({'detail': f'Missing required fields: {", ".join(missing_fields)}.'}, status=400)
	if registration['password'] != registration['password_confirm']:
		return JsonResponse({'detail': 'Passwords do not match.'}, status=400)
	try:
		semester = int(registration['semester'])
	except (TypeError, ValueError):
		return JsonResponse({'detail': 'Semester must be a number from 1 to 12.'}, status=400)
	if not 1 <= semester <= 12:
		return JsonResponse({'detail': 'Semester must be a number from 1 to 12.'}, status=400)
	try:
		validate_password(registration['password'])
	except ValidationError as error:
		return JsonResponse({'detail': ' '.join(error.messages)}, status=400)
	if User.objects.filter(username=registration['username']).exists():
		return JsonResponse({'detail': 'That username is already in use.'}, status=409)
	if User.objects.filter(email=registration['email']).exists():
		return JsonResponse({'detail': 'That email is already registered.'}, status=409)
	if StudentProfile.objects.filter(student_id=registration['student_id']).exists():
		return JsonResponse({'detail': 'That student ID is already registered.'}, status=409)

	try:
		with transaction.atomic():
			user = User.objects.create_user(username=registration['username'], email=registration['email'], password=registration['password'], first_name=registration['first_name'], last_name=registration['last_name'])
			StudentProfile.objects.create(user=user, student_id=registration['student_id'], program=registration['program'], semester=semester)
	except IntegrityError:
		return JsonResponse({'detail': 'An account with these details already exists.'}, status=409)

	login(request, user)
	return JsonResponse({'user': _user_payload(user)}, status=201)


@csrf_exempt
@require_http_methods(['POST'])
def logout_view(request):
	logout(request)
	return JsonResponse({'detail': 'Logged out successfully.'})


@login_required
def current_user(request):
	return JsonResponse({'user': _user_payload(request.user)})


@login_required
def dashboard(request):
	if not hasattr(request.user, 'student_profile'):
		return JsonResponse({'detail': 'Student access required.'}, status=403)

	student = request.user.student_profile
	enrollments = Enrollment.objects.filter(student=student).select_related('subject')
	attendance = AttendanceRecord.objects.filter(enrollment__in=enrollments)
	attendance_total = attendance.count()
	present_total = attendance.filter(present=True).count()
	grades = list(enrollments.values('subject__code', 'subject__name').annotate(average=Avg('grades__score')))
	assignments = Assignment.objects.filter(subject__in=enrollments.values('subject_id')).order_by('due_date')[:5]
	announcements = Announcement.objects.filter(Q(subject__in=enrollments.values('subject_id')) | Q(subject__isnull=True))[:5]

	return JsonResponse({
		'profile': {
			'name': student.user.get_full_name() or student.user.username,
			'student_id': student.student_id,
			'program': student.program,
			'semester': student.semester,
		},
		'summary': {'subjects': enrollments.count(), 'attendance_rate': round(present_total / attendance_total * 100, 1) if attendance_total else 0, 'pending_assignments': assignments.count()},
		'subjects': [{'code': item.subject.code, 'name': item.subject.name, 'credits': item.subject.credits} for item in enrollments],
		'performance': grades,
		'assignments': [{'id': item.id, 'title': item.title, 'subject': item.subject.code, 'due_date': item.due_date} for item in assignments],
		'announcements': [{'id': item.id, 'title': item.title, 'message': item.message, 'published_at': item.published_at} for item in announcements],
	})

# Create your views here.
