from rest_framework import permissions


class IsTeacherOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role in ['teacher', 'admin']


class IsOwnerOrTeacherOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.profile.role == 'admin':
            return True
        if request.user.profile.role == 'teacher':
            return obj.teacher == request.user
        return False
