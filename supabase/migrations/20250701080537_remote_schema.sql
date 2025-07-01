

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."cargo_comissao" AS ENUM (
    'Presidente',
    'Membro',
    'Relator'
);


ALTER TYPE "public"."cargo_comissao" OWNER TO "postgres";


CREATE TYPE "public"."cargo_mesa_diretora" AS ENUM (
    'Presidente',
    'Vice-Presidente',
    '1º Secretário',
    '2º Secretário',
    '1º Tesoureiro',
    '2º Tesoureiro'
);


ALTER TYPE "public"."cargo_mesa_diretora" OWNER TO "postgres";


CREATE TYPE "public"."condicao_vereador" AS ENUM (
    'Titular',
    'Suplente'
);


ALTER TYPE "public"."condicao_vereador" OWNER TO "postgres";


CREATE TYPE "public"."papel_documento_autor" AS ENUM (
    'Autor Principal',
    'Subscritor',
    'Relator',
    'Autor'
);


ALTER TYPE "public"."papel_documento_autor" OWNER TO "postgres";


CREATE TYPE "public"."permissao_usuario" AS ENUM (
    'Admin',
    'Assessoria',
    'Secretaria',
    'Vereador'
);


ALTER TYPE "public"."permissao_usuario" OWNER TO "postgres";


CREATE TYPE "public"."status_documento" AS ENUM (
    'Rascunho',
    'Protocolado',
    'Tramitando',
    'Arquivado'
);


ALTER TYPE "public"."status_documento" OWNER TO "postgres";


CREATE TYPE "public"."status_presenca" AS ENUM (
    'Presente',
    'Ausente',
    'Ausente com Justificativa'
);


ALTER TYPE "public"."status_presenca" OWNER TO "postgres";


CREATE TYPE "public"."status_sessao" AS ENUM (
    'Agendada',
    'Em Andamento',
    'Realizada',
    'Cancelada'
);


ALTER TYPE "public"."status_sessao" OWNER TO "postgres";


CREATE TYPE "public"."status_tramitacao" AS ENUM (
    'Protocolado',
    'Enviado para Comissão',
    'Aguardando Deliberação',
    'Aprovado em 1ª Votação',
    'Reprovado em 1ª Votação',
    'Em Interstício',
    'Aprovado em 2ª Votação',
    'Reprovado em 2ª Votação',
    'Aprovado em Votação Única',
    'Reprovado em Votação Única',
    'Enviado para Sanção',
    'Sancionado',
    'Promulgado',
    'Arquivado'
);


ALTER TYPE "public"."status_tramitacao" OWNER TO "postgres";


CREATE TYPE "public"."tipo_agente_publico" AS ENUM (
    'Vereador',
    'Funcionario'
);


ALTER TYPE "public"."tipo_agente_publico" OWNER TO "postgres";


CREATE TYPE "public"."tipo_autor_externo" AS ENUM (
    'Executivo Municipal',
    'Entidade',
    'Cidadão',
    'Outros Órgãos'
);


ALTER TYPE "public"."tipo_autor_externo" OWNER TO "postgres";


CREATE TYPE "public"."tipo_decreto_legislativo" AS ENUM (
    'Título de Cidadania',
    'Medalha',
    'Comenda',
    'Aprovação de Contas'
);


ALTER TYPE "public"."tipo_decreto_legislativo" OWNER TO "postgres";


CREATE TYPE "public"."tipo_mocao" AS ENUM (
    'Aplausos',
    'Solidariedade',
    'Pesar',
    'Protesto',
    'Repúdio'
);


ALTER TYPE "public"."tipo_mocao" OWNER TO "postgres";


CREATE TYPE "public"."tipo_sessao" AS ENUM (
    'Ordinária',
    'Extraordinária',
    'Solene'
);


ALTER TYPE "public"."tipo_sessao" OWNER TO "postgres";


CREATE TYPE "public"."tipo_vinculo_funcionario" AS ENUM (
    'Efetivo',
    'Comissionado',
    'Terceirizado'
);


ALTER TYPE "public"."tipo_vinculo_funcionario" OWNER TO "postgres";


CREATE TYPE "public"."voto_vereador" AS ENUM (
    'Sim',
    'Não',
    'Abstenção',
    'Ausente'
);


ALTER TYPE "public"."voto_vereador" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_agentes_publicos_com_status"() RETURNS TABLE("id" bigint, "nome_completo" character varying, "cpf" character varying, "foto_url" character varying, "tipo" "public"."tipo_agente_publico", "status_usuario" "text", "nome_parlamentar" character varying, "perfil" "text", "cargo" character varying, "tipo_vinculo" "public"."tipo_vinculo_funcionario", "data_admissao" "date", "data_exoneracao" "date")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    ap.id,
    ap.nome_completo,
    ap.cpf,
    ap.foto_url,
    ap.tipo,
    CASE 
      WHEN u.id IS NULL THEN 'Sem Acesso'
      WHEN au.last_sign_in_at IS NULL THEN 'Convite Pendente' 
      ELSE 'Ativo'
    END::text as status_usuario,
    v.nome_parlamentar,
    v.perfil,
    f.cargo,
    f.tipo_vinculo,
    f.data_admissao,
    f.data_exoneracao
  FROM public.agentespublicos ap
  LEFT JOIN public.usuarios u ON u.agente_publico_id = ap.id
  LEFT JOIN auth.users au ON au.id = u.id
  LEFT JOIN public.vereadores v ON v.agente_publico_id = ap.id
  LEFT JOIN public.funcionarios f ON f.agente_publico_id = ap.id
  ORDER BY ap.nome_completo;
$$;


ALTER FUNCTION "public"."get_agentes_publicos_com_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_agente_publico_id"() RETURNS bigint
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$  SELECT agente_publico_id FROM public.Usuarios WHERE id = auth.uid()$$;


ALTER FUNCTION "public"."get_my_agente_publico_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_permission"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$ SELECT permissao::TEXT FROM public.Usuarios WHERE id = auth.uid() $$;


