
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { supabase } from '@/integrations/supabase/client';

type ImageUploadProps = {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  disabled?: boolean;
};

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImageUrl,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    setIsUploading(true);

    try {
      // Criar preview imediato
      const tempPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(tempPreviewUrl);

      // Otimizar a imagem
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = compressedFile.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from('fotos-agentes')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('fotos-agentes')
        .getPublicUrl(fileName);

      // Limpar o preview temporário
      URL.revokeObjectURL(tempPreviewUrl);
      
      // Atualizar com a URL final
      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);

    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
      setPreviewUrl(currentImageUrl || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Foto do Agente</Label>
      
      <div className="flex flex-col gap-4">
        {/* Área de preview */}
        {previewUrl && (
          <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!isUploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1" />
                  <span className="text-xs">Processando...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botão de upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando imagem...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {previewUrl ? 'Alterar Imagem' : 'Selecionar Imagem'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
