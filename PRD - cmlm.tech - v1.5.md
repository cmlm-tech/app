# **Documento de Requisitos do Produto (PRD): CMLM.TECH**

**Versão:** 1.5 \- Refatoração para Agente Público **Data:** 21 de Junho de 2025 **Autor:** (Seu Nome) e Gemini (Arquiteto de IA)

## **1\. Visão Geral e Introdução**

### **1.1. Nome do Produto**

**CMLM.TECH** \- Sistema Integrado de Gestão Legislativa e de Pessoal da Câmara Municipal de Lavras da Mangabeira.

### **1.2. O Problema**

Atualmente, os processos legislativos e a gestão de pessoal da Câmara Municipal de Lavras da Mangabeira dependem de sistemas desconectados e fluxos de trabalho manuais. Esta fragmentação resulta em ineficiência, falta de transparência interna e riscos de segurança da informação.

### **1.3. A Solução (Visão do Produto)**

O **CMLM.TECH** será uma plataforma web centralizada para gerenciar todo o ciclo de vida dos documentos, processos legislativos e o cadastro de agentes públicos (vereadores e funcionários) da Câmara Municipal. O sistema servirá como uma fonte única de verdade para servidores e vereadores.

### **1.4. Público-Alvo**

* **Utilizadores Internos:**  
  * **Secretaria Legislativa:** Responsáveis pela criação de documentos, gestão de pautas, atas, tramitações e protocolo.  
  * **Administradores do Sistema:** Responsáveis pela gestão de utilizadores, permissões e cadastro de agentes públicos.  
  * **Assessoria:** Assessores jurídicos, contábeis, etc., responsáveis pela análise e emissão de pareceres.  
* **Atores Legislativos:**  
  * **Vereadores:** Como autores de documentos, membros de comissões e votantes.

## **2\. Objetivos e Métricas de Sucesso**

### **2.1. Objetivos de Negócio**

* **Aumentar a Eficiência Operacional:** Reduzir o tempo gasto em tarefas manuais.  
* **Centralizar a Gestão de Pessoal:** Criar um cadastro único para todos os agentes públicos da Câmara.  
* **Garantir a Integridade e Segurança da Informação:** Centralizar e proteger o acervo documental e de pessoal da Câmara.

### **2.2. Métricas de Sucesso (KPIs)**

* **Redução de 50%** no tempo médio para protocolar uma nova matéria legislativa nos primeiros 6 meses de uso.  
* **Adoção de 95%** do sistema pelos utilizadores internos (Secretaria, Assessoria) no primeiro ano.  
* **Nota de Satisfação do Utilizador (NPS)** interna acima de 40\.

## **3\. Requisitos Funcionais (Features)**

### **Epic 1: Gestão de Acesso e Entidades Centrais**

* **Autenticação e Permissões:**  
  * Login seguro para Usuarios.  
  * Controle de acesso baseado no atributo permissao ('Admin', 'Assessoria', 'Secretaria', 'Vereador').  
* **Gerenciamento de Estrutura Organizacional:**  
  * CRUD para Legislaturas, PeriodosSessao, Comissoes e MesasDiretoras.  
* **Gerenciamento de Agentes Públicos:**  
  * Interface centralizada para o CRUD de AgentesPublicos.  
  * Capacidade de associar um agente público ao papel de Funcionario ou Vereador, preenchendo os dados específicos de cada função.  
  * Capacidade de vincular (ou desvincular) um AgentePublico a uma conta de Usuario.

### **Epic 2: Ciclo de Vida do Documento**

* **Criação Dinâmica:**  
  * Um ponto central para "Criar Documento" com um \<select\> populado pela tabela TiposDeDocumento.  
  * O sistema renderiza o formulário correto com base no tipo de documento selecionado.  
* **Gestão de Tags (Palavras-Chave):**  
  * Ao criar/editar um documento, o utilizador pode associar tags a partir de uma lista existente ou criar novas tags.  
  * Interface de gestão para Admins poderem renomear, fundir e apagar tags, mantendo a consistência do sistema.  
* **Estado de Rascunho:**  
  * Todo documento é criado inicialmente com o status \= 'Rascunho' na tabela Documentos.  
  * Enquanto em rascunho, o documento é totalmente editável.  
