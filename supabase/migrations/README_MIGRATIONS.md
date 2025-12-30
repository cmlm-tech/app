# Como Aplicar as Migrations

## Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/itjlzbnrdileuapsqwwe/sql/new
2. Execute cada migration na ordem:
   - `20251230_01_create_pessoa.sql`
   - `20251230_02_create_orgao.sql`
   - `20251230_03_create_cargo.sql`
   - `20251230_04_create_ocupacao_cargo.sql`
   - `20251230_05_migrate_data.sql`
   - `20251230_06_create_view.sql`

3. Copie e cole o conteúdo de cada arquivo e clique em "Run"

## Opção 2: Via Supabase CLI (Se configurado)

```bash
cd /home/cadullira/Development/app
supabase db push
```

## Verificação Pós-Migração

Execute no SQL Editor:

```sql
-- Verificar tabelas criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pessoa', 'orgao', 'cargo', 'ocupacao_cargo');

-- Verificar dados migrados
SELECT 'Pessoas' as tipo, COUNT(*) as total FROM pessoa
UNION ALL
SELECT 'Órgãos', COUNT(*) FROM orgao
UNION ALL
SELECT 'Cargos', COUNT(*) FROM cargo
UNION ALL
SELECT 'Ocupações', COUNT(*) FROM ocupacao_cargo;

-- Testar VIEW
SELECT * FROM destinatarios;
```

Resultado esperado:
- 6 pessoas
- 6 órgãos  
- 6 cargos
- 6 ocupações
- VIEW retorna os mesmos 6 registros
