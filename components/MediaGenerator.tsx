
import React, { useState } from 'react';
import { generateImagePro, editImageFlash, getGeminiClient } from '../services/gemini';
import { ImageGenerationOptions, VideoGenerationOptions } from '../types';

const MediaGenerator: React.FC = () => {
  const [mode, setMode] = useState<'generate' | 'edit' | 'video'>('generate');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [imageOptions, setImageOptions] = useState<ImageGenerationOptions>({
    aspectRatio: '1:1',
    imageSize: '1K'
  });
  const [videoOptions, setVideoOptions] = useState<VideoGenerationOptions>({
    aspectRatio: '16:9',
    resolution: '720p'
  });
  const [baseImage, setBaseImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (re) => setBaseImage(re.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!prompt && mode !== 'video') return;
    setLoading(true);
    setResultUrl(null);
    try {
      if (mode === 'generate') {
        const url = await generateImagePro(prompt, imageOptions);
        setResultUrl(url);
      } else if (mode === 'edit' && baseImage) {
        const url = await editImageFlash(prompt, baseImage);
        setResultUrl(url);
      } else if (mode === 'video' && baseImage) {
        // El video sigue requiriendo una llave con facturación
        const ai = getGeminiClient();
        let operation;
        
        operation = await ai.models.generateVideos({
          model: 'veo-3.1-fast-generate-preview',
          prompt: prompt || 'Un video mágico de este personaje cobrando vida',
          image: { imageBytes: baseImage.split(',')[1], mimeType: 'image/png' },
          config: { numberOfVideos: 1, resolution: videoOptions.resolution, aspectRatio: videoOptions.aspectRatio }
        });

        while (!operation.done) {
          await new Promise(r => setTimeout(r, 10000));
          operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
           const videoRes = await fetch(`${downloadLink}&key=${(import.meta as any).env.VITE_GEMINI_API_KEY}`);
           const blob = await videoRes.blob();
           setResultUrl(URL.createObjectURL(blob));
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('¡Vaya! La magia falló un poco. Revisa que tu VITE_GEMINI_API_KEY sea válida en Vercel.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-white/40 backdrop-blur-md rounded-[2.5rem] border-2 border-white/30 shadow-xl">
      <div className="flex justify-center gap-2 bg-indigo-900/10 p-2 rounded-2xl">
        {['generate', 'edit', 'video'].map((m) => (
          <button key={m} onClick={() => { setMode(m as any); setResultUrl(null); }} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase ${mode === m ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-800 hover:bg-white/20'}`}>
            {m === 'generate' ? 'Crear' : m === 'edit' ? 'Editar' : 'Video'}
          </button>
        ))}
      </div>

      {(mode === 'edit' || mode === 'video') && (
        <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed border-indigo-200 rounded-3xl">
          <label className="text-xs font-magic text-indigo-700 uppercase">Selecciona una imagen base</label>
          <input type="file" onChange={handleFileUpload} className="text-[10px] text-indigo-800" />
          {baseImage && <img src={baseImage} className="w-24 h-24 object-cover rounded-2xl shadow-lg ring-4 ring-white" />}
        </div>
      )}

      <textarea 
        value={prompt} 
        onChange={(e) => setPrompt(e.target.value)} 
        placeholder={mode === 'video' ? "Describe qué quieres que pase en el video..." : "Describe el hechizo que quieres lanzar..."} 
        className="w-full p-4 rounded-3xl border-none shadow-inner bg-white/80 focus:ring-4 focus:ring-indigo-300 outline-none text-indigo-900 font-bold placeholder-indigo-300" 
        rows={3} 
      />

      <div className="flex flex-col gap-2">
        <button onClick={handleAction} disabled={loading || (!prompt && mode !== 'video')} className="w-full py-5 rounded-full font-magic text-xl text-white bg-indigo-600 btn-magic-pop disabled:grayscale shadow-xl active:translate-y-1">
          {loading ? 'HACIENDO MAGIA...' : 'LANZAR HECHIZO'}
        </button>
        {mode === 'video' && (
          <p className="text-[10px] text-center text-indigo-400 font-bold uppercase">El video requiere cuenta con facturación en Google Cloud</p>
        )}
      </div>

      {resultUrl && (
        <div className="mt-4 p-4 bg-white/60 rounded-3xl border-2 border-white shadow-xl flex flex-col items-center gap-4 animate-fade-in">
          <h3 className="font-magic text-lg text-indigo-900 uppercase">¡HECHIZO COMPLETADO!</h3>
          {mode === 'video' ? (
            <video src={resultUrl} controls className="w-full rounded-2xl shadow-lg" />
          ) : (
            <img src={resultUrl} className="w-full rounded-2xl shadow-lg" />
          )}
          <a href={resultUrl} download="magia-gumi" className="bg-indigo-500 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">Guardar Obra</a>
        </div>
      )}
    </div>
  );
};

export default MediaGenerator;