ALTER FUNCTION "public"."get_my_permission"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_staff"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN (SELECT auth.uid()) IS NOT NULL AND (SELECT public.get_my_permission()) IN ('Admin', 'Assessoria', 'Secretaria');
END;
$$;


ALTER FUNCTION "public"."is_staff"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."agentespublicos" (
    "id" bigint NOT NULL,
    "nome_completo" character varying(255) NOT NULL,
    "cpf" character varying(14),
    "foto_url" character varying(255),
    "tipo" "public"."tipo_agente_publico" NOT NULL,
    "status_agente" "text" DEFAULT 'Ativo'::"text" NOT NULL
);


ALTER TABLE "public"."agentespublicos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."agentespublicos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."agentespublicos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."agentespublicos_id_seq" OWNED BY "public"."agentespublicos"."id";



CREATE TABLE IF NOT EXISTS "public"."autoresexternos" (
    "id" bigint NOT NULL,
    "nome" character varying(255) NOT NULL,
    "tipo" "public"."tipo_autor_externo",
    "cargo_descricao" character varying(255),
    "contato" "text"
);


ALTER TABLE "public"."autoresexternos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."autoresexternos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."autoresexternos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."autoresexternos_id_seq" OWNED BY "public"."autoresexternos"."id";



CREATE TABLE IF NOT EXISTS "public"."comissaomembros" (
    "id" bigint NOT NULL,
    "comissao_id" bigint NOT NULL,
    "agente_publico_id" bigint NOT NULL,
    "cargo" "public"."cargo_comissao"
);


ALTER TABLE "public"."comissaomembros" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comissaomembros_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."comissaomembros_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comissaomembros_id_seq" OWNED BY "public"."comissaomembros"."id";



CREATE TABLE IF NOT EXISTS "public"."comissoes" (
    "id" bigint NOT NULL,
    "periodo_sessao_id" bigint NOT NULL,
    "nome" character varying(255) NOT NULL,
    "descricao" "text"
);


ALTER TABLE "public"."comissoes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comissoes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."comissoes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comissoes_id_seq" OWNED BY "public"."comissoes"."id";



CREATE TABLE IF NOT EXISTS "public"."dadosgeraiscamara" (
    "id" bigint NOT NULL,
    "nome_oficial" character varying(255),
    "endereco_completo" "text",
    "cep" character varying(20),
    "cnpj" character varying(20),
    "telefone_contato" character varying(50),
    "email_oficial" character varying(255),
    "horario_funcionamento" character varying(255)
);


ALTER TABLE "public"."dadosgeraiscamara" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."dadosgeraiscamara_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."dadosgeraiscamara_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."dadosgeraiscamara_id_seq" OWNED BY "public"."dadosgeraiscamara"."id";



CREATE TABLE IF NOT EXISTS "public"."documentoautores" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "autor_id" bigint NOT NULL,
    "autor_type" character varying(255) NOT NULL,
    "papel" "public"."papel_documento_autor"
);


ALTER TABLE "public"."documentoautores" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."documentoautores_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."documentoautores_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."documentoautores_id_seq" OWNED BY "public"."documentoautores"."id";



CREATE TABLE IF NOT EXISTS "public"."documentos" (
    "id" bigint NOT NULL,
    "tipo_documento_id" bigint NOT NULL,
    "ano" integer NOT NULL,
    "status" "public"."status_documento" DEFAULT 'Rascunho'::"public"."status_documento",
    "arquivo_pdf_url" character varying(255),
    "arquivo_original_url" character varying(255),
    "data_protocolo" timestamp without time zone,
    "criado_por_usuario_id" "uuid" NOT NULL
);


ALTER TABLE "public"."documentos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."documentos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."documentos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."documentos_id_seq" OWNED BY "public"."documentos"."id";



CREATE TABLE IF NOT EXISTS "public"."documentotags" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "tag_id" bigint NOT NULL
);


ALTER TABLE "public"."documentotags" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."documentotags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."documentotags_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."documentotags_id_seq" OWNED BY "public"."documentotags"."id";



CREATE TABLE IF NOT EXISTS "public"."funcionarios" (
    "agente_publico_id" bigint NOT NULL,
    "cargo" character varying(255),
    "tipo_vinculo" "public"."tipo_vinculo_funcionario",
    "data_admissao" "date",
    "data_exoneracao" "date"
);


ALTER TABLE "public"."funcionarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."indicacoes" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "numero_indicacao" integer,
    "destinatario_texto" "text",
    "ementa" "text",
    "justificativa" "text"
);


ALTER TABLE "public"."indicacoes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."indicacoes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."indicacoes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."indicacoes_id_seq" OWNED BY "public"."indicacoes"."id";



CREATE TABLE IF NOT EXISTS "public"."legislaturas" (
    "id" bigint NOT NULL,
    "numero" integer NOT NULL,
    "data_inicio" "date" NOT NULL,
    "data_fim" "date" NOT NULL,
    "descricao" character varying(255)
);


ALTER TABLE "public"."legislaturas" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."legislaturas_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."legislaturas_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."legislaturas_id_seq" OWNED BY "public"."legislaturas"."id";



CREATE TABLE IF NOT EXISTS "public"."legislaturavereadores" (
    "id" bigint NOT NULL,
    "legislatura_id" bigint NOT NULL,
    "agente_publico_id" bigint NOT NULL,
    "partido" character varying(100),
    "condicao" "public"."condicao_vereador",
    "data_posse" "date",
    "data_afastamento" "date"
);


ALTER TABLE "public"."legislaturavereadores" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."legislaturavereadores_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."legislaturavereadores_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."legislaturavereadores_id_seq" OWNED BY "public"."legislaturavereadores"."id";



CREATE TABLE IF NOT EXISTS "public"."mesadiretoramembros" (
    "id" bigint NOT NULL,
    "mesa_diretora_id" bigint NOT NULL,
    "agente_publico_id" bigint NOT NULL,
    "cargo" "public"."cargo_mesa_diretora"
);


