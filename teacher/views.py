import json
from datetime import datetime

from django.contrib.auth.decorators import login_required
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from student.models import Announcement, Assignment, AttendanceRecord, Enrollment, Grade, StudentProfile, Subject


def _json_body(request):
    try:
        return json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return None


def _teacher_subject(teacher, subject_id):
    return Subject.objects.filter(id=subject_id, teacher=teacher).first()


@login_required
def dashboard(request):
    if not hasattr(request.user, 'teacher_profile'):
        return JsonResponse({'detail': 'Teacher access required.'}, status=403)

    teacher = request.user.teacher_profile
    all_students = StudentProfile.objects.select_related('user').order_by('student_id')
    subjects = teacher.subjects.prefetch_related('enrollments__student__user')
    subject_data = []
    total_students = 0
    for subject in subjects:
        student_count = subject.enrollments.count()
        total_students += student_count
        subject_data.append({
            'id': subject.id,
            'code': subject.code,
            'name': subject.name,
            'students': student_count,
            'student_list': [
                {'id': enrollment.student.id, 'student_id': enrollment.student.student_id, 'name': enrollment.student.user.get_full_name() or enrollment.student.user.username}
                for enrollment in subject.enrollments.all()
            ],
            'available_students': [
                {'id': student.id, 'student_id': student.student_id, 'name': student.user.get_full_name() or student.user.username}
                for student in all_students
                if not subject.enrollments.filter(student=student).exists()
            ],
        })

    enrollment_ids = Enrollment.objects.filter(subject__teacher=teacher).values('id')
    attendance = AttendanceRecord.objects.filter(enrollment_id__in=enrollment_ids)
    grades = Grade.objects.filter(enrollment_id__in=enrollment_ids)
    present = attendance.filter(present=True).count()
    total = attendance.count()
    return JsonResponse({
        'profile': {
            'name': teacher.user.get_full_name() or teacher.user.username,
            'employee_id': teacher.employee_id,
            'department': teacher.department,
        },
        'summary': {'subjects': len(subject_data), 'students': total_students, 'attendance_rate': round(present / total * 100, 1) if total else 0, 'graded_assessments': grades.count()},
        'subjects': subject_data,
    })


@csrf_exempt
@login_required
@require_http_methods(['POST'])
def enroll_student(request):
    if not hasattr(request.user, 'teacher_profile'):
        return JsonResponse({'detail': 'Teacher access required.'}, status=403)
    payload = _json_body(request)
    if payload is None:
        return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)
    subject = _teacher_subject(request.user.teacher_profile, payload.get('subject_id'))
    student = StudentProfile.objects.filter(id=payload.get('student_id')).first()
    academic_year = str(payload.get('academic_year', '')).strip()
    if not subject or not student or not academic_year:
        return JsonResponse({'detail': 'Assigned subject, student, and academic year are required.'}, status=400)
    if len(academic_year) != 9 or academic_year[4] != '-' or not academic_year[:4].isdigit() or not academic_year[5:].isdigit():
        return JsonResponse({'detail': 'Academic year must use YYYY-YYYY format.'}, status=400)
    try:
        enrollment = Enrollment.objects.create(student=student, subject=subject, academic_year=academic_year)
    except IntegrityError:
        return JsonResponse({'detail': 'This student is already enrolled in the subject for that academic year.'}, status=409)
    return JsonResponse({'id': enrollment.id, 'detail': 'Student enrolled successfully.'}, status=201)


@csrf_exempt
@login_required
@require_http_methods(['POST'])
def mark_attendance(request):
    if not hasattr(request.user, 'teacher_profile'):
        return JsonResponse({'detail': 'Teacher access required.'}, status=403)
    payload = _json_body(request)
    if payload is None:
        return JsonResponse({'detail': 'Request body must be valid JSON.'}, status=400)
    subject = _teacher_subject(request.user.teacher_profile, payload.get('subject_id'))
    date = payload.get('date')
    records = payload.get('records')
    if not subject or not date or not isinstance(records, list) or not records:
        return JsonResponse({'detail': 'Subject, date, and at least one attendance record are required.'}, status=400)
    try:
        datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        return JsonResponse({'detail': 'Date must use YYYY-MM-DD format.'}, status=400)

    enrollments = {enrollment.student_id: enrollment for enrollment in Enrollment.objects.filter(subject=subject, student_id__in=[item.get('student_id') for item in records])}
    if len(enrollments) != len(records):
        return JsonResponse({'detail': 'Every student must be enrolled in this subject.'}, status=400)
    with transaction.atomic():
        for item in records:
            AttendanceRecord.objects.update_or_create(
                enrollment=enrollments[item['student_id']],
                date=date,
                defaults={'present': bool(item.get('present'))},
            )
    return JsonResponse({'detail': 'Attendance saved successfully.', 'saved': len(records)})


@csrf_exempt
@login_required
@require_http_methods(['POST'])
def publish_assignment(request):
    if not hasattr(request.user, 'teacher_profile'):
        return JsonResponse({'detail': 'Teacher access required.'}, status=403)
    payload = _json_body(request)
    subject = _teacher_subject(request.user.teacher_profile, payload.get('subject_id')) if payload else None
    if not subject or not payload.get('title') or not payload.get('due_date'):
        return JsonResponse({'detail': 'Subject, title, and due date are required.'}, status=400)
    try:
        due_date = datetime.fromisoformat(payload['due_date'].replace('Z', '+00:00'))
        assignment = Assignment.objects.create(subject=subject, title=payload['title'].strip(), description=payload.get('description', '').strip(), due_date=due_date)
    except (TypeError, ValueError):
        return JsonResponse({'detail': 'Due date must be a valid date and time.'}, status=400)
    return JsonResponse({'id': assignment.id, 'detail': 'Assignment published successfully.'}, status=201)


@csrf_exempt
@login_required
@require_http_methods(['POST'])
def publish_announcement(request):
    if not hasattr(request.user, 'teacher_profile'):
        return JsonResponse({'detail': 'Teacher access required.'}, status=403)
    payload = _json_body(request)
    subject = _teacher_subject(request.user.teacher_profile, payload.get('subject_id')) if payload and payload.get('subject_id') else None
    if payload is None or not payload.get('title') or not payload.get('message'):
        return JsonResponse({'detail': 'Title and message are required.'}, status=400)
    if payload.get('subject_id') and not subject:
        return JsonResponse({'detail': 'You can only announce to your assigned subjects.'}, status=403)
    announcement = Announcement.objects.create(subject=subject, title=payload['title'].strip(), message=payload['message'].strip())
    return JsonResponse({'id': announcement.id, 'detail': 'Announcement published successfully.'}, status=201)

# Create your views here.