* **Protocolo e Geração de PDF:**  
  * Ação de "Protocolar" que muda o status para 'Protocolado', congela a edição, e gera o PDF oficial.  
  * O PDF gerado é armazenado (Supabase Storage) e o link salvo no campo arquivo\_pdf\_url.  
* **Protocolo de Documentos Recebidos:**  
  * Funcionalidade para registrar documentos externos, com upload do original escaneado (salvo em arquivo\_original\_url).  
* **Gestão de Autoria:**  
  * Interface para adicionar múltiplos autores e subscritores a um documento, populando a tabela DocumentoAutores com o papel correto.

### **Epic 3: Processo Legislativo e Tramitação**

* **Linha do Tempo da Matéria:**  
  * Para cada matéria (is\_materia \= true), o sistema exibirá uma linha do tempo visual de sua tramitação.  
* **Registro de Tramitação:**  
  * Interface para que utilizadores com permissão possam adicionar novos passos na tabela Tramitacoes, alterando o status da matéria (Ex: 'Enviado para Comissão de Justiça').  
* **Vínculo entre Documentos:**  
  * Funcionalidade para vincular um documento a outro, como um Parecer a um ProjetoDeLei (usando o campo materia\_documento\_id).

### **Epic 4: Gestão de Sessões Plenárias**

* **Agendamento de Sessões:** CRUD completo para a tabela Sessoes.  
* **Montagem da Pauta (Ordem do Dia):**  
  * Interface para buscar matérias em tramitação e adicioná-las à pauta de uma sessão, registrando na tabela SessaoPauta.  
* **Registro de Presença:**  
  * Interface de "chamada" para registrar a presença ou ausência de cada vereador na sessão, populando a tabela SessaoPresenca.  
* **Registro de Votação:**  
  * Para cada matéria na pauta, interface para registrar o voto individual de cada vereador (Sim, Não, Abstenção), populando a tabela SessaoVotos.  
* **Geração da Ata:** Funcionalidade para compilar as informações da sessão (presença, pauta, votações) e gerar a ata.

### **Epic 5: Pesquisa Avançada**

* **Motor de Busca:**  
  * Um motor de busca poderoso que permita aos utilizadores internos filtrar documentos por tipo, autor, data, palavra-chave no texto, status da tramitação, e **por tags**.

## **4\. Requisitos Não-Funcionais**

* **Usabilidade:** A interface deve ser limpa, intuitiva e responsiva (acessível em desktops e dispositivos móveis).  
* **Performance:** Tempo de carregamento de páginas e resultados de busca deve ser inferior a 3 segundos.  
* **Segurança:** Uso obrigatório de HTTPS. Senhas devem ser armazenadas com hashing. Proteção contra vulnerabilidades web comuns (SQL Injection, XSS).  
* **Escalabilidade:** A arquitetura baseada no Supabase (PostgreSQL) deve ser capaz de suportar o crescimento do volume de dados e de utilizadores.  
* **Confiabilidade:** Backups regulares e automáticos do banco de dados para prevenir perda de dados.

## **5\. Roteiro de Lançamento (Roadmap)**

### **Fase 1: MVP \- Fundação e Documentos Essenciais**

* **Objetivo:** Lançar a versão inicial para uso interno da Secretaria.  
* **Funcionalidades:**  
  * Autenticação e gestão de utilizadores.  
  * CRUD completo para AgentesPublicos e toda a estrutura organizacional (Legislaturas, etc.).  
  * Criação, edição (em rascunho) e protocolo dos documentos mais comuns: Ofício, Requerimento e Projeto de Lei.  
  * Sistema de protocolo centralizado e geração de PDF.  
  * Sistema de tramitação simplificado.

### **Fase 2: Processo Legislativo Completo**

* **Objetivo:** Digitalizar todo o fluxo de uma sessão plenária.  
* **Funcionalidades:**  
  * Implementação de todos os demais tipos de documentos.  
  * Módulo completo de Gestão de Sessões (Pauta, Presença, Votação).  
  * Geração de atas.  
  * Busca avançada com Tags.  
  * Módulo de Gestão de Tags para Admins.

### **Fase 3: Recursos Avançados (Pós-Lançamento)**

* **Objetivo:** Modernizar ainda mais os processos internos.  
* **Funcionalidades:**  
  * Módulo de votação eletrônica em tempo real.  
  * Dashboards de análise e relatórios de produtividade.

*Este documento é um guia vivo e pode ser atualizado conforme o projeto evolui.*