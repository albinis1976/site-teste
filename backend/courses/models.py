from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify


class Course(models.Model):
    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True, db_index=True)
    description = models.TextField()
    thumbnail = models.URLField(max_length=500, blank=True, null=True)
    level = models.CharField(max_length=50, default='Todos os níveis')
    price = models.DecimalField(
        max_digits=10, decimal_places=2, 
        validators=[MinValueValidator(0)],
        null=True, blank=True
    )
    is_free = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    teacher = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='courses_taught',
        limit_choices_to={'profile__role': 'teacher'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Curso'
        verbose_name_plural = 'Cursos'

    def clean(self):
        super().clean()
        if self.is_free:
            self.price = 0
        elif self.price is None or self.price <= 0:
            raise ValidationError({'price': 'Preço deve ser maior que zero para cursos pagos.'})

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Module(models.Model):
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='enrollments')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'course')


class Lesson(models.Model):
    # Maintained exact backward compatibility bridging for old generic queries
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name='lessons')
    
    # Modern Hierarchical Link
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name='lessons', null=True, blank=True)
        
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    video_url = models.URLField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_free = models.BooleanField(default=False)
    is_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"
