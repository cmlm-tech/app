-- Adiciona o valor 'Inativo' ao enum permissao_usuario para permitir inativação de usuários
ALTER TYPE "public"."permissao_usuario" ADD VALUE IF NOT EXISTS 'Inativo';