ALTER TABLE "public"."mesadiretoramembros" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."mesadiretoramembros_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."mesadiretoramembros_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."mesadiretoramembros_id_seq" OWNED BY "public"."mesadiretoramembros"."id";



CREATE TABLE IF NOT EXISTS "public"."mesasdiretoras" (
    "id" bigint NOT NULL,
    "periodo_sessao_id" bigint NOT NULL,
    "nome" character varying(255) NOT NULL
);


ALTER TABLE "public"."mesasdiretoras" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."mesasdiretoras_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."mesasdiretoras_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."mesasdiretoras_id_seq" OWNED BY "public"."mesasdiretoras"."id";



CREATE TABLE IF NOT EXISTS "public"."mocoes" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "numero_mocao" integer,
    "tipo_mocao" "public"."tipo_mocao",
    "ementa" "text",
    "homenageado_texto" "text",
    "justificativa" "text"
);


ALTER TABLE "public"."mocoes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."mocoes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."mocoes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."mocoes_id_seq" OWNED BY "public"."mocoes"."id";



CREATE TABLE IF NOT EXISTS "public"."oficios" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "numero_oficio" integer,
    "pronome_tratamento" character varying(255),
    "destinatario_nome" character varying(255),
    "destinatario_cargo" character varying(255),
    "destinatario_orgao" character varying(255),
    "assunto" character varying(255),
    "vocativo" character varying(255),
    "corpo_texto" "text",
    "justificativa" "text",
    "fecho_cortesia" character varying(255)
);


ALTER TABLE "public"."oficios" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."oficios_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."oficios_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."oficios_id_seq" OWNED BY "public"."oficios"."id";



CREATE TABLE IF NOT EXISTS "public"."pareceres" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "materia_documento_id" bigint NOT NULL,
    "resultado" character varying(255),
    "corpo_texto" "text"
);


ALTER TABLE "public"."pareceres" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."pareceres_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."pareceres_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."pareceres_id_seq" OWNED BY "public"."pareceres"."id";



CREATE TABLE IF NOT EXISTS "public"."periodossessao" (
    "id" bigint NOT NULL,
    "legislatura_id" bigint NOT NULL,
    "numero" integer NOT NULL,
    "data_inicio" "date" NOT NULL,
    "data_fim" "date" NOT NULL,
    "descricao" character varying(255)
);


ALTER TABLE "public"."periodossessao" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."periodossessao_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."periodossessao_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."periodossessao_id_seq" OWNED BY "public"."periodossessao"."id";



CREATE TABLE IF NOT EXISTS "public"."projetosdedecretolegislativo" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "numero_decreto" integer,
    "tipo_decreto" "public"."tipo_decreto_legislativo",
    "ementa" "text",
    "homenageado_nome" character varying(255),
    "exercicio_financeiro_contas" integer,
    "corpo_texto" "text",
    "justificativa" "text"
);


ALTER TABLE "public"."projetosdedecretolegislativo" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projetosdedecretolegislativo_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projetosdedecretolegislativo_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projetosdedecretolegislativo_id_seq" OWNED BY "public"."projetosdedecretolegislativo"."id";



CREATE TABLE IF NOT EXISTS "public"."projetosdeemendaorganica" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "numero_emenda" integer,
    "ementa" "text",
    "corpo_texto" "text",
    "justificativa" "text"
);


ALTER TABLE "public"."projetosdeemendaorganica" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projetosdeemendaorganica_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projetosdeemendaorganica_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projetosdeemendaorganica_id_seq" OWNED BY "public"."projetosdeemendaorganica"."id";



CREATE TABLE IF NOT EXISTS "public"."projetosdelei" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "numero_lei" integer,
    "ementa" "text",
    "corpo_texto" "text",
    "justificativa" "text"
);


ALTER TABLE "public"."projetosdelei" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projetosdelei_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projetosdelei_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projetosdelei_id_seq" OWNED BY "public"."projetosdelei"."id";



CREATE TABLE IF NOT EXISTS "public"."projetosderesolucao" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "numero_resolucao" integer,
    "ementa" "text",
    "corpo_texto" "text",
    "justificativa" "text"
);


ALTER TABLE "public"."projetosderesolucao" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."projetosderesolucao_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."projetosderesolucao_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."projetosderesolucao_id_seq" OWNED BY "public"."projetosderesolucao"."id";



CREATE TABLE IF NOT EXISTS "public"."requerimentos" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "numero_requerimento" integer,
    "destinatario_texto" "text",
    "corpo_texto" "text",
    "justificativa" "text",
    "fecho_cortesia" character varying(255)
);


ALTER TABLE "public"."requerimentos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."requerimentos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."requerimentos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."requerimentos_id_seq" OWNED BY "public"."requerimentos"."id";



CREATE TABLE IF NOT EXISTS "public"."sessaopauta" (
    "id" bigint NOT NULL,
    "sessao_id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "ordem" integer
);


ALTER TABLE "public"."sessaopauta" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sessaopauta_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sessaopauta_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sessaopauta_id_seq" OWNED BY "public"."sessaopauta"."id";



CREATE TABLE IF NOT EXISTS "public"."sessaopresenca" (
    "id" bigint NOT NULL,
    "sessao_id" bigint NOT NULL,
    "agente_publico_id" bigint NOT NULL,
    "status" "public"."status_presenca",
    "justificativa" "text"
);


ALTER TABLE "public"."sessaopresenca" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sessaopresenca_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sessaopresenca_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sessaopresenca_id_seq" OWNED BY "public"."sessaopresenca"."id";



CREATE TABLE IF NOT EXISTS "public"."sessaovotos" (
    "id" bigint NOT NULL,
    "sessao_id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "agente_publico_id" bigint NOT NULL,
    "voto" "public"."voto_vereador"
);


ALTER TABLE "public"."sessaovotos" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sessaovotos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sessaovotos_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sessaovotos_id_seq" OWNED BY "public"."sessaovotos"."id";



