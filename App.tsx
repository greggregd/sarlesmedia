
import React, { useState, useCallback, useRef } from 'react';
import { AppStep, ImageData, HeadshotStyle } from './types';
import { STYLES } from './constants';
import { gemini } from './services/gemini';
import { fileToImageData, dataUrlToImageData } from './utils/image';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('landing');
  const [sourceImage, setSourceImage] = useState<ImageData | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<HeadshotStyle | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setStep('landing');
    setSourceImage(null);
    setSelectedStyle(null);
    setGeneratedImage(null);
    setError(null);
    setEditPrompt('');
  };

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await fileToImageData(file);
        setSourceImage(data);
        setStep('style');
      } catch (err) {
        setError('Failed to process image. Please try another one.');
      }
    }
  };

  const handleGenerate = async (style: HeadshotStyle) => {
    if (!sourceImage) return;
    setSelectedStyle(style);
    setIsProcessing(true);
    setError(null);
    try {
      const result = await gemini.generateHeadshot(sourceImage, style.prompt);
      setGeneratedImage(result);
      setStep('editor');
    } catch (err) {
      setError('Gemini AI failed to generate your headshot. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedImage || !editPrompt.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const currentImgData = dataUrlToImageData(generatedImage);
      const result = await gemini.editHeadshot(currentImgData, editPrompt);
      setGeneratedImage(result);
      setEditPrompt('');
    } catch (err) {
      setError('Failed to apply edits. Please try a different request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `lumina-headshot-${Date.now()}.png`;
    link.click();
  };

  return (
    <Layout onReset={handleReset}>
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-md transition-all">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-white text-xl font-semibold mb-2">
            {step === 'style' ? 'Processing at OCVTS Brick...' : 'Refining Your Portrait...'}
          </h3>
          <p className="text-gray-300 text-sm animate-pulse">
            Using advanced multimedia AI to perfect your image
          </p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 hover:text-red-900">&times;</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        {step === 'landing' && (
          <div className="text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8 border border-indigo-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              OCVTS Multimedia Presentation
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
              Professional Portraits <br />
              <span className="text-indigo-600">Reimagined</span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Welcome to Mr. Sarles' <strong>Intro to Multimedia</strong> class project. 
              Turn any casual selfie into a world-class professional headshot using 
              high-end AI technology.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200/50 active:scale-95 flex items-center justify-center gap-3"
              >
                <i className="fas fa-upload"></i>
                Upload Your Photo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={onFileUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            
            <div className="mt-20 border-t border-gray-100 pt-16">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                Explore Professional Styles
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {STYLES.map(s => (
                  <img key={s.id} src={s.previewUrl} alt={s.name} className="w-full h-48 object-cover rounded-2xl shadow-lg" />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'style' && sourceImage && (
          <div className="animate-in fade-in duration-500">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Multimedia Style</h2>
              <p className="text-gray-600">Curated styles for the modern professional, Brick NJ Campus Edition.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STYLES.map((style) => (
                <div 
                  key={style.id}
                  onClick={() => handleGenerate(style)}
                  className={`group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer border flex flex-col h-full ${style.id === 'ocvts-multimedia' ? 'border-indigo-200 ring-2 ring-indigo-50' : 'border-gray-100'}`}
                >
                  <div className="aspect-[4/5] relative overflow-hidden">
                    <img 
                      src={style.previewUrl} 
                      alt={style.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {style.id === 'ocvts-multimedia' && (
                      <div className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        Featured Style
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <span className="text-white font-semibold">Generate in {style.name} Style</span>
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{style.name}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-grow">{style.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'editor' && generatedImage && (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl overflow-hidden border border-gray-100">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="relative group">
                  <img 
                    src={generatedImage} 
                    alt="AI Generated Headshot" 
                    className="w-full aspect-[4/5] object-cover rounded-[2rem] shadow-inner"
                  />
                  <button 
                    onClick={downloadImage}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-full text-indigo-600 shadow-lg hover:bg-white hover:scale-110 transition-all active:scale-95"
                    title="Download Headshot"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                </div>

                <div className="flex flex-col justify-center p-4">
                  <div className="mb-8">
                    <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-green-100">
                      Multimedia Optimized
                    </span>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Refine Your Image</h2>
                    <p className="text-gray-600 mb-6">
                      As we discuss in Mr. Sarles' class, composition and details matter. Describe any tweaks you'd like the AI to make.
                    </p>
                  </div>

                  <form onSubmit={handleEdit} className="space-y-4">
                    <div className="relative">
                      <input 
                        type="text"
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder="e.g. Adjust lighting to be more dramatic..."
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white px-5 py-4 rounded-2xl transition-all outline-none text-sm"
                      />
                      <button 
                        type="submit"
                        disabled={!editPrompt.trim() || isProcessing}
                        className="absolute right-2 top-2 bottom-2 bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 text-xs"
                      >
                        Apply
                      </button>
                    </div>
                  </form>

                  <div className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-between">
                    <button 
                      onClick={handleReset}
                      className="text-gray-500 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2 text-sm"
                    >
                      <i className="fas fa-undo"></i>
                      Start Over
                    </button>
                    <button 
                      onClick={downloadImage}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 text-sm"
                    >
                      Export Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <i className="fas fa-graduation-cap text-indigo-400"></i>
                OCVTS Brick Campus
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-pencil-alt text-indigo-400"></i>
                Intro to Multimedia
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-user-tie text-indigo-400"></i>
                Mr. Sarles
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
