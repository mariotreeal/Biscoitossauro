#!/bin/bash
# Script de inicialização completa do Portal Biscoitossauro
echo "🦖 Iniciando Portal de Administração Biscoitossauro..."

# Matar instâncias anteriores se houver
pkill -f "uvicorn backend.main:app" 2>/dev/null || true

# Ativar venv e rodar backend
echo "📦 Iniciando API Backend (FastAPI)..."
./backend/venv/bin/python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "🎨 Iniciando Frontend (Vite/React)..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "🚀 Biscoitossauro rodando!"
echo "➡️  Frontend: http://localhost:3000"
echo "➡️  API Backend & Docs: http://127.0.0.1:8000/docs"
echo "Pressione CTRL+C para encerrar."

wait $BACKEND_PID $FRONTEND_PID