CREATE TABLE IF NOT EXISTS "public"."sessoes" (
    "id" bigint NOT NULL,
    "periodo_sessao_id" bigint NOT NULL,
    "numero" integer,
    "tipo_sessao" "public"."tipo_sessao",
    "data_abertura" timestamp with time zone,
    "data_fechamento" timestamp with time zone,
    "status" "public"."status_sessao",
    "pauta_texto" "text",
    "ata_texto" "text"
);


ALTER TABLE "public"."sessoes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."sessoes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."sessoes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."sessoes_id_seq" OWNED BY "public"."sessoes"."id";



CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" bigint NOT NULL,
    "nome" character varying(255) NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tags_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tags_id_seq" OWNED BY "public"."tags"."id";



CREATE TABLE IF NOT EXISTS "public"."tiposdedocumento" (
    "id" bigint NOT NULL,
    "nome" character varying(255) NOT NULL,
    "descricao" "text",
    "is_materia" boolean DEFAULT false
);


ALTER TABLE "public"."tiposdedocumento" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tiposdedocumento_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tiposdedocumento_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tiposdedocumento_id_seq" OWNED BY "public"."tiposdedocumento"."id";



CREATE TABLE IF NOT EXISTS "public"."tramitacoes" (
    "id" bigint NOT NULL,
    "documento_id" bigint NOT NULL,
    "data_hora" timestamp with time zone DEFAULT "now"(),
    "status" "public"."status_tramitacao",
    "descricao" "text",
    "responsavel_id" bigint,
    "responsavel_type" character varying(255),
    "usuario_id" "uuid" NOT NULL
);


ALTER TABLE "public"."tramitacoes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tramitacoes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tramitacoes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tramitacoes_id_seq" OWNED BY "public"."tramitacoes"."id";



CREATE TABLE IF NOT EXISTS "public"."usuarios" (
    "id" "uuid" NOT NULL,
    "agente_publico_id" bigint NOT NULL,
    "email" character varying(255) NOT NULL,
    "permissao" "public"."permissao_usuario"
);


ALTER TABLE "public"."usuarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vereadores" (
    "agente_publico_id" bigint NOT NULL,
    "nome_parlamentar" character varying(255),
    "perfil" "text"
);


ALTER TABLE "public"."vereadores" OWNER TO "postgres";


ALTER TABLE ONLY "public"."agentespublicos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."agentespublicos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."autoresexternos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."autoresexternos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."comissaomembros" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."comissaomembros_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."comissoes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."comissoes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."dadosgeraiscamara" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."dadosgeraiscamara_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."documentoautores" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."documentoautores_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."documentos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."documentos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."documentotags" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."documentotags_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."indicacoes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."indicacoes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."legislaturas" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."legislaturas_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."legislaturavereadores" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."legislaturavereadores_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."mesadiretoramembros" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."mesadiretoramembros_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."mesasdiretoras" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."mesasdiretoras_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."mocoes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."mocoes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."oficios" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."oficios_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."pareceres" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."pareceres_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."periodossessao" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."periodossessao_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projetosdedecretolegislativo" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projetosdedecretolegislativo_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projetosdeemendaorganica" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projetosdeemendaorganica_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projetosdelei" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projetosdelei_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."projetosderesolucao" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."projetosderesolucao_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."requerimentos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."requerimentos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sessaopauta" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sessaopauta_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sessaopresenca" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sessaopresenca_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sessaovotos" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sessaovotos_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."sessoes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."sessoes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tags" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tags_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tiposdedocumento" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tiposdedocumento_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."tramitacoes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tramitacoes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."agentespublicos"
    ADD CONSTRAINT "agentespublicos_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."agentespublicos"
    ADD CONSTRAINT "agentespublicos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."autoresexternos"
    ADD CONSTRAINT "autoresexternos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comissaomembros"
    ADD CONSTRAINT "comissaomembros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."comissoes"
    ADD CONSTRAINT "comissoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dadosgeraiscamara"
    ADD CONSTRAINT "dadosgeraiscamara_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documentoautores"
    ADD CONSTRAINT "documentoautores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documentos"
    ADD CONSTRAINT "documentos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documentotags"
    ADD CONSTRAINT "documentotags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funcionarios"
    ADD CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("agente_publico_id");



