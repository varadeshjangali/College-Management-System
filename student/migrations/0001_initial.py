# Generated manually for the initial college management schema.
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('teacher', '0001_initial'),
    ]
    operations = [
        migrations.CreateModel(name='StudentProfile', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('student_id', models.CharField(max_length=30, unique=True)),
            ('phone', models.CharField(blank=True, max_length=20)),
            ('program', models.CharField(max_length=120)),
            ('semester', models.PositiveSmallIntegerField(default=1)),
            ('avatar_url', models.URLField(blank=True)),
            ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='student_profile', to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name='Subject', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('code', models.CharField(max_length=20, unique=True)),
            ('name', models.CharField(max_length=120)),
            ('credits', models.PositiveSmallIntegerField(default=3)),
            ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='subjects', to='teacher.teacherprofile')),
        ], options={'ordering': ['code']}),
        migrations.CreateModel(name='Enrollment', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('academic_year', models.CharField(max_length=9)),
            ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enrollments', to='student.studentprofile')),
            ('subject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='enrollments', to='student.subject')),
        ]),
        migrations.CreateModel(name='AttendanceRecord', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('date', models.DateField()),
            ('present', models.BooleanField(default=False)),
            ('enrollment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance', to='student.enrollment')),
        ], options={'ordering': ['-date']}),
        migrations.CreateModel(name='Grade', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('assessment_name', models.CharField(max_length=120)),
            ('score', models.DecimalField(decimal_places=2, max_digits=5)),
            ('maximum_score', models.DecimalField(decimal_places=2, default=100, max_digits=5)),
            ('enrollment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='grades', to='student.enrollment')),
        ]),
        migrations.CreateModel(name='Assignment', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('title', models.CharField(max_length=160)),
            ('description', models.TextField(blank=True)),
            ('due_date', models.DateTimeField()),
            ('created_at', models.DateTimeField(auto_now_add=True)),
            ('subject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignments', to='student.subject')),
        ], options={'ordering': ['due_date']}),
        migrations.CreateModel(name='Announcement', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('title', models.CharField(max_length=160)),
            ('message', models.TextField()),
            ('published_at', models.DateTimeField(auto_now_add=True)),
            ('subject', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='announcements', to='student.subject')),
        ], options={'ordering': ['-published_at']}),
        migrations.CreateModel(name='TimetableEntry', fields=[
            ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ('weekday', models.PositiveSmallIntegerField(choices=[(1, 'Monday'), (2, 'Tuesday'), (3, 'Wednesday'), (4, 'Thursday'), (5, 'Friday'), (6, 'Saturday')])),
            ('start_time', models.TimeField()),
            ('end_time', models.TimeField()),
            ('room', models.CharField(max_length=40)),
            ('subject', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='timetable_entries', to='student.subject')),
        ]),
        migrations.AddConstraint(model_name='enrollment', constraint=models.UniqueConstraint(fields=('student', 'subject', 'academic_year'), name='unique_student_subject_year')),
        migrations.AddConstraint(model_name='attendancerecord', constraint=models.UniqueConstraint(fields=('enrollment', 'date'), name='unique_attendance_day')),
        migrations.AddConstraint(model_name='grade', constraint=models.UniqueConstraint(fields=('enrollment', 'assessment_name'), name='unique_assessment_grade')),
    ]
