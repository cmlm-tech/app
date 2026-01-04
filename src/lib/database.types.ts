export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agentespublicos: {
        Row: {
          cpf: string | null
          foto_url: string | null
          id: number
          nome_completo: string
          tipo: Database["public"]["Enums"]["tipo_agente_publico"]
        }
        Insert: {
          cpf?: string | null
          foto_url?: string | null
          id?: number
          nome_completo: string
          tipo: Database["public"]["Enums"]["tipo_agente_publico"]
        }
        Update: {
          cpf?: string | null
          foto_url?: string | null
          id?: number
          nome_completo?: string
          tipo?: Database["public"]["Enums"]["tipo_agente_publico"]
        }
        Relationships: []
      }
      anexos: {
        Row: {
          caminho_arquivo: string
          created_at: string | null
          documento_id: number
          id: number
          nome_arquivo: string
          tamanho: number | null
          tipo_arquivo: string | null
          url_publica: string | null
          usuario_id: string | null
        }
        Insert: {
          caminho_arquivo: string
          created_at?: string | null
          documento_id: number
          id?: number
          nome_arquivo: string
          tamanho?: number | null
          tipo_arquivo?: string | null
          url_publica?: string | null
          usuario_id?: string | null
        }
        Update: {
          caminho_arquivo?: string
          created_at?: string | null
          documento_id?: number
          id?: number
          nome_arquivo?: string
          tamanho?: number | null
          tipo_arquivo?: string | null
          url_publica?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anexos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      atas: {
        Row: {
          documento_id: number
          id: number
          resumo_pauta: string | null
          sessao_id: number
          texto: string
        }
        Insert: {
          documento_id: number
          id?: number
          resumo_pauta?: string | null
          sessao_id: number
          texto: string
        }
        Update: {
          documento_id?: number
          id?: number
          resumo_pauta?: string | null
          sessao_id?: number
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "atas_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: true
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atas_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: true
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      atividade_log: {
        Row: {
          agente_publico_id: number | null
          created_at: string | null
          descricao: string
          entidade_id: number | null
          entidade_tipo: string | null
          id: number
          tipo: string
        }
        Insert: {
          agente_publico_id?: number | null
          created_at?: string | null
          descricao: string
          entidade_id?: number | null
          entidade_tipo?: string | null
          id?: number
          tipo: string
        }
        Update: {
          agente_publico_id?: number | null
          created_at?: string | null
          descricao?: string
          entidade_id?: number | null
          entidade_tipo?: string | null
          id?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividade_log_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
        ]
      }
      atualizacao: {
        Row: {
          created_at: string
          id: number
          numero: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          numero?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          numero?: number | null
        }
        Relationships: []
      }
      autoresexternos: {
        Row: {
          cargo_descricao: string | null
          contato: string | null
          id: number
          nome: string
          tipo: Database["public"]["Enums"]["tipo_autor_externo"] | null
        }
        Insert: {
          cargo_descricao?: string | null
          contato?: string | null
          id?: number
          nome: string
          tipo?: Database["public"]["Enums"]["tipo_autor_externo"] | null
        }
        Update: {
          cargo_descricao?: string | null
          contato?: string | null
          id?: number
          nome?: string
          tipo?: Database["public"]["Enums"]["tipo_autor_externo"] | null
        }
        Relationships: []
      }
      cargo: {
        Row: {
          criado_em: string | null
          id: number
          nome: string
          orgao_id: number | null
          permite_generico: boolean | null
        }
        Insert: {
          criado_em?: string | null
          id?: number
          nome: string
          orgao_id?: number | null
          permite_generico?: boolean | null
        }
        Update: {
          criado_em?: string | null
          id?: number
          nome?: string
          orgao_id?: number | null
          permite_generico?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "cargo_orgao_id_fkey"
            columns: ["orgao_id"]
            isOneToOne: false
            referencedRelation: "orgao"
            referencedColumns: ["id"]
          },
        ]
      }
      comissaomembros: {
        Row: {
          agente_publico_id: number
          cargo: Database["public"]["Enums"]["cargo_comissao"] | null
          comissao_id: number
          id: number
        }
        Insert: {
          agente_publico_id: number
          cargo?: Database["public"]["Enums"]["cargo_comissao"] | null
          comissao_id: number
          id?: number
        }
        Update: {
          agente_publico_id?: number
          cargo?: Database["public"]["Enums"]["cargo_comissao"] | null
          comissao_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissaomembros_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissaomembros_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "comissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes: {
        Row: {
          descricao: string | null
          id: number
          nome: string
          periodo_sessao_id: number
          tipo: string | null
        }
        Insert: {
          descricao?: string | null
          id?: number
          nome: string
          periodo_sessao_id: number
          tipo?: string | null
        }
        Update: {
          descricao?: string | null
          id?: number
          nome?: string
          periodo_sessao_id?: number
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_periodo_sessao_id_fkey"
            columns: ["periodo_sessao_id"]
            isOneToOne: false
            referencedRelation: "periodossessao"
            referencedColumns: ["id"]
          },
        ]
      }
      dadosgeraiscamara: {
        Row: {
          cep: string | null
          cnpj: string | null
          email_oficial: string | null
          endereco_completo: string | null
          horario_funcionamento: string | null
          id: number
          nome_oficial: string | null
          telefone_contato: string | null
        }
        Insert: {
          cep?: string | null
          cnpj?: string | null
          email_oficial?: string | null
          endereco_completo?: string | null
          horario_funcionamento?: string | null
          id?: number
          nome_oficial?: string | null
          telefone_contato?: string | null
        }
        Update: {
          cep?: string | null
          cnpj?: string | null
          email_oficial?: string | null
          endereco_completo?: string | null
          horario_funcionamento?: string | null
          id?: number
          nome_oficial?: string | null
          telefone_contato?: string | null
        }
        Relationships: []
      }
      destinatarios_backup: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string | null
          id: number | null
          nome: string | null
          orgao: string | null
        }
        Insert: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          id?: number | null
          nome?: string | null
          orgao?: string | null
        }
        Update: {
          ativo?: boolean | null
          cargo?: string | null
          created_at?: string | null
          id?: number | null
          nome?: string | null
          orgao?: string | null
        }
        Relationships: []
      }
      destinatarios_deprecated: {
        Row: {
          ativo: boolean | null
          cargo: string
          created_at: string | null
          id: number
          nome: string
          orgao: string
        }
        Insert: {
          ativo?: boolean | null
          cargo: string
          created_at?: string | null
          id?: never
          nome: string
          orgao: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string
          created_at?: string | null
          id?: never
          nome?: string
          orgao?: string
        }
        Relationships: []
      }
      documentoautores: {
        Row: {
          autor_id: number
          autor_type: string
          documento_id: number
          id: number
          papel: Database["public"]["Enums"]["papel_documento_autor"] | null
        }
        Insert: {
          autor_id: number
          autor_type: string
          documento_id: number
          id?: number
          papel?: Database["public"]["Enums"]["papel_documento_autor"] | null
        }
        Update: {
          autor_id?: number
          autor_type?: string
          documento_id?: number
          id?: number
          papel?: Database["public"]["Enums"]["papel_documento_autor"] | null
        }
        Relationships: [
          {
            foreignKeyName: "documentoautores_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          ano: number
          arquivado_por_id: string | null
          arquivo_original_url: string | null
          arquivo_pdf_url: string | null
          criado_por_usuario_id: string
          data_arquivamento: string | null
          data_protocolo: string | null
          id: number
          motivo_arquivamento: string | null
          protocolo_id: number | null
          requer_votacao_secreta: boolean | null
          status: Database["public"]["Enums"]["status_documento"] | null
          tipo_arquivamento:
            | Database["public"]["Enums"]["tipo_arquivamento"]
            | null
          tipo_documento_id: number
        }
        Insert: {
          ano: number
          arquivado_por_id?: string | null
          arquivo_original_url?: string | null
          arquivo_pdf_url?: string | null
          criado_por_usuario_id: string
          data_arquivamento?: string | null
          data_protocolo?: string | null
          id?: number
          motivo_arquivamento?: string | null
          protocolo_id?: number | null
          requer_votacao_secreta?: boolean | null
          status?: Database["public"]["Enums"]["status_documento"] | null
          tipo_arquivamento?:
            | Database["public"]["Enums"]["tipo_arquivamento"]
            | null
          tipo_documento_id: number
        }
        Update: {
          ano?: number
          arquivado_por_id?: string | null
          arquivo_original_url?: string | null
          arquivo_pdf_url?: string | null
          criado_por_usuario_id?: string
          data_arquivamento?: string | null
          data_protocolo?: string | null
          id?: number
          motivo_arquivamento?: string | null
          protocolo_id?: number | null
          requer_votacao_secreta?: boolean | null
          status?: Database["public"]["Enums"]["status_documento"] | null
          tipo_arquivamento?:
            | Database["public"]["Enums"]["tipo_arquivamento"]
            | null
          tipo_documento_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentos_criado_por_usuario_id_fkey"
            columns: ["criado_por_usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_protocolo_id_fkey"
            columns: ["protocolo_id"]
            isOneToOne: false
            referencedRelation: "protocolos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_tipo_documento_id_fkey"
            columns: ["tipo_documento_id"]
            isOneToOne: false
            referencedRelation: "tiposdedocumento"
            referencedColumns: ["id"]
          },
        ]
      }
      documentotags: {
        Row: {
          documento_id: number
          id: number
          tag_id: number
        }
        Insert: {
          documento_id: number
          id?: number
          tag_id: number
        }
        Update: {
          documento_id?: number
          id?: number
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentotags_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentotags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionarios: {
        Row: {
          agente_publico_id: number
          cargo: string | null
          data_admissao: string | null
          data_exoneracao: string | null
          tipo_vinculo:
            | Database["public"]["Enums"]["tipo_vinculo_funcionario"]
            | null
        }
        Insert: {
          agente_publico_id: number
          cargo?: string | null
          data_admissao?: string | null
          data_exoneracao?: string | null
          tipo_vinculo?:
            | Database["public"]["Enums"]["tipo_vinculo_funcionario"]
            | null
        }
        Update: {
          agente_publico_id?: number
          cargo?: string | null
          data_admissao?: string | null
          data_exoneracao?: string | null
          tipo_vinculo?:
            | Database["public"]["Enums"]["tipo_vinculo_funcionario"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionarios_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: true
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacoes: {
        Row: {
          destinatario_texto: string | null
          documento_id: number
          ementa: string | null
          id: number
          justificativa: string | null
          numero_indicacao: number | null
        }
        Insert: {
          destinatario_texto?: string | null
          documento_id: number
          ementa?: string | null
          id?: number
          justificativa?: string | null
          numero_indicacao?: number | null
        }
        Update: {
          destinatario_texto?: string | null
          documento_id?: number
          ementa?: string | null
          id?: number
          justificativa?: string | null
          numero_indicacao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "indicacoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      legislaturas: {
        Row: {
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: number
          numero: number
          numero_vagas_vereadores: number
          slug: string | null
        }
        Insert: {
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: number
          numero: number
          numero_vagas_vereadores: number
          slug?: string | null
        }
        Update: {
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: number
          numero?: number
          numero_vagas_vereadores?: number
          slug?: string | null
        }
        Relationships: []
      }
      legislaturavereadores: {
        Row: {
          agente_publico_id: number
          condicao: Database["public"]["Enums"]["condicao_vereador"] | null
          data_afastamento: string | null
          data_posse: string | null
          id: number
          legislatura_id: number
          partido: string | null
          partido_id: number | null
        }
        Insert: {
          agente_publico_id: number
          condicao?: Database["public"]["Enums"]["condicao_vereador"] | null
          data_afastamento?: string | null
          data_posse?: string | null
          id?: number
          legislatura_id: number
          partido?: string | null
          partido_id?: number | null
        }
        Update: {
          agente_publico_id?: number
          condicao?: Database["public"]["Enums"]["condicao_vereador"] | null
          data_afastamento?: string | null
          data_posse?: string | null
          id?: number
          legislatura_id?: number
          partido?: string | null
          partido_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_legislaturavereadores_partido"
            columns: ["partido_id"]
            isOneToOne: false
            referencedRelation: "partidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legislaturavereadores_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legislaturavereadores_legislatura_id_fkey"
            columns: ["legislatura_id"]
            isOneToOne: false
            referencedRelation: "legislaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      liderancaslegislativas: {
        Row: {
          agente_publico_id: number
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          id: number
          legislatura_id: number
          observacoes: string | null
          tipo: Database["public"]["Enums"]["tipo_lideranca"]
          updated_at: string | null
        }
        Insert: {
          agente_publico_id: number
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: number
          legislatura_id: number
          observacoes?: string | null
          tipo: Database["public"]["Enums"]["tipo_lideranca"]
          updated_at?: string | null
        }
        Update: {
          agente_publico_id?: number
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: number
          legislatura_id?: number
          observacoes?: string | null
          tipo?: Database["public"]["Enums"]["tipo_lideranca"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liderancaslegislativas_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liderancaslegislativas_legislatura_id_fkey"
            columns: ["legislatura_id"]
            isOneToOne: false
            referencedRelation: "legislaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      mesadiretoramembros: {
        Row: {
          agente_publico_id: number
          cargo: Database["public"]["Enums"]["cargo_mesa_diretora"] | null
          id: number
          mesa_diretora_id: number
        }
        Insert: {
          agente_publico_id: number
          cargo?: Database["public"]["Enums"]["cargo_mesa_diretora"] | null
          id?: number
          mesa_diretora_id: number
        }
        Update: {
          agente_publico_id?: number
          cargo?: Database["public"]["Enums"]["cargo_mesa_diretora"] | null
          id?: number
          mesa_diretora_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "mesadiretoramembros_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesadiretoramembros_mesa_diretora_id_fkey"
            columns: ["mesa_diretora_id"]
            isOneToOne: false
            referencedRelation: "mesasdiretoras"
            referencedColumns: ["id"]
          },
        ]
      }
      mesasdiretoras: {
        Row: {
          id: number
          nome: string
          periodo_sessao_id: number
        }
        Insert: {
          id?: number
          nome: string
          periodo_sessao_id: number
        }
        Update: {
          id?: number
          nome?: string
          periodo_sessao_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "mesasdiretoras_periodo_sessao_id_fkey"
            columns: ["periodo_sessao_id"]
            isOneToOne: false
            referencedRelation: "periodossessao"
            referencedColumns: ["id"]
          },
        ]
      }
      mocoes: {
        Row: {
          corpo_texto: string | null
          documento_id: number
          ementa: string | null
          homenageado_texto: string | null
          id: number
          justificativa: string | null
          numero_mocao: number | null
          tipo_mocao: Database["public"]["Enums"]["tipo_mocao"] | null
        }
        Insert: {
          corpo_texto?: string | null
          documento_id: number
          ementa?: string | null
          homenageado_texto?: string | null
          id?: number
          justificativa?: string | null
          numero_mocao?: number | null
          tipo_mocao?: Database["public"]["Enums"]["tipo_mocao"] | null
        }
        Update: {
          corpo_texto?: string | null
          documento_id?: number
          ementa?: string | null
          homenageado_texto?: string | null
          id?: number
          justificativa?: string | null
          numero_mocao?: number | null
          tipo_mocao?: Database["public"]["Enums"]["tipo_mocao"] | null
        }
        Relationships: [
          {
            foreignKeyName: "mocoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      ocupacao_cargo: {
        Row: {
          ativo: boolean | null
          cargo_id: number | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string
          id: number
          pessoa_id: number | null
        }
        Insert: {
          ativo?: boolean | null
          cargo_id?: number | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: number
          pessoa_id?: number | null
        }
        Update: {
          ativo?: boolean | null
          cargo_id?: number | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string
          id?: number
          pessoa_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ocupacao_cargo_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocupacao_cargo_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoa"
            referencedColumns: ["id"]
          },
        ]
      }
      oficios: {
        Row: {
          assunto: string | null
          corpo_texto: string | null
          destinatario_cargo: string | null
          destinatario_nome: string | null
          destinatario_orgao: string | null
          documento_id: number
          fecho_cortesia: string | null
          id: number
          justificativa: string | null
          numero_oficio: number | null
          pronome_tratamento: string | null
          vocativo: string | null
        }
        Insert: {
          assunto?: string | null
          corpo_texto?: string | null
          destinatario_cargo?: string | null
          destinatario_nome?: string | null
          destinatario_orgao?: string | null
          documento_id: number
          fecho_cortesia?: string | null
          id?: number
          justificativa?: string | null
          numero_oficio?: number | null
          pronome_tratamento?: string | null
          vocativo?: string | null
        }
        Update: {
          assunto?: string | null
          corpo_texto?: string | null
          destinatario_cargo?: string | null
          destinatario_nome?: string | null
          destinatario_orgao?: string | null
          documento_id?: number
          fecho_cortesia?: string | null
          id?: number
          justificativa?: string | null
          numero_oficio?: number | null
          pronome_tratamento?: string | null
          vocativo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oficios_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orgao: {
        Row: {
          criado_em: string | null
          endereco_cidade: string | null
          endereco_logradouro: string | null
          endereco_uf: string | null
          id: number
          nome: string
          tipo_orgao: string | null
        }
        Insert: {
          criado_em?: string | null
          endereco_cidade?: string | null
          endereco_logradouro?: string | null
          endereco_uf?: string | null
          id?: number
          nome: string
          tipo_orgao?: string | null
        }
        Update: {
          criado_em?: string | null
          endereco_cidade?: string | null
          endereco_logradouro?: string | null
          endereco_uf?: string | null
          id?: number
          nome?: string
          tipo_orgao?: string | null
        }
        Relationships: []
      }
      pareceres: {
        Row: {
          comissao_id: number | null
          corpo_texto: string | null
          documento_id: number
          id: number
          materia_documento_id: number
          removido_pauta_manualmente: boolean | null
          resultado: string | null
          status: string | null
        }
        Insert: {
          comissao_id?: number | null
          corpo_texto?: string | null
          documento_id: number
          id?: number
          materia_documento_id: number
          removido_pauta_manualmente?: boolean | null
          resultado?: string | null
          status?: string | null
        }
        Update: {
          comissao_id?: number | null
          corpo_texto?: string | null
          documento_id?: number
          id?: number
          materia_documento_id?: number
          removido_pauta_manualmente?: boolean | null
          resultado?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pareceres_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pareceres_materia_documento_id_fkey"
            columns: ["materia_documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      partidos: {
        Row: {
          ativo: boolean | null
          cor_principal: string | null
          criado_em: string | null
          id: number
          logo_url: string | null
          nome_completo: string
          sigla: string
        }
        Insert: {
          ativo?: boolean | null
          cor_principal?: string | null
          criado_em?: string | null
          id?: number
          logo_url?: string | null
          nome_completo: string
          sigla: string
        }
        Update: {
          ativo?: boolean | null
          cor_principal?: string | null
          criado_em?: string | null
          id?: number
          logo_url?: string | null
          nome_completo?: string
          sigla?: string
        }
        Relationships: []
      }
      periodossessao: {
        Row: {
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: number
          legislatura_id: number
          numero: number
        }
        Insert: {
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: number
          legislatura_id: number
          numero: number
        }
        Update: {
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: number
          legislatura_id?: number
          numero?: number
        }
        Relationships: [
          {
            foreignKeyName: "periodossessao_legislatura_id_fkey"
            columns: ["legislatura_id"]
            isOneToOne: false
            referencedRelation: "legislaturas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoa: {
        Row: {
          atualizado_em: string | null
          cpf: string | null
          criado_em: string | null
          email: string | null
          id: number
          nome: string
          telefone: string | null
          tipo_pessoa: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cpf?: string | null
          criado_em?: string | null
          email?: string | null
          id?: number
          nome: string
          telefone?: string | null
          tipo_pessoa?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cpf?: string | null
          criado_em?: string | null
          email?: string | null
          id?: number
          nome?: string
          telefone?: string | null
          tipo_pessoa?: string | null
        }
        Relationships: []
      }
      projetosdedecretolegislativo: {
        Row: {
          corpo_texto: string | null
          documento_id: number
          ementa: string | null
          exercicio_financeiro_contas: number | null
          homenageado_nome: string | null
          id: number
          justificativa: string | null
          numero_decreto: number | null
          tipo_decreto:
            | Database["public"]["Enums"]["tipo_decreto_legislativo"]
            | null
          tipo_honraria: Database["public"]["Enums"]["tipo_honraria"] | null
        }
        Insert: {
          corpo_texto?: string | null
          documento_id: number
          ementa?: string | null
          exercicio_financeiro_contas?: number | null
          homenageado_nome?: string | null
          id?: number
          justificativa?: string | null
          numero_decreto?: number | null
          tipo_decreto?:
            | Database["public"]["Enums"]["tipo_decreto_legislativo"]
            | null
          tipo_honraria?: Database["public"]["Enums"]["tipo_honraria"] | null
        }
        Update: {
          corpo_texto?: string | null
          documento_id?: number
          ementa?: string | null
          exercicio_financeiro_contas?: number | null
          homenageado_nome?: string | null
          id?: number
          justificativa?: string | null
          numero_decreto?: number | null
          tipo_decreto?:
            | Database["public"]["Enums"]["tipo_decreto_legislativo"]
            | null
          tipo_honraria?: Database["public"]["Enums"]["tipo_honraria"] | null
        }
        Relationships: [
          {
            foreignKeyName: "projetosdedecretolegislativo_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetosdeemendaorganica: {
        Row: {
          corpo_texto: string | null
          documento_id: number
          ementa: string | null
          id: number
          justificativa: string | null
          numero_emenda: number | null
        }
        Insert: {
          corpo_texto?: string | null
          documento_id: number
          ementa?: string | null
          id?: number
          justificativa?: string | null
          numero_emenda?: number | null
        }
        Update: {
          corpo_texto?: string | null
          documento_id?: number
          ementa?: string | null
          id?: number
          justificativa?: string | null
          numero_emenda?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projetosdeemendaorganica_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetosdelei: {
        Row: {
          corpo_texto: string | null
          documento_id: number
          ementa: string | null
          id: number
          justificativa: string | null
          numero_lei: number | null
        }
        Insert: {
          corpo_texto?: string | null
          documento_id: number
          ementa?: string | null
          id?: number
          justificativa?: string | null
          numero_lei?: number | null
        }
        Update: {
          corpo_texto?: string | null
          documento_id?: number
          ementa?: string | null
          id?: number
          justificativa?: string | null
          numero_lei?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projetosdelei_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetosderesolucao: {
        Row: {
          corpo_texto: string | null
          documento_id: number
          ementa: string | null
          id: number
          justificativa: string | null
          numero_resolucao: number | null
        }
        Insert: {
          corpo_texto?: string | null
          documento_id: number
          ementa?: string | null
          id?: number
          justificativa?: string | null
          numero_resolucao?: number | null
        }
        Update: {
          corpo_texto?: string | null
          documento_id?: number
          ementa?: string | null
          id?: number
          justificativa?: string | null
          numero_resolucao?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projetosderesolucao_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolos: {
        Row: {
          data_hora: string
          documento_id: number | null
          hash_documento: string
          id: number
          numero: string
          usuario_id: string | null
        }
        Insert: {
          data_hora?: string
          documento_id?: number | null
          hash_documento: string
          id?: never
          numero: string
          usuario_id?: string | null
        }
        Update: {
          data_hora?: string
          documento_id?: number | null
          hash_documento?: string
          id?: never
          numero?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "protocolos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "protocolos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      requerimentos: {
        Row: {
          corpo_texto: string | null
          destinatario_texto: string | null
          documento_id: number
          fecho_cortesia: string | null
          id: number
          justificativa: string | null
          numero_requerimento: number | null
        }
        Insert: {
          corpo_texto?: string | null
          destinatario_texto?: string | null
          documento_id: number
          fecho_cortesia?: string | null
          id?: number
          justificativa?: string | null
          numero_requerimento?: number | null
        }
        Update: {
          corpo_texto?: string | null
          destinatario_texto?: string | null
          documento_id?: number
          fecho_cortesia?: string | null
          id?: number
          justificativa?: string | null
          numero_requerimento?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "requerimentos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      sessaopauta: {
        Row: {
          documento_id: number
          id: number
          ordem: number | null
          sessao_id: number
          status_item: string | null
          tipo_item: string | null
          url_relatorio_votacao: string | null
          votacao_secreta: boolean | null
        }
        Insert: {
          documento_id: number
          id?: number
          ordem?: number | null
          sessao_id: number
          status_item?: string | null
          tipo_item?: string | null
          url_relatorio_votacao?: string | null
          votacao_secreta?: boolean | null
        }
        Update: {
          documento_id?: number
          id?: number
          ordem?: number | null
          sessao_id?: number
          status_item?: string | null
          tipo_item?: string | null
          url_relatorio_votacao?: string | null
          votacao_secreta?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sessaopauta_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessaopauta_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessaopresenca: {
        Row: {
          agente_publico_id: number
          id: number
          justificativa: string | null
          sessao_id: number
          status: Database["public"]["Enums"]["status_presenca"] | null
        }
        Insert: {
          agente_publico_id: number
          id?: number
          justificativa?: string | null
          sessao_id: number
          status?: Database["public"]["Enums"]["status_presenca"] | null
        }
        Update: {
          agente_publico_id?: number
          id?: number
          justificativa?: string | null
          sessao_id?: number
          status?: Database["public"]["Enums"]["status_presenca"] | null
        }
        Relationships: [
          {
            foreignKeyName: "sessaopresenca_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessaopresenca_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessaovotacao_resultado: {
        Row: {
          abstencoes: number | null
          ausentes: number | null
          created_at: string | null
          documento_id: number | null
          id: number
          item_pauta_id: number | null
          observacoes: string | null
          resultado: string | null
          sessao_id: number | null
          total_votantes: number
          votacao_secreta: boolean
          voto_minerva_usado: boolean | null
          votos_nao: number | null
          votos_sim: number | null
        }
        Insert: {
          abstencoes?: number | null
          ausentes?: number | null
          created_at?: string | null
          documento_id?: number | null
          id?: number
          item_pauta_id?: number | null
          observacoes?: string | null
          resultado?: string | null
          sessao_id?: number | null
          total_votantes?: number
          votacao_secreta?: boolean
          voto_minerva_usado?: boolean | null
          votos_nao?: number | null
          votos_sim?: number | null
        }
        Update: {
          abstencoes?: number | null
          ausentes?: number | null
          created_at?: string | null
          documento_id?: number | null
          id?: number
          item_pauta_id?: number | null
          observacoes?: string | null
          resultado?: string | null
          sessao_id?: number | null
          total_votantes?: number
          votacao_secreta?: boolean
          voto_minerva_usado?: boolean | null
          votos_nao?: number | null
          votos_sim?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessaovotacao_resultado_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessaovotacao_resultado_item_pauta_id_fkey"
            columns: ["item_pauta_id"]
            isOneToOne: false
            referencedRelation: "sessaopauta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessaovotacao_resultado_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessaovotos: {
        Row: {
          agente_publico_id: number
          documento_id: number
          id: number
          sessao_id: number
          voto: Database["public"]["Enums"]["voto_vereador"] | null
        }
        Insert: {
          agente_publico_id: number
          documento_id: number
          id?: number
          sessao_id: number
          voto?: Database["public"]["Enums"]["voto_vereador"] | null
        }
        Update: {
          agente_publico_id?: number
          documento_id?: number
          id?: number
          sessao_id?: number
          voto?: Database["public"]["Enums"]["voto_vereador"] | null
        }
        Relationships: [
          {
            foreignKeyName: "sessaovotos_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessaovotos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessaovotos_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes: {
        Row: {
          ata_texto: string | null
          data_abertura: string | null
          data_fechamento: string | null
          data_original: string | null
          data_publicacao_pauta: string | null
          hora_agendada: string | null
          id: number
          local: string | null
          motivo: string | null
          numero: number | null
          observacoes: string | null
          pauta_pdf_url: string | null
          pauta_publicada: boolean | null
          pauta_texto: string | null
          periodo_sessao_id: number
          status: Database["public"]["Enums"]["status_sessao"] | null
          tipo_sessao: Database["public"]["Enums"]["tipo_sessao"] | null
        }
        Insert: {
          ata_texto?: string | null
          data_abertura?: string | null
          data_fechamento?: string | null
          data_original?: string | null
          data_publicacao_pauta?: string | null
          hora_agendada?: string | null
          id?: number
          local?: string | null
          motivo?: string | null
          numero?: number | null
          observacoes?: string | null
          pauta_pdf_url?: string | null
          pauta_publicada?: boolean | null
          pauta_texto?: string | null
          periodo_sessao_id: number
          status?: Database["public"]["Enums"]["status_sessao"] | null
          tipo_sessao?: Database["public"]["Enums"]["tipo_sessao"] | null
        }
        Update: {
          ata_texto?: string | null
          data_abertura?: string | null
          data_fechamento?: string | null
          data_original?: string | null
          data_publicacao_pauta?: string | null
          hora_agendada?: string | null
          id?: number
          local?: string | null
          motivo?: string | null
          numero?: number | null
          observacoes?: string | null
          pauta_pdf_url?: string | null
          pauta_publicada?: boolean | null
          pauta_texto?: string | null
          periodo_sessao_id?: number
          status?: Database["public"]["Enums"]["status_sessao"] | null
          tipo_sessao?: Database["public"]["Enums"]["tipo_sessao"] | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_periodo_sessao_id_fkey"
            columns: ["periodo_sessao_id"]
            isOneToOne: false
            referencedRelation: "periodossessao"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: number
          nome: string
        }
        Insert: {
          id?: number
          nome: string
        }
        Update: {
          id?: number
          nome?: string
        }
        Relationships: []
      }
      tiposdedocumento: {
        Row: {
          descricao: string | null
          exige_leitura: boolean | null
          exige_parecer: boolean | null
          id: number
          is_materia: boolean | null
          nome: string
          votacao_turnos: number | null
        }
        Insert: {
          descricao?: string | null
          exige_leitura?: boolean | null
          exige_parecer?: boolean | null
          id?: number
          is_materia?: boolean | null
          nome: string
          votacao_turnos?: number | null
        }
        Update: {
          descricao?: string | null
          exige_leitura?: boolean | null
          exige_parecer?: boolean | null
          id?: number
          is_materia?: boolean | null
          nome?: string
          votacao_turnos?: number | null
        }
        Relationships: []
      }
      tramitacoes: {
        Row: {
          data_hora: string | null
          descricao: string | null
          documento_id: number
          id: number
          responsavel_id: number | null
          responsavel_type: string | null
          status: Database["public"]["Enums"]["status_tramitacao"] | null
          usuario_id: string
        }
        Insert: {
          data_hora?: string | null
          descricao?: string | null
          documento_id: number
          id?: number
          responsavel_id?: number | null
          responsavel_type?: string | null
          status?: Database["public"]["Enums"]["status_tramitacao"] | null
          usuario_id: string
        }
        Update: {
          data_hora?: string | null
          descricao?: string | null
          documento_id?: number
          id?: number
          responsavel_id?: number | null
          responsavel_type?: string | null
          status?: Database["public"]["Enums"]["status_tramitacao"] | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tramitacoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tramitacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          agente_publico_id: number
          email: string
          id: string
          permissao: Database["public"]["Enums"]["permissao_usuario"] | null
        }
        Insert: {
          agente_publico_id: number
          email: string
          id: string
          permissao?: Database["public"]["Enums"]["permissao_usuario"] | null
        }
        Update: {
          agente_publico_id?: number
          email?: string
          id?: string
          permissao?: Database["public"]["Enums"]["permissao_usuario"] | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: true
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
        ]
      }
      vereadores: {
        Row: {
          agente_publico_id: number
          areas_atuacao: string[] | null
          biografia_completa: string | null
          email_gabinete: string | null
          facebook: string | null
          formacao_academica: string | null
          instagram: string | null
          nome_parlamentar: string | null
          perfil: string | null
          profissao_anterior: string | null
          site_pessoal: string | null
          telefone_gabinete: string | null
          twitter: string | null
        }
        Insert: {
          agente_publico_id: number
          areas_atuacao?: string[] | null
          biografia_completa?: string | null
          email_gabinete?: string | null
          facebook?: string | null
          formacao_academica?: string | null
          instagram?: string | null
          nome_parlamentar?: string | null
          perfil?: string | null
          profissao_anterior?: string | null
          site_pessoal?: string | null
          telefone_gabinete?: string | null
          twitter?: string | null
        }
        Update: {
          agente_publico_id?: number
          areas_atuacao?: string[] | null
          biografia_completa?: string | null
          email_gabinete?: string | null
          facebook?: string | null
          formacao_academica?: string | null
          instagram?: string | null
          nome_parlamentar?: string | null
          perfil?: string | null
          profissao_anterior?: string | null
          site_pessoal?: string | null
          telefone_gabinete?: string | null
          twitter?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vereadores_agente_publico_id_fkey"
            columns: ["agente_publico_id"]
            isOneToOne: true
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      destinatarios: {
        Row: {
          ativo: boolean | null
          cargo: string | null
          created_at: string | null
          id: number | null
          nome: string | null
          orgao: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      aprovar_e_numerar_materia: {
        Args: { p_documento_id: number; p_usuario_aprovador_id: string }
        Returns: Json
      }
      create_legislatura_with_periods:
        | {
            Args: {
              p_data_fim: string
              p_data_inicio: string
              p_descricao: string
              p_numero: number
              p_numero_vagas_vereadores: number
            }
            Returns: number
          }
        | {
            Args: {
              p_data_fim: string
              p_data_inicio: string
              p_descricao: string
              p_numero: number
              p_numero_vagas_vereadores: number
              p_slug: string
            }
            Returns: number
          }
      criar_rascunho_documento: {
        Args: {
          p_ano: number
          p_autor_id: number
          p_autor_type: string
          p_destinatario_cargo?: string
          p_destinatario_nome?: string
          p_destinatario_orgao?: string
          p_texto_resumo: string
          p_tipo_documento_id: number
          p_usuario_id: string
        }
        Returns: Json
      }
      get_agentes_publicos_com_status: {
        Args: never
        Returns: {
          cargo: string
          cpf: string
          data_admissao: string
          data_exoneracao: string
          foto_url: string
          id: number
          nome_completo: string
          nome_parlamentar: string
          perfil: string
          status_usuario: string
          tipo: Database["public"]["Enums"]["tipo_agente_publico"]
          tipo_vinculo: Database["public"]["Enums"]["tipo_vinculo_funcionario"]
        }[]
      }
      get_my_agente_publico_id: { Args: never; Returns: number }
      get_my_permission: { Args: never; Returns: string }
      is_staff: { Args: never; Returns: boolean }
      protocolar_documento: {
        Args: { p_documento_id: number; p_usuario_id: string }
        Returns: Json
      }
      protocolar_materia: {
        Args: {
          p_ano: number
          p_arquivo_url?: string
          p_autor_id: number
          p_autor_type: string
          p_data_protocolo: string
          p_destinatario_cargo?: string
          p_destinatario_nome?: string
          p_destinatario_orgao?: string
          p_observacao_tramitacao?: string
          p_texto_resumo: string
          p_tipo_documento_id: number
          p_usuario_id: string
        }
        Returns: Json
      }
      upsert_agente_publico: {
        Args: {
          p_cargo?: string
          p_cpf: string
          p_data_admissao?: string
          p_data_exoneracao?: string
          p_foto_url: string
          p_id: number
          p_nome_completo: string
          p_nome_parlamentar?: string
          p_perfil?: string
          p_tipo: Database["public"]["Enums"]["tipo_agente_publico"]
          p_tipo_vinculo?: Database["public"]["Enums"]["tipo_vinculo_funcionario"]
        }
        Returns: number
      }
    }
    Enums: {
      cargo_comissao: "Presidente" | "Membro" | "Relator"
      cargo_mesa_diretora:
        | "Presidente"
        | "Vice-Presidente"
        | "1º Secretário"
        | "2º Secretário"
        | "1º Tesoureiro"
        | "2º Tesoureiro"
      condicao_vereador: "Titular" | "Suplente"
      papel_documento_autor:
        | "Autor Principal"
        | "Subscritor"
        | "Relator"
        | "Autor"
      permissao_usuario:
        | "Admin"
        | "Assessoria"
        | "Secretaria"
        | "Vereador"
        | "Inativo"
      status_documento:
        | "Rascunho"
        | "Protocolado"
        | "Tramitando"
        | "Arquivado"
        | "Emitido"
        | "Lido"
        | "Em Tramitação"
        | "Aprovado"
        | "Rejeitado"
        | "Publicado"
        | "Retirado"
        | "Prejudicado"
        | "Devolvido"
      status_presenca: "Presente" | "Ausente" | "Ausente com Justificativa"
      status_sessao:
        | "Agendada"
        | "Em Andamento"
        | "Realizada"
        | "Não Realizada"
        | "Adiada"
        | "Suspensa"
      status_tramitacao:
        | "Protocolado"
        | "Enviado para Comissão"
        | "Aguardando Deliberação"
        | "Aprovado em 1ª Votação"
        | "Reprovado em 1ª Votação"
        | "Em Interstício"
        | "Aprovado em 2ª Votação"
        | "Reprovado em 2ª Votação"
        | "Aprovado em Votação Única"
        | "Reprovado em Votação Única"
        | "Enviado para Sanção"
        | "Sancionado"
        | "Promulgado"
        | "Arquivado"
        | "Em Tramitação"
        | "Lido em Plenário"
        | "Parecer Emitido"
      tipo_agente_publico: "Vereador" | "Funcionario"
      tipo_arquivamento:
        | "retirada_autor"
        | "retirada_lider_governo"
        | "prejudicado"
        | "devolvido"
        | "rejeitado"
        | "fim_legislatura"
      tipo_autor_externo:
        | "Executivo Municipal"
        | "Entidade"
        | "Cidadão"
        | "Outros Órgãos"
      tipo_decreto_legislativo: "Honraria" | "Julgamento de Contas"
      tipo_honraria: "Título de Cidadania" | "Medalha" | "Comenda"
      tipo_lideranca: "governo" | "oposicao"
      tipo_mocao:
        | "Aplausos"
        | "Solidariedade"
        | "Pesar"
        | "Protesto"
        | "Repúdio"
      tipo_sessao: "Ordinária" | "Extraordinária" | "Solene"
      tipo_vinculo_funcionario: "Efetivo" | "Comissionado" | "Terceirizado"
      voto_vereador: "Sim" | "Não" | "Abstenção" | "Ausente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      cargo_comissao: ["Presidente", "Membro", "Relator"],
      cargo_mesa_diretora: [
        "Presidente",
        "Vice-Presidente",
        "1º Secretário",
        "2º Secretário",
        "1º Tesoureiro",
        "2º Tesoureiro",
      ],
      condicao_vereador: ["Titular", "Suplente"],
      papel_documento_autor: [
        "Autor Principal",
        "Subscritor",
        "Relator",
        "Autor",
      ],
      permissao_usuario: [
        "Admin",
        "Assessoria",
        "Secretaria",
        "Vereador",
        "Inativo",
      ],
      status_documento: [
        "Rascunho",
        "Protocolado",
        "Tramitando",
        "Arquivado",
        "Emitido",
        "Lido",
        "Em Tramitação",
        "Aprovado",
        "Rejeitado",
        "Publicado",
        "Retirado",
        "Prejudicado",
        "Devolvido",
      ],
      status_presenca: ["Presente", "Ausente", "Ausente com Justificativa"],
      status_sessao: [
        "Agendada",
        "Em Andamento",
        "Realizada",
        "Não Realizada",
        "Adiada",
        "Suspensa",
      ],
      status_tramitacao: [
        "Protocolado",
        "Enviado para Comissão",
        "Aguardando Deliberação",
        "Aprovado em 1ª Votação",
        "Reprovado em 1ª Votação",
        "Em Interstício",
        "Aprovado em 2ª Votação",
        "Reprovado em 2ª Votação",
        "Aprovado em Votação Única",
        "Reprovado em Votação Única",
        "Enviado para Sanção",
        "Sancionado",
        "Promulgado",
        "Arquivado",
        "Em Tramitação",
        "Lido em Plenário",
        "Parecer Emitido",
      ],
      tipo_agente_publico: ["Vereador", "Funcionario"],
      tipo_arquivamento: [
        "retirada_autor",
        "retirada_lider_governo",
        "prejudicado",
        "devolvido",
        "rejeitado",
        "fim_legislatura",
      ],
      tipo_autor_externo: [
        "Executivo Municipal",
        "Entidade",
        "Cidadão",
        "Outros Órgãos",
      ],
      tipo_decreto_legislativo: ["Honraria", "Julgamento de Contas"],
      tipo_honraria: ["Título de Cidadania", "Medalha", "Comenda"],
      tipo_lideranca: ["governo", "oposicao"],
      tipo_mocao: ["Aplausos", "Solidariedade", "Pesar", "Protesto", "Repúdio"],
      tipo_sessao: ["Ordinária", "Extraordinária", "Solene"],
      tipo_vinculo_funcionario: ["Efetivo", "Comissionado", "Terceirizado"],
      voto_vereador: ["Sim", "Não", "Abstenção", "Ausente"],
    },
  },
} as const