ALTER TABLE ONLY "public"."indicacoes"
    ADD CONSTRAINT "indicacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legislaturas"
    ADD CONSTRAINT "legislaturas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."legislaturavereadores"
    ADD CONSTRAINT "legislaturavereadores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mesadiretoramembros"
    ADD CONSTRAINT "mesadiretoramembros_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mesasdiretoras"
    ADD CONSTRAINT "mesasdiretoras_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mocoes"
    ADD CONSTRAINT "mocoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."oficios"
    ADD CONSTRAINT "oficios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pareceres"
    ADD CONSTRAINT "pareceres_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."periodossessao"
    ADD CONSTRAINT "periodossessao_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projetosdedecretolegislativo"
    ADD CONSTRAINT "projetosdedecretolegislativo_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projetosdeemendaorganica"
    ADD CONSTRAINT "projetosdeemendaorganica_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projetosdelei"
    ADD CONSTRAINT "projetosdelei_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projetosderesolucao"
    ADD CONSTRAINT "projetosderesolucao_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."requerimentos"
    ADD CONSTRAINT "requerimentos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessaopauta"
    ADD CONSTRAINT "sessaopauta_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessaopresenca"
    ADD CONSTRAINT "sessaopresenca_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessaovotos"
    ADD CONSTRAINT "sessaovotos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sessoes"
    ADD CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tiposdedocumento"
    ADD CONSTRAINT "tiposdedocumento_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tramitacoes"
    ADD CONSTRAINT "tramitacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_agente_publico_id_key" UNIQUE ("agente_publico_id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vereadores"
    ADD CONSTRAINT "vereadores_pkey" PRIMARY KEY ("agente_publico_id");



ALTER TABLE ONLY "public"."comissaomembros"
    ADD CONSTRAINT "comissaomembros_agente_publico_id_fkey" FOREIGN KEY ("agente_publico_id") REFERENCES "public"."agentespublicos"("id");



ALTER TABLE ONLY "public"."comissaomembros"
    ADD CONSTRAINT "comissaomembros_comissao_id_fkey" FOREIGN KEY ("comissao_id") REFERENCES "public"."comissoes"("id");



ALTER TABLE ONLY "public"."comissoes"
    ADD CONSTRAINT "comissoes_periodo_sessao_id_fkey" FOREIGN KEY ("periodo_sessao_id") REFERENCES "public"."periodossessao"("id");



ALTER TABLE ONLY "public"."documentoautores"
    ADD CONSTRAINT "documentoautores_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documentos"
    ADD CONSTRAINT "documentos_criado_por_usuario_id_fkey" FOREIGN KEY ("criado_por_usuario_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."documentos"
    ADD CONSTRAINT "documentos_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "public"."tiposdedocumento"("id");



ALTER TABLE ONLY "public"."documentotags"
    ADD CONSTRAINT "documentotags_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documentotags"
    ADD CONSTRAINT "documentotags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."funcionarios"
    ADD CONSTRAINT "funcionarios_agente_publico_id_fkey" FOREIGN KEY ("agente_publico_id") REFERENCES "public"."agentespublicos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."indicacoes"
    ADD CONSTRAINT "indicacoes_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."legislaturavereadores"
    ADD CONSTRAINT "legislaturavereadores_agente_publico_id_fkey" FOREIGN KEY ("agente_publico_id") REFERENCES "public"."agentespublicos"("id");



ALTER TABLE ONLY "public"."legislaturavereadores"
    ADD CONSTRAINT "legislaturavereadores_legislatura_id_fkey" FOREIGN KEY ("legislatura_id") REFERENCES "public"."legislaturas"("id");



ALTER TABLE ONLY "public"."mesadiretoramembros"
    ADD CONSTRAINT "mesadiretoramembros_agente_publico_id_fkey" FOREIGN KEY ("agente_publico_id") REFERENCES "public"."agentespublicos"("id");



ALTER TABLE ONLY "public"."mesadiretoramembros"
    ADD CONSTRAINT "mesadiretoramembros_mesa_diretora_id_fkey" FOREIGN KEY ("mesa_diretora_id") REFERENCES "public"."mesasdiretoras"("id");



ALTER TABLE ONLY "public"."mesasdiretoras"
    ADD CONSTRAINT "mesasdiretoras_periodo_sessao_id_fkey" FOREIGN KEY ("periodo_sessao_id") REFERENCES "public"."periodossessao"("id");



ALTER TABLE ONLY "public"."mocoes"
    ADD CONSTRAINT "mocoes_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."oficios"
    ADD CONSTRAINT "oficios_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pareceres"
    ADD CONSTRAINT "pareceres_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pareceres"
    ADD CONSTRAINT "pareceres_materia_documento_id_fkey" FOREIGN KEY ("materia_documento_id") REFERENCES "public"."documentos"("id");



ALTER TABLE ONLY "public"."periodossessao"
    ADD CONSTRAINT "periodossessao_legislatura_id_fkey" FOREIGN KEY ("legislatura_id") REFERENCES "public"."legislaturas"("id");



ALTER TABLE ONLY "public"."projetosdedecretolegislativo"
    ADD CONSTRAINT "projetosdedecretolegislativo_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projetosdeemendaorganica"
    ADD CONSTRAINT "projetosdeemendaorganica_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projetosdelei"
    ADD CONSTRAINT "projetosdelei_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projetosderesolucao"
    ADD CONSTRAINT "projetosderesolucao_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."requerimentos"
    ADD CONSTRAINT "requerimentos_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessaopauta"
    ADD CONSTRAINT "sessaopauta_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessaopauta"
    ADD CONSTRAINT "sessaopauta_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "public"."sessoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessaopresenca"
    ADD CONSTRAINT "sessaopresenca_agente_publico_id_fkey" FOREIGN KEY ("agente_publico_id") REFERENCES "public"."agentespublicos"("id");



ALTER TABLE ONLY "public"."sessaopresenca"
    ADD CONSTRAINT "sessaopresenca_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "public"."sessoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessaovotos"
    ADD CONSTRAINT "sessaovotos_agente_publico_id_fkey" FOREIGN KEY ("agente_publico_id") REFERENCES "public"."agentespublicos"("id");



ALTER TABLE ONLY "public"."sessaovotos"
    ADD CONSTRAINT "sessaovotos_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessaovotos"
    ADD CONSTRAINT "sessaovotos_sessao_id_fkey" FOREIGN KEY ("sessao_id") REFERENCES "public"."sessoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sessoes"
    ADD CONSTRAINT "sessoes_periodo_sessao_id_fkey" FOREIGN KEY ("periodo_sessao_id") REFERENCES "public"."periodossessao"("id");



ALTER TABLE ONLY "public"."tramitacoes"
    ADD CONSTRAINT "tramitacoes_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "public"."documentos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tramitacoes"
    ADD CONSTRAINT "tramitacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_agente_publico_id_fkey" FOREIGN KEY ("agente_publico_id") REFERENCES "public"."agentespublicos"("id");



ALTER TABLE ONLY "public"."usuarios"
    ADD CONSTRAINT "usuarios_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vereadores"
    ADD CONSTRAINT "vereadores_agente_publico_id_fkey" FOREIGN KEY ("agente_publico_id") REFERENCES "public"."agentespublicos"("id") ON DELETE CASCADE;



CREATE POLICY "Acesso a ligações Documento-Tags" ON "public"."documentotags" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "documentotags"."documento_id")))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE (("documentos"."id" = "documentotags"."documento_id") AND ("documentos"."status" = 'Rascunho'::"public"."status_documento") AND (("documentos"."criado_por_usuario_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_staff"() AS "is_staff"))))));



