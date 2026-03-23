# Guia de Deploy no Render.com

Esta pasta contém apenas os arquivos necessários para subir o seu projeto no site **Render.com**.

## Estrutura da Pasta
- `render.yaml`: Arquivo de blueprint que automatiza a criação do Banco de Dados PostgreSQL, Backend (Django) e Frontend (React).
- `backend/`: Código fonte do Django configurado para produção.
- `frontend/`: Código fonte do React (Vite) configurado para produção.

## Como Fazer o Deploy

### Opção 1: Usando o Blueprint (Recomendado)
1. Crie um novo repositório no seu GitHub (ex: `meu-projeto-ingles`).
2. Copie o **conteúdo** desta pasta `Deploy` para dentro do seu novo repositório.
3. No site [Render.com](https://dashboard.render.com), clique em **New** > **Blueprint**.
4. Conecte o seu repositório do GitHub.
5. O Render lerá o arquivo `render.yaml` e criará automaticamente tudo para você.

### Opção 2: Deploy Manual
Se preferir criar cada serviço manualmente no Render:

#### Backend (Web Service)
- **Runtime**: Python
- **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- **Start Command**: `gunicorn core.wsgi:application`
- **Variáveis de Ambiente Necessárias**:
  - `SECRET_KEY`: (Pode gerar uma aleatória)
  - `DEBUG`: `False`
  - `DATABASE_URL`: URL do seu banco PostgreSQL
  - `USE_POSTGRES`: `True`
  - `ALLOWED_HOSTS`: `*` (ou o domínio do Render)

#### Frontend (Static Site)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Variáveis de Ambiente Necessárias**:
  - `VITE_API_URL`: URL do seu backend no Render + `/api/` (ex: `https://meu-backend.onrender.com/api/`)

---

**Observação**: Após o primeiro deploy, não esqueça de atualizar as URLs em `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS` no arquivo `settings.py` (ou via variáveis de ambiente) para garantir a segurança máxima.
