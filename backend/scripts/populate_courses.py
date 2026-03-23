import os
import sys
import django

# Adiciona o diretório base ao sys.path para importações locais
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from courses.models import Course

def run():
    print("--- INICIANDO POVOAMENTO DE DADOS ---")
    
    # 1. Garantir que existe um professor
    teacher_email = "teacher@test.com"
    teacher, created = User.objects.get_or_create(
        username=teacher_email,
        email=teacher_email,
        defaults={
            "first_name": "Teacher",
            "last_name": "Test",
        }
    )
    if created:
        teacher.set_password("Password123!")
        teacher.save()
        # Role é setado no profile
        teacher.profile.role = 'teacher'
        teacher.profile.save()
        print(f"✅ Professor criado: {teacher_email}")
    else:
        print(f"ℹ️ Professor já existe: {teacher_email}")

    # 2. Criar cursos
    courses_data = [
        {"title": "Curso Django", "description": "Backend completo", "price": 99.90},
        {"title": "Curso React", "description": "Frontend moderno", "price": 89.90},
    ]

    for data in courses_data:
        course, created = Course.objects.get_or_create(
            title=data["title"],
            defaults={
                "description": data["description"],
                "price": data["price"],
                "teacher": teacher
            }
        )
        if created:
            print(f"✅ Curso criado: {data['title']}")
        else:
            print(f"ℹ️ Curso já existe: {data['title']}")

    print("--- POVOAMENTO CONCLUÍDO ---")

if __name__ == "__main__":
    run()