CREATE POLICY "Acesso consolidado para Usuarios" ON "public"."usuarios" USING ((("id" = ( SELECT "auth"."uid"() AS "uid")) OR (( SELECT "public"."get_my_permission"() AS "get_my_permission") = 'Admin'::"text"))) WITH CHECK ((("id" = ( SELECT "auth"."uid"() AS "uid")) OR (( SELECT "public"."get_my_permission"() AS "get_my_permission") = 'Admin'::"text")));



CREATE POLICY "Acesso geral a DocumentoAutores" ON "public"."documentoautores" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "documentoautores"."documento_id")))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE (("documentos"."id" = "documentoautores"."documento_id") AND ("documentos"."status" = 'Rascunho'::"public"."status_documento") AND (("documentos"."criado_por_usuario_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_staff"() AS "is_staff"))))));



CREATE POLICY "Acesso geral para AgentesPublicos" ON "public"."agentespublicos" USING (true) WITH CHECK (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Acesso geral para Funcionarios" ON "public"."funcionarios" USING (true) WITH CHECK (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Acesso geral para Vereadores" ON "public"."vereadores" USING (true) WITH CHECK (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Acesso herdado da tabela Documentos" ON "public"."indicacoes" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "indicacoes"."documento_id"))));



CREATE POLICY "Acesso herdado da tabela Documentos" ON "public"."mocoes" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "mocoes"."documento_id"))));



CREATE POLICY "Acesso herdado da tabela Documentos" ON "public"."oficios" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "oficios"."documento_id"))));



CREATE POLICY "Acesso herdado da tabela Documentos" ON "public"."projetosdedecretolegislativo" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "projetosdedecretolegislativo"."documento_id"))));



CREATE POLICY "Acesso herdado da tabela Documentos" ON "public"."projetosdeemendaorganica" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "projetosdeemendaorganica"."documento_id"))));



CREATE POLICY "Acesso herdado da tabela Documentos" ON "public"."projetosdelei" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "projetosdelei"."documento_id"))));



CREATE POLICY "Acesso herdado da tabela Documentos" ON "public"."projetosderesolucao" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "projetosderesolucao"."documento_id"))));



CREATE POLICY "Acesso herdado da tabela Documentos" ON "public"."requerimentos" USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "requerimentos"."documento_id"))));



CREATE POLICY "Atualização de Tags por Admins" ON "public"."tags" FOR UPDATE USING ((( SELECT "public"."get_my_permission"() AS "get_my_permission") = 'Admin'::"text"));



CREATE POLICY "Atualização própria ou Admin" ON "public"."usuarios" FOR UPDATE USING ((("id" = "auth"."uid"()) OR ("public"."get_my_permission"() = 'Admin'::"text"))) WITH CHECK ((("id" = "auth"."uid"()) OR ("public"."get_my_permission"() = 'Admin'::"text")));



CREATE POLICY "Criação de Agentes por Staff" ON "public"."agentespublicos" FOR INSERT WITH CHECK (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Criação de Funcionarios por Staff" ON "public"."funcionarios" FOR INSERT WITH CHECK (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Criação de Tags" ON "public"."tags" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Criação de Vereadores por Staff" ON "public"."vereadores" FOR INSERT WITH CHECK (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Criação de documentos" ON "public"."documentos" FOR INSERT WITH CHECK ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Criação de pareceres" ON "public"."pareceres" FOR INSERT WITH CHECK (((( SELECT "public"."get_my_permission"() AS "get_my_permission") = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text"])) AND (EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "pareceres"."documento_id")))));



