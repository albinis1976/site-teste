from django.contrib import admin
from .models import Course, Module, Lesson, Enrollment


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'slug', 'price', 'is_free', 'is_published', 'created_at']
    list_filter = ['is_free', 'is_published', 'teacher']
    search_fields = ['title', 'description', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-created_at']
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'course', 'order', 'is_free', 'is_preview']
    list_filter = ['course', 'module', 'is_free', 'is_preview']


admin.site.register(Enrollment)

