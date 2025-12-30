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
            isOneToOne: false
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
          data: string
          descricao: string
          id: number
          status: string | null
          tipo: string
          usuario: string | null
        }
        Insert: {
          data: string
          descricao: string
          id?: number
          status?: string | null
          tipo: string
          usuario?: string | null
        }
        Update: {
          data?: string
          descricao?: string
          id?: number
          status?: string | null
          tipo?: string
          usuario?: string | null
        }
        Relationships: []
      }
      autoresexternos: {
        Row: {
          cpf_cnpj: string | null
          email: string | null
          id: number
          nome: string
          telefone: string | null
          tipo: Database["public"]["Enums"]["tipo_autor_externo"]
        }
        Insert: {
          cpf_cnpj?: string | null
          email?: string | null
          id?: number
          nome: string
          telefone?: string | null
          tipo: Database["public"]["Enums"]["tipo_autor_externo"]
        }
        Update: {
          cpf_cnpj?: string | null
          email?: string | null
          id?: number
          nome?: string
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_autor_externo"]
        }
        Relationships: []
      }
      comissaomembros: {
        Row: {
          comissao_id: number
          data_fim: string | null
          data_inicio: string | null
          id: number
          papel: Database["public"]["Enums"]["papel_comissao"]
          vereador_id: number
        }
        Insert: {
          comissao_id: number
          data_fim?: string | null
          data_inicio?: string | null
          id?: number
          papel: Database["public"]["Enums"]["papel_comissao"]
          vereador_id: number
        }
        Update: {
          comissao_id?: number
          data_fim?: string | null
          data_inicio?: string | null
          id?: number
          papel?: Database["public"]["Enums"]["papel_comissao"]
          vereador_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_vereadores_comissao_id_fkey"
            columns: ["comissao_id"]
            isOneToOne: false
            referencedRelation: "comissoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comissoes_vereadores_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["agente_publico_id"]
          },
        ]
      }
      comissoes: {
        Row: {
          descricao: string | null
          id: number
          nome: string
          sigla: string
          tipo: string
        }
        Insert: {
          descricao?: string | null
          id?: number
          nome: string
          sigla: string
          tipo?: string
        }
        Update: {
          descricao?: string | null
          id?: number
          nome?: string
          sigla?: string
          tipo?: string
        }
        Relationships: []
      }
      dadosgeraiscamara: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string
          cnpj: string
          email: string | null
          estado: string
          horario_funcionamento: string | null
          id: number
          logradouro: string
          nome: string
          telefone: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade: string
          cnpj: string
          email?: string | null
          estado: string
          horario_funcionamento?: string | null
          id?: number
          logradouro: string
          nome: string
          telefone?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string
          cnpj?: string
          email?: string | null
          estado?: string
          horario_funcionamento?: string | null
          id?: number
          logradouro?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
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
          }
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
          }
        ]
      }
      destinatarios: {
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
          autor_externo_id: number | null
          autor_id: number | null
          documento_id: number
          id: number
          papel: Database["public"]["Enums"]["papel_autor"]
          tipo_autor: string | null
        }
        Insert: {
          autor_externo_id?: number | null
          autor_id?: number | null
          documento_id: number
          id?: number
          papel: Database["public"]["Enums"]["papel_autor"]
          tipo_autor?: string | null
        }
        Update: {
          autor_externo_id?: number | null
          autor_id?: number | null
          documento_id?: number
          id?: number
          papel?: Database["public"]["Enums"]["papel_autor"]
          tipo_autor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documentoautores_autor_externo_id_fkey"
            columns: ["autor_externo_id"]
            isOneToOne: false
            referencedRelation: "autoresexternos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentoautores_autor_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
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
          arquivo_url: string | null
          autor_original_id: number | null
          created_at: string
          data_protocolo: string
          ementa: string
          id: number
          numero: number | null
          status: Database["public"]["Enums"]["status_documento"]
          texto_completo: string | null
          tipo_autor: string | null
          tipo_id: number
        }
        Insert: {
          ano: number
          arquivo_url?: string | null
          autor_original_id?: number | null
          created_at?: string
          data_protocolo?: string
          ementa: string
          id?: number
          numero?: number | null
          status?: Database["public"]["Enums"]["status_documento"]
          texto_completo?: string | null
          tipo_autor?: string | null
          tipo_id: number
        }
        Update: {
          ano?: number
          arquivo_url?: string | null
          autor_original_id?: number | null
          created_at?: string
          data_protocolo?: string
          ementa?: string
          id?: number
          numero?: number | null
          status?: Database["public"]["Enums"]["status_documento"]
          texto_completo?: string | null
          tipo_autor?: string | null
          tipo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "documentos_autor_original_fkey"
            columns: ["autor_original_id"]
            isOneToOne: false
            referencedRelation: "agentespublicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_tipo_fkey"
            columns: ["tipo_id"]
            isOneToOne: false
            referencedRelation: "tiposdedocumento"
            referencedColumns: ["id"]
          },
        ]
      }
      indicacoes: {
        Row: {
          destinatario_id: number | null
          destinatario_texto: string | null
          documento_id: number
          id: number
        }
        Insert: {
          destinatario_id?: number | null
          destinatario_texto?: string | null
          documento_id: number
          id?: number
        }
        Update: {
          destinatario_id?: number | null
          destinatario_texto?: string | null
          documento_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "indicacoes_destinatario_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "autoresexternos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "indicacoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: true
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
          ativo: boolean | null
          data_fim: string | null
          data_inicio: string
          id: number
          legislatura_id: number
          vereador_id: number
        }
        Insert: {
          ativo?: boolean | null
          data_fim?: string | null
          data_inicio: string
          id?: number
          legislatura_id: number
          vereador_id: number
        }
        Update: {
          ativo?: boolean | null
          data_fim?: string | null
          data_inicio?: string
          id?: number
          legislatura_id?: number
          vereador_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "legislaturavereadores_legislatura_id_fkey"
            columns: ["legislatura_id"]
            isOneToOne: false
            referencedRelation: "legislaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legislaturavereadores_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["agente_publico_id"]
          },
        ]
      }
      liderancaslegislativas: {
        Row: {
          data_fim: string | null
          data_inicio: string
          id: number
          legislatura_id: number
          observacao: string | null
          partido: Database["public"]["Enums"]["partido_politico"]
          tipo: Database["public"]["Enums"]["tipo_lideranca"]
          vereador_id: number
        }
        Insert: {
          data_fim?: string | null
          data_inicio: string
          id?: number
          legislatura_id: number
          observacao?: string | null
          partido: Database["public"]["Enums"]["partido_politico"]
          tipo: Database["public"]["Enums"]["tipo_lideranca"]
          vereador_id: number
        }
        Update: {
          data_fim?: string | null
          data_inicio?: string
          id?: number
          legislatura_id?: number
          observacao?: string | null
          partido?: Database["public"]["Enums"]["partido_politico"]
          tipo?: Database["public"]["Enums"]["tipo_lideranca"]
          vereador_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "liderancaslegislativas_legislatura_id_fkey"
            columns: ["legislatura_id"]
            isOneToOne: false
            referencedRelation: "legislaturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liderancaslegislativas_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["agente_publico_id"]
          },
        ]
      }
      logs_execucao_minutas: {
        Row: {
          create_at: string | null
          documento_id: number | null
          erro_stack: string | null
          id: number
          input_contexto: string | null
          input_tipo: string | null
          modelo: string | null
          output_gerado: string | null
          sucesso: boolean | null
          tempo_execucao_ms: number | null
        }
        Insert: {
          create_at?: string | null
          documento_id?: number | null
          erro_stack?: string | null
          id?: number
          input_contexto?: string | null
          input_tipo?: string | null
          modelo?: string | null
          output_gerado?: string | null
          sucesso?: boolean | null
          tempo_execucao_ms?: number | null
        }
        Update: {
          create_at?: string | null
          documento_id?: number | null
          erro_stack?: string | null
          id?: number
          input_contexto?: string | null
          input_tipo?: string | null
          modelo?: string | null
          output_gerado?: string | null
          sucesso?: boolean | null
          tempo_execucao_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_execucao_minutas_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      mesasdiretoras: {
        Row: {
          cargo: Database["public"]["Enums"]["cargo_mesa"]
          id: number
          periodo_sessao_id: number
          vereador_id: number
        }
        Insert: {
          cargo: Database["public"]["Enums"]["cargo_mesa"]
          id?: number
          periodo_sessao_id: number
          vereador_id: number
        }
        Update: {
          cargo?: Database["public"]["Enums"]["cargo_mesa"]
          id?: number
          periodo_sessao_id?: number
          vereador_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "mesasdiretoras_periodo_sessao_id_fkey"
            columns: ["periodo_sessao_id"]
            isOneToOne: false
            referencedRelation: "periodossessao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mesasdiretoras_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["agente_publico_id"]
          },
        ]
      }
      mocoes: {
        Row: {
          documento_id: number
          homenageado_texto: string | null
          id: number
          tipo_mocao: Database["public"]["Enums"]["tipo_mocao"]
        }
        Insert: {
          documento_id: number
          homenageado_texto?: string | null
          id?: number
          tipo_mocao: Database["public"]["Enums"]["tipo_mocao"]
        }
        Update: {
          documento_id?: number
          homenageado_texto?: string | null
          id?: number
          tipo_mocao?: Database["public"]["Enums"]["tipo_mocao"]
        }
        Relationships: [
          {
            foreignKeyName: "mocoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: true
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      pareceres: {
        Row: {
          comissao_id: number | null
          conclusao: string | null
          data_parecer: string
          documento_id: number
          id: number
          relator_id: number | null
          status: Database["public"]["Enums"]["status_parecer"]
          texto: string | null
          tipo_parecer: string
          voto_relator: string | null
        }
        Insert: {
          comissao_id?: number | null
          conclusao?: string | null
          data_parecer?: string
          documento_id: number
          id?: number
          relator_id?: number | null
          status?: Database["public"]["Enums"]["status_parecer"]
          texto?: string | null
          tipo_parecer: string
          voto_relator?: string | null
        }
        Update: {
          comissao_id?: number | null
          conclusao?: string | null
          data_parecer?: string
          documento_id?: number
          id?: number
          relator_id?: number | null
          status?: Database["public"]["Enums"]["status_parecer"]
          texto?: string | null
          tipo_parecer?: string
          voto_relator?: string | null
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
            foreignKeyName: "pareceres_relator_id_fkey"
            columns: ["relator_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["agente_publico_id"]
          },
        ]
      }
      pauta_sessoes: {
        Row: {
          documento_id: number
          id: number
          ordem_apresentacao: number
          removido_pauta: boolean | null
          sessao_id: number
          status_leitura: string | null
        }
        Insert: {
          documento_id: number
          id?: number
          ordem_apresentacao: number
          removido_pauta?: boolean | null
          sessao_id: number
          status_leitura?: string | null
        }
        Update: {
          documento_id?: number
          id?: number
          ordem_apresentacao?: number
          removido_pauta?: boolean | null
          sessao_id?: number
          status_leitura?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pauta_sessoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pauta_sessoes_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
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
      projetosdedecretolegislativo: {
        Row: {
          documento_id: number
          ementa: string
          id: number
          justificativa: string
          tipo_decreto: Database["public"]["Enums"]["tipo_decreto_legislativo"]
          tipo_honraria: Database["public"]["Enums"]["tipo_honraria"] | null
        }
        Insert: {
          documento_id: number
          ementa: string
          id?: number
          justificativa: string
          tipo_decreto: Database["public"]["Enums"]["tipo_decreto_legislativo"]
          tipo_honraria?: Database["public"]["Enums"]["tipo_honraria"] | null
        }
        Update: {
          documento_id?: number
          ementa?: string
          id?: number
          justificativa?: string
          tipo_decreto?: Database["public"]["Enums"]["tipo_decreto_legislativo"]
          tipo_honraria?: Database["public"]["Enums"]["tipo_honraria"] | null
        }
        Relationships: [
          {
            foreignKeyName: "projetosdedecretolegislativo_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: true
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      projetosdelei: {
        Row: {
          data_apresentacao: string | null
          documento_id: number
          id: number
          regime_tramitacao: string | null
        }
        Insert: {
          data_apresentacao?: string | null
          documento_id: number
          id?: number
          regime_tramitacao?: string | null
        }
        Update: {
          data_apresentacao?: string | null
          documento_id?: number
          id?: number
          regime_tramitacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projetosdelei_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: true
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      protocolos: {
        Row: {
          ano: number
          data_hora: string
          documento_id: number
          id: number
          numero: number
        }
        Insert: {
          ano: number
          data_hora?: string
          documento_id: number
          id?: number
          numero: number
        }
        Update: {
          ano?: number
          data_hora?: string
          documento_id?: number
          id?: number
          numero?: number
        }
        Relationships: [
          {
            foreignKeyName: "protocolos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      requerimentos: {
        Row: {
          data_apresentacao: string | null
          destinatario_id: number | null
          destinatario_texto: string | null
          documento_id: number
          id: number
          justificativa: string | null
        }
        Insert: {
          data_apresentacao?: string | null
          destinatario_id?: number | null
          destinatario_texto?: string | null
          documento_id: number
          id?: number
          justificativa?: string | null
        }
        Update: {
          data_apresentacao?: string | null
          destinatario_id?: number | null
          destinatario_texto?: string | null
          documento_id?: number
          id?: number
          justificativa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requerimentos_destinatario_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "autoresexternos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requerimentos_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: true
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
        ]
      }
      sessao_conduzir: {
        Row: {
          iniciada_em: string | null
          sessao_id: number
          status: string | null
          votacao_atual_id: number | null
        }
        Insert: {
          iniciada_em?: string | null
          sessao_id: number
          status?: string | null
          votacao_atual_id?: number | null
        }
        Update: {
          iniciada_em?: string | null
          sessao_id?: number
          status?: string | null
          votacao_atual_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessao_conduzir_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: true
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessao_conduzir_votacao_atual_id_fkey"
            columns: ["votacao_atual_id"]
            isOneToOne: false
            referencedRelation: "votacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessao_presenca: {
        Row: {
          data_hora: string | null
          id: number
          sessao_id: number
          status: Database["public"]["Enums"]["status_presenca"]
          vereador_id: number
        }
        Insert: {
          data_hora?: string | null
          id?: number
          sessao_id: number
          status: Database["public"]["Enums"]["status_presenca"]
          vereador_id: number
        }
        Update: {
          data_hora?: string | null
          id?: number
          sessao_id?: number
          status?: Database["public"]["Enums"]["status_presenca"]
          vereador_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessao_presenca_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessao_presenca_vereador_id_fkey"
            columns: ["vereador_id"]
            isOneToOne: false
            referencedRelation: "vereadores"
            referencedColumns: ["agente_publico_id"]
          },
        ]
      }
      sessoes: {
        Row: {
          abertura: string | null
          data_hora: string
          data_minima_pauta: string | null
          data_publicacao_pauta: string | null
          encaminhamentos: string | null
          encalhento: string | null
          id: number
          numero_sessao: number
          pauta_id: number | null
          periodo_sessao_id: number
          status: Database["public"]["Enums"]["status_sessao"]
          tipo: Database["public"]["Enums"]["tipo_sessao"]
        }
        Insert: {
          abertura?: string | null
          data_hora: string
          data_minima_pauta?: string | null
          data_publicacao_pauta?: string | null
          encaminhamentos?: string | null
          encalhento?: string | null
          id?: number
          numero_sessao: number
          pauta_id?: number | null
          periodo_sessao_id: number
          status?: Database["public"]["Enums"]["status_sessao"]
          tipo: Database["public"]["Enums"]["tipo_sessao"]
        }
        Update: {
          abertura?: string | null
          data_hora?: string
          data_minima_pauta?: string | null
          data_publicacao_pauta?: string | null
          encaminhamentos?: string | null
          encalhento?: string | null
          id?: number
          numero_sessao?: number
          pauta_id?: number | null
          periodo_sessao_id?: number
          status?: Database["public"]["Enums"]["status_sessao"]
          tipo?: Database["public"]["Enums"]["tipo_sessao"]
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
      tiposdedocumento: {
        Row: {
          ativo: boolean | null
          fluxo_aprovacao: Json | null
          id: number
          nome: string
          padrao_numeracao: string | null
          prefixo: string | null
          requer_aprovacao: boolean | null
          requer_votacao: boolean | null
          tem_tramitacao: boolean | null
        }
        Insert: {
          ativo?: boolean | null
          fluxo_aprovacao?: Json | null
          id?: number
          nome: string
          padrao_numeracao?: string | null
          prefixo?: string | null
          requer_aprovacao?: boolean | null
          requer_votacao?: boolean | null
          tem_tramitacao?: boolean | null
        }
        Update: {
          ativo?: boolean | null
          fluxo_aprovacao?: Json | null
          id?: number
          nome?: string
          padrao_numeracao?: string | null
          prefixo?: string | null
          requer_aprovacao?: boolean | null
          requer_votacao?: boolean | null
          tem_tramitacao?: boolean | null
        }
        Relationships: []
      }
      vereadores: {
        Row: {
          agente_publico_id: number
          ativo: boolean | null
          data_nascimento: string | null
          email_oficial: string | null
          nome_parlamentar: string
          partido: Database["public"]["Enums"]["partido_politico"]
        }
        Insert: {
          agente_publico_id: number
          ativo?: boolean | null
          data_nascimento?: string | null
          email_oficial?: string | null
          nome_parlamentar: string
          partido: Database["public"]["Enums"]["partido_politico"]
        }
        Update: {
          agente_publico_id?: number
          ativo?: boolean | null
          data_nascimento?: string | null
          email_oficial?: string | null
          nome_parlamentar?: string
          partido?: Database["public"]["Enums"]["partido_politico"]
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
      votacoes: {
        Row: {
          data_hora: string
          documento_id: number
          id: number
          resultado: string
          sessao_id: number
          tipo_votacao: string
        }
        Insert: {
          data_hora?: string
          documento_id: number
          id?: number
          resultado: string
          sessao_id: number
          tipo_votacao: string
        }
        Update: {
          data_hora?: string
          documento_id?: number
          id?: number
          resultado?: string
          sessao_id?: number
          tipo_votacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "votacoes_documento_id_fkey"
            columns: ["documento_id"]
            isOneToOne: false
            referencedRelation: "documentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votacoes_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_rascunho_documento: {
        Args: {
          p_tipo_documento_id: number
          p_ano: number
          p_autor_id: number
          p_autor_type: string
          p_texto_resumo: string
          p_usuario_id: string
          p_destinatario_nome?: string
          p_destinatario_cargo?: string
          p_destinatario_orgao?: string
        }
        Returns: Json
      }
      executar_tramitacao_automatica: {
        Args: {
          p_documento_id: number
          p_status_atual: string
          p_novo_status: string
        }
        Returns: undefined
      }
      protocolar_documento: {
        Args: {
          p_documento_id: number
          p_agente_id?: number
        }
        Returns: {
          protocolo_id: number
          numero_protocolo: number
          ano: number
          data_hora: string
        }[]
      }
    }
    Enums: {
      cargo_mesa:
      | "Presidente"
      | "Vice-Presidente"
      | "1º Secretário"
      | "2º Secretário"
      | "3º Secretário"
      papel_autor: "Autor" | "Relator" | "Subscritor"
      papel_comissao: "Presidente" | "Relator" | "Membro" | "Suplente"
      partido_politico:
      | "MDB"
      | "PT"
      | "PSDB"
      | "PP"
      | "PDT"
      | "PL"
      | "PSB"
      | "PSD"
      | "REPUBLICANOS"
      | "UNIÃO"
      | "CIDADANIA"
      | "PODEMOS"
      | "AVANTE"
      | "PATRIOTA"
      | "SOLIDARIEDADE"
      | "PSOL"
      | "REDE"
      | "PCdoB"
      | "PV"
      | "NOVO"
      status_documento:
      | "Rascunho"
      | "Protocolado"
      | "Em Tramitação"
      | "Lido no Expediente"
      | "Aprovado em 1ª Votação"
      | "Reprovado em 1ª Votação"
      | "Aprovado"
      | "Rejeitado"
      | "Publicado"
      | "Retirado"
      | "Prejudicado"
      | "Devolvido"
      | "Arquivado"
      status_parecer:
      | "Aguardando Relator"
      | "Em Análise"
      | "Concluído"
      | "Aprovado"
      | "Rejeitado"
      | "Em Tramitação"
      | "Publicado"
      | "Retirado"
      | "Prejudicado"
      | "Devolvido"
      status_presenca: ["Presente", "Ausente", "Ausente com Justificativa"]
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
  }
}
