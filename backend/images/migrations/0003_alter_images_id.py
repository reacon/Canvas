# Generated by Django 5.1.4 on 2025-01-14 11:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('images', '0002_images_delete_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='images',
            name='id',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]
