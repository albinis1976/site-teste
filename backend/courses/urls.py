from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListView.as_view(), name='course_list'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course_detail'),
    path('<str:course_id>/enroll/', views.EnrollView.as_view(), name='enroll'),
    path('<str:course_id>/access/', views.CourseAccessView.as_view(), name='course_access'),
    path('teacher/courses/', views.TeacherCourseListView.as_view(),
         name='teacher_courses'),
    path('teacher/courses/create/',
         views.CourseCreateView.as_view(), name='course_create'),
    path('enrollments/', views.MyEnrollmentsView.as_view(), name='my_enrollments'),
    path('lessons/<int:pk>/', views.LessonDetailView.as_view(), name='lesson_detail'),
    path('<slug:slug>/', views.CourseDetailView.as_view(), name='course_detail_slug'),
]
