# 🦖 Portal de Administração Biscoitossauro

Sistema web de administração e CRM para fábrica de biscoitos artesanais personalizados.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Design System **Material Design 3 (M3)** 100% responsivo para Desktop e Mobile.
- **Backend**: Python 3.9+, FastAPI, SQLAlchemy, SQLite, JWT (PyJWT), Bcrypt nativo.

---

## 🔑 Credenciais Padrão do Administrador

- **E-mail**: `biscoitossauros@gmail.com`
- **Senha**: `baronildo`

*(O usuário é inserido automaticamente no banco de dados na primeira execução caso ainda não exista).*

---

## 🚀 Como Executar o Projeto

Você pode iniciar o backend e o frontend juntos com o script unificado:

```bash
./start.sh
```

Ou rodar separadamente em dois terminais:

### 1. Backend (FastAPI)
```bash
./backend/venv/bin/python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
A API e a documentação interativa Swagger estarão disponíveis em: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend (Vite / React)
```bash
cd frontend
npm run dev
```
O portal estará acessível em: [http://localhost:3000](http://localhost:3000)

---

## 📋 Funcionalidades Implementadas

1. **Autenticação & Controle de Usuários**:
   - Tela de login com design Material 3.
   - Menu lateral exclusivo de **Gestão de Usuários**: Listagem, busca em tempo real, cadastro de novos operadores, edição e exclusão segura.
   - Proteção de rotas com Bearer JWT.

2. **Menu Lateral Retrátil (Sidebar Material 3)**:
   - **Desktop**: Alternância fluida entre expandido (260px) e minimizado/rail (80px com ícones e tooltips).
   - **Mobile (Celulares/Tablets)**: Gaveta modal (Modal Navigation Drawer) com fundo escurecido (backdrop) e botão hambúrguer.

3. **Módulo CRM - Empresas**:
   - Cadastro detalhado: Nome Fantasia, Razão Social, CNPJ, Inscrição Estadual, Telefones, WhatsApp Comercial, E-mail, Endereço completo, Segmento e Status (Lead, Em Negociação, Ativo, Inativo).
   - **Gestão de Equipe & Contatos**: Na ficha da empresa é possível visualizar todos os contatos vinculados, associar pessoas já cadastradas definindo Cargo, Departamento e se é Contato Principal, ou desvincular.

4. **Módulo CRM - Pessoas**:
   - Cadastro independente: Nome Completo, CPF, E-mail, Telefones, WhatsApp, Data de Nascimento, Tipo (Consumidor Final B2C, Contato Corporativo B2B ou Parceiro) e Endereço.
   - **Múltiplos Vínculos Empresariais**: Uma pessoa física pode ser associada a uma ou mais empresas clientes com cargos distintos, mantendo histórico profissional.
