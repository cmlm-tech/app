# CMLM.TECH - Sistema Integrado de Gestão Legislativa

**CMLM.TECH** é uma plataforma web centralizada desenvolvida para modernizar e gerenciar todo o ciclo de vida dos documentos, processos legislativos e o cadastro de agentes públicos da Câmara Municipal de Lavras da Mangabeira. O sistema serve como uma fonte única de verdade para servidores, vereadores e a administração da câmara.

## 🚀 Visão do Produto

O objetivo do CMLM.TECH é resolver a fragmentação de processos e a dependência de fluxos manuais, promovendo:
- **Eficiência Operacional**: Redução do tempo em tarefas manuais.
- **Transparência**: Centralização das informações legislativas.
- **Segurança**: Proteção do acervo documental e dados de pessoal.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído utilizando tecnologias modernas para garantir performance, escalabilidade e uma excelente experiência de usuário:

- **[React](https://react.dev/)**: Biblioteca para construção de interfaces de usuário.
- **[Vite](https://vitejs.dev/)**: Build tool rápida para desenvolvimento web moderno.
- **[TypeScript](https://www.typescriptlang.org/)**: Superset tipado de JavaScript para maior segurança no código.
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utility-first para estilização rápida e responsiva.
- **[shadcn/ui](https://ui.shadcn.com/)**: Componentes de UI reutilizáveis e acessíveis.
- **[Supabase](https://supabase.com/)**: Backend-as-a-Service (PostgreSQL, Auth, Storage, Realtime).

## ✨ Funcionalidades Principais

### 1. Gestão de Acesso e Pessoal
- **Autenticação Segura**: Controle de acesso baseado em permissões (Admin, Assessoria, Secretaria, Vereador).
- **Cadastro de Agentes Públicos**: Gestão centralizada de vereadores e funcionários.

### 2. Ciclo de Vida do Documento
- **Criação e Edição**: Editor de documentos com suporte a templates (Ofícios, Requerimentos, Projetos de Lei).
- **Protocolo Digital**: Geração automática de numeração e PDF oficial dos documentos.
- **Assinatura e Tramitação**: Controle de autoria e fluxo de aprovação.

### 3. Processo Legislativo
- **Linha do Tempo**: Visualização clara da tramitação das matérias.
- **Gestão de Pautas e Sessões**: Organização da ordem do dia e registro de sessões plenárias.
- **Votação e Presença**: Registro digital de votos e presença dos vereadores.

### 4. Pesquisa e Transparência
- **Busca Avançada**: Filtros por tipo, autor, data e conteúdo.
- **Acervo Digital**: Acesso facilitado a todo o histórico legislativo.

## 📦 Instalação e Uso

Para rodar o projeto localmente, siga os passos abaixo:

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão recomendada: LTS)
- Gerenciador de pacotes `npm` ou `yarn`

### Passos

1. **Clone o repositório**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd <NOME_DA_PASTA>
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Crie um arquivo `.env` na raiz do projeto baseando-se no `.env.template` (se disponível) e configure suas credenciais do Supabase.

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Acesse a aplicação**
   Abra seu navegador em [http://localhost:8080](http://localhost:8080) (ou a porta indicada no terminal).

## 📄 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila o projeto para produção.
- `npm run lint`: Executa a verificação de linting no código.
- `npm run preview`: Visualiza o build de produção localmente.

---
**CMLM.TECH** - Modernizando a gestão legislativa.
