from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ('student', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='studentprofile',
            old_name='program',
            new_name='branch',
        ),
    ]