CREATE POLICY "Exclusão de Agentes por Staff" ON "public"."agentespublicos" FOR DELETE USING (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Exclusão de Funcionarios por Staff" ON "public"."funcionarios" FOR DELETE USING (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Exclusão de Tags por Admins" ON "public"."tags" FOR DELETE USING ((( SELECT "public"."get_my_permission"() AS "get_my_permission") = 'Admin'::"text"));



CREATE POLICY "Exclusão de Vereadores por Staff" ON "public"."vereadores" FOR DELETE USING (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Exclusão de documentos" ON "public"."documentos" FOR DELETE USING ((("status" = 'Rascunho'::"public"."status_documento") AND (("criado_por_usuario_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_staff"() AS "is_staff"))));



CREATE POLICY "Exclusão de pareceres" ON "public"."pareceres" FOR DELETE USING (((( SELECT "public"."get_my_permission"() AS "get_my_permission") = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text"])) AND (EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "pareceres"."documento_id")))));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."autoresexternos" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."comissaomembros" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."comissoes" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."dadosgeraiscamara" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."legislaturas" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."legislaturavereadores" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."mesadiretoramembros" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."mesasdiretoras" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."periodossessao" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."sessaopauta" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."sessaopresenca" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."sessaovotos" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."sessoes" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."tiposdedocumento" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Gestão permitida para staff autorizado" ON "public"."tramitacoes" USING (("public"."get_my_permission"() = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text", 'Secretaria'::"text"])));



CREATE POLICY "Leitura de Tags" ON "public"."tags" FOR SELECT USING ((( SELECT "auth"."role"() AS "role") = 'authenticated'::"text"));



CREATE POLICY "Leitura de documentos" ON "public"."documentos" FOR SELECT USING ((( SELECT "public"."is_staff"() AS "is_staff") OR ("status" <> 'Rascunho'::"public"."status_documento") OR ("criado_por_usuario_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Leitura de pareceres" ON "public"."pareceres" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "pareceres"."documento_id"))));



CREATE POLICY "Leitura permitida para todos" ON "public"."autoresexternos" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."comissaomembros" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."comissoes" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."dadosgeraiscamara" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."legislaturas" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."legislaturavereadores" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."mesadiretoramembros" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."mesasdiretoras" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."periodossessao" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."sessaopauta" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."sessaopresenca" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."sessaovotos" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."sessoes" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."tiposdedocumento" FOR SELECT USING (true);



CREATE POLICY "Leitura permitida para todos" ON "public"."tramitacoes" FOR SELECT USING (true);



CREATE POLICY "Leitura própria ou Admin" ON "public"."usuarios" FOR SELECT USING ((("id" = "auth"."uid"()) OR ("public"."get_my_permission"() = 'Admin'::"text")));



CREATE POLICY "Leitura pública de Agentes" ON "public"."agentespublicos" FOR SELECT USING (true);



CREATE POLICY "Leitura pública de Funcionarios" ON "public"."funcionarios" FOR SELECT USING (true);



CREATE POLICY "Leitura pública de Vereadores" ON "public"."vereadores" FOR SELECT USING (true);



CREATE POLICY "Leitura segura de DocumentoAutores" ON "public"."documentoautores" FOR SELECT USING (("documento_id" IN ( SELECT "documentos"."id"
   FROM "public"."documentos"
  WHERE (("documentos"."status" = 'Rascunho'::"public"."status_documento") AND (("documentos"."criado_por_usuario_id" = "auth"."uid"()) OR "public"."is_staff"())))));



CREATE POLICY "Modificação de Agentes por Staff" ON "public"."agentespublicos" FOR UPDATE USING (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Modificação de Funcionarios por Staff" ON "public"."funcionarios" FOR UPDATE USING (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Modificação de Vereadores por Staff" ON "public"."vereadores" FOR UPDATE USING (( SELECT "public"."is_staff"() AS "is_staff"));



CREATE POLICY "Modificação de documentos" ON "public"."documentos" FOR UPDATE USING ((("status" = 'Rascunho'::"public"."status_documento") AND (("criado_por_usuario_id" = ( SELECT "auth"."uid"() AS "uid")) OR ( SELECT "public"."is_staff"() AS "is_staff"))));



CREATE POLICY "Modificação de pareceres" ON "public"."pareceres" FOR UPDATE USING (((( SELECT "public"."get_my_permission"() AS "get_my_permission") = ANY (ARRAY['Admin'::"text", 'Assessoria'::"text"])) AND (EXISTS ( SELECT 1
   FROM "public"."documentos"
  WHERE ("documentos"."id" = "pareceres"."documento_id")))));



CREATE POLICY "Modificação segura de DocumentoAutores" ON "public"."documentoautores" USING (("documento_id" IN ( SELECT "documentos"."id"
   FROM "public"."documentos"
  WHERE (("documentos"."status" = 'Rascunho'::"public"."status_documento") AND (("documentos"."criado_por_usuario_id" = "auth"."uid"()) OR "public"."is_staff"()))))) WITH CHECK (("documento_id" IN ( SELECT "documentos"."id"
   FROM "public"."documentos"
  WHERE (("documentos"."status" = 'Rascunho'::"public"."status_documento") AND (("documentos"."criado_por_usuario_id" = "auth"."uid"()) OR "public"."is_staff"())))));



CREATE POLICY "Staff can delete agentes publicos" ON "public"."agentespublicos" FOR DELETE TO "authenticated" USING ("public"."is_staff"());



CREATE POLICY "Staff can insert agentes publicos" ON "public"."agentespublicos" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff can manage funcionarios" ON "public"."funcionarios" TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff can manage vereadores" ON "public"."vereadores" TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff can update agentes publicos" ON "public"."agentespublicos" FOR UPDATE TO "authenticated" USING ("public"."is_staff"()) WITH CHECK ("public"."is_staff"());



CREATE POLICY "Staff can view all agentes publicos" ON "public"."agentespublicos" FOR SELECT TO "authenticated" USING ("public"."is_staff"());



ALTER TABLE "public"."agentespublicos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."autoresexternos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comissaomembros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."comissoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dadosgeraiscamara" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documentoautores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documentos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documentotags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."funcionarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."indicacoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."legislaturas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."legislaturavereadores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mesadiretoramembros" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mesasdiretoras" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mocoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."oficios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pareceres" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."periodossessao" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projetosdedecretolegislativo" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projetosdeemendaorganica" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projetosdelei" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projetosderesolucao" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."requerimentos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessaopauta" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessaopresenca" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessaovotos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sessoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tiposdedocumento" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tramitacoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vereadores" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_agentes_publicos_com_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_agentes_publicos_com_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_agentes_publicos_com_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_agente_publico_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_agente_publico_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_agente_publico_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_permission"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_permission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_permission"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_staff"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff"() TO "service_role";


















GRANT ALL ON TABLE "public"."agentespublicos" TO "anon";
GRANT ALL ON TABLE "public"."agentespublicos" TO "authenticated";
GRANT ALL ON TABLE "public"."agentespublicos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."agentespublicos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."agentespublicos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."agentespublicos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."autoresexternos" TO "anon";
GRANT ALL ON TABLE "public"."autoresexternos" TO "authenticated";
GRANT ALL ON TABLE "public"."autoresexternos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."autoresexternos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."autoresexternos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."autoresexternos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comissaomembros" TO "anon";
GRANT ALL ON TABLE "public"."comissaomembros" TO "authenticated";
GRANT ALL ON TABLE "public"."comissaomembros" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comissaomembros_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comissaomembros_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comissaomembros_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comissoes" TO "anon";
GRANT ALL ON TABLE "public"."comissoes" TO "authenticated";
GRANT ALL ON TABLE "public"."comissoes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comissoes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comissoes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comissoes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."dadosgeraiscamara" TO "anon";
GRANT ALL ON TABLE "public"."dadosgeraiscamara" TO "authenticated";
GRANT ALL ON TABLE "public"."dadosgeraiscamara" TO "service_role";



GRANT ALL ON SEQUENCE "public"."dadosgeraiscamara_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."dadosgeraiscamara_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."dadosgeraiscamara_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."documentoautores" TO "anon";
GRANT ALL ON TABLE "public"."documentoautores" TO "authenticated";
GRANT ALL ON TABLE "public"."documentoautores" TO "service_role";



GRANT ALL ON SEQUENCE "public"."documentoautores_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."documentoautores_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."documentoautores_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."documentos" TO "anon";
GRANT ALL ON TABLE "public"."documentos" TO "authenticated";
GRANT ALL ON TABLE "public"."documentos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."documentos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."documentos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."documentos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."documentotags" TO "anon";
GRANT ALL ON TABLE "public"."documentotags" TO "authenticated";
GRANT ALL ON TABLE "public"."documentotags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."documentotags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."documentotags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."documentotags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."funcionarios" TO "anon";
GRANT ALL ON TABLE "public"."funcionarios" TO "authenticated";
GRANT ALL ON TABLE "public"."funcionarios" TO "service_role";



GRANT ALL ON TABLE "public"."indicacoes" TO "anon";
GRANT ALL ON TABLE "public"."indicacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."indicacoes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."indicacoes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."indicacoes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."indicacoes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."legislaturas" TO "anon";
GRANT ALL ON TABLE "public"."legislaturas" TO "authenticated";
GRANT ALL ON TABLE "public"."legislaturas" TO "service_role";



GRANT ALL ON SEQUENCE "public"."legislaturas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."legislaturas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."legislaturas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."legislaturavereadores" TO "anon";
GRANT ALL ON TABLE "public"."legislaturavereadores" TO "authenticated";
GRANT ALL ON TABLE "public"."legislaturavereadores" TO "service_role";



GRANT ALL ON SEQUENCE "public"."legislaturavereadores_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."legislaturavereadores_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."legislaturavereadores_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mesadiretoramembros" TO "anon";
GRANT ALL ON TABLE "public"."mesadiretoramembros" TO "authenticated";
GRANT ALL ON TABLE "public"."mesadiretoramembros" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mesadiretoramembros_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mesadiretoramembros_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mesadiretoramembros_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mesasdiretoras" TO "anon";
GRANT ALL ON TABLE "public"."mesasdiretoras" TO "authenticated";
GRANT ALL ON TABLE "public"."mesasdiretoras" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mesasdiretoras_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mesasdiretoras_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mesasdiretoras_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mocoes" TO "anon";
GRANT ALL ON TABLE "public"."mocoes" TO "authenticated";
GRANT ALL ON TABLE "public"."mocoes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mocoes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mocoes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mocoes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."oficios" TO "anon";
GRANT ALL ON TABLE "public"."oficios" TO "authenticated";
GRANT ALL ON TABLE "public"."oficios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."oficios_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."oficios_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."oficios_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."pareceres" TO "anon";
GRANT ALL ON TABLE "public"."pareceres" TO "authenticated";
GRANT ALL ON TABLE "public"."pareceres" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pareceres_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pareceres_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pareceres_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."periodossessao" TO "anon";
GRANT ALL ON TABLE "public"."periodossessao" TO "authenticated";
GRANT ALL ON TABLE "public"."periodossessao" TO "service_role";



GRANT ALL ON SEQUENCE "public"."periodossessao_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."periodossessao_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."periodossessao_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projetosdedecretolegislativo" TO "anon";
GRANT ALL ON TABLE "public"."projetosdedecretolegislativo" TO "authenticated";
GRANT ALL ON TABLE "public"."projetosdedecretolegislativo" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projetosdedecretolegislativo_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projetosdedecretolegislativo_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projetosdedecretolegislativo_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projetosdeemendaorganica" TO "anon";
GRANT ALL ON TABLE "public"."projetosdeemendaorganica" TO "authenticated";
GRANT ALL ON TABLE "public"."projetosdeemendaorganica" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projetosdeemendaorganica_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projetosdeemendaorganica_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projetosdeemendaorganica_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projetosdelei" TO "anon";
GRANT ALL ON TABLE "public"."projetosdelei" TO "authenticated";
GRANT ALL ON TABLE "public"."projetosdelei" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projetosdelei_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projetosdelei_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projetosdelei_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."projetosderesolucao" TO "anon";
GRANT ALL ON TABLE "public"."projetosderesolucao" TO "authenticated";
GRANT ALL ON TABLE "public"."projetosderesolucao" TO "service_role";



GRANT ALL ON SEQUENCE "public"."projetosderesolucao_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."projetosderesolucao_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."projetosderesolucao_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."requerimentos" TO "anon";
GRANT ALL ON TABLE "public"."requerimentos" TO "authenticated";
GRANT ALL ON TABLE "public"."requerimentos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."requerimentos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."requerimentos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."requerimentos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessaopauta" TO "anon";
GRANT ALL ON TABLE "public"."sessaopauta" TO "authenticated";
GRANT ALL ON TABLE "public"."sessaopauta" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sessaopauta_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessaopauta_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessaopauta_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessaopresenca" TO "anon";
GRANT ALL ON TABLE "public"."sessaopresenca" TO "authenticated";
GRANT ALL ON TABLE "public"."sessaopresenca" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sessaopresenca_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessaopresenca_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessaopresenca_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessaovotos" TO "anon";
GRANT ALL ON TABLE "public"."sessaovotos" TO "authenticated";
GRANT ALL ON TABLE "public"."sessaovotos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sessaovotos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessaovotos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessaovotos_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."sessoes" TO "anon";
GRANT ALL ON TABLE "public"."sessoes" TO "authenticated";
GRANT ALL ON TABLE "public"."sessoes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."sessoes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessoes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessoes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tiposdedocumento" TO "anon";
GRANT ALL ON TABLE "public"."tiposdedocumento" TO "authenticated";
GRANT ALL ON TABLE "public"."tiposdedocumento" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tiposdedocumento_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tiposdedocumento_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tiposdedocumento_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."tramitacoes" TO "anon";
GRANT ALL ON TABLE "public"."tramitacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."tramitacoes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tramitacoes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."tramitacoes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."tramitacoes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios" TO "anon";
GRANT ALL ON TABLE "public"."usuarios" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios" TO "service_role";



GRANT ALL ON TABLE "public"."vereadores" TO "anon";
GRANT ALL ON TABLE "public"."vereadores" TO "authenticated";
GRANT ALL ON TABLE "public"."vereadores" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
