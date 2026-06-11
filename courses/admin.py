from django.contrib import admin
from .models import Course, Lesson, Enrollment, Progress

# Register your models here.

admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(Progress)