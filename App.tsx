
import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Download, RefreshCw, CheckCircle, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { ImageState, Gender, TransformOptions } from './types';
import { transformImageToProfessional } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    original: null,
    transformed: null,
    isProcessing: false,
    error: null,
  });

  const [options, setOptions] = useState<TransformOptions>({
    gender: Gender.UNSPECIFIED,
    suitColor: '네이비',
    backgroundType: 'grey',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState({
          original: event.target?.result as string,
          transformed: null,
          isProcessing: false,
          error: null,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!state.original) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));
    
    try {
      const result = await transformImageToProfessional(state.original, options);
      setState(prev => ({
        ...prev,
        transformed: result,
        isProcessing: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: "사진 변환 중 오류가 발생했습니다. 다시 시도해 주세요.",
      }));
    }
  };

  const downloadResult = () => {
    if (!state.transformed) return;
    const link = document.createElement('a');
    link.href = state.transformed;
    link.download = 'professional-resume-photo.png';
    link.click();
  };

  const reset = () => {
    setState({
      original: null,
      transformed: null,
      isProcessing: false,
      error: null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <header className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
          ProPhoto <span className="text-blue-600">Resume</span>
        </h1>
        <p className="text-lg text-slate-600">
          AI가 당신의 사진을 10초 만에 전문 스튜디오 증명사진으로 바꿔드립니다.
        </p>
      </header>

      <main className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Section: Input & Options */}
        <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              사진 업로드
            </h2>
            
            {!state.original ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
              >
                <div className="bg-slate-100 p-4 rounded-full group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <p className="mt-4 font-semibold text-slate-700">여기를 클릭하여 사진 선택</p>
                <p className="text-sm text-slate-500">정면 얼굴이 잘 나온 사진이 가장 좋습니다.</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*" 
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden h-64 bg-slate-100 border border-slate-200">
                <img 
                  src={state.original} 
                  alt="Original" 
                  className="w-full h-full object-contain"
                />
                <button 
                  onClick={reset}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              변환 옵션
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">성별 설정</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={options.gender}
                  onChange={(e) => setOptions({...options, gender: e.target.value as Gender})}
                >
                  <option value={Gender.UNSPECIFIED}>자동 인식</option>
                  <option value={Gender.MALE}>남성 스타일</option>
                  <option value={Gender.FEMALE}>여성 스타일</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">정장 색상</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={options.suitColor}
                  onChange={(e) => setOptions({...options, suitColor: e.target.value})}
                >
                  <option value="네이비">클래식 네이비</option>
                  <option value="블랙">깔끔한 블랙</option>
                  <option value="다크 그레이">차분한 그레이</option>
                  <option value="밝은 정장">밝은 컬러</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">배경 스타일</label>
              <div className="flex gap-4">
                <button 
                  onClick={() => setOptions({...options, backgroundType: 'grey'})}
                  className={`flex-1 py-3 px-4 rounded-xl border transition-all ${options.backgroundType === 'grey' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  전문 스튜디오 (그레이)
                </button>
                <button 
                  onClick={() => setOptions({...options, backgroundType: 'white'})}
                  className={`flex-1 py-3 px-4 rounded-xl border transition-all ${options.backgroundType === 'white' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-600'}`}
                >
                  깔끔한 화이트
                </button>
              </div>
            </div>

            <button
              onClick={handleTransform}
              disabled={!state.original || state.isProcessing}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                !state.original || state.isProcessing 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {state.isProcessing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  인공지능이 변환 중...
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  변환하기
                </>
              )}
            </button>

            {state.error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{state.error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Section: Result */}
        <section className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col min-h-[500px]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            변환 결과
          </h2>

          <div className="flex-grow flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 relative overflow-hidden">
            {state.isProcessing ? (
              <div className="text-center px-8">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">거의 다 되었습니다!</h3>
                <p className="text-slate-500 text-sm animate-bounce">
                  배경을 합성하고 조명을 최적화하고 있습니다...
                </p>
              </div>
            ) : state.transformed ? (
              <div className="w-full h-full flex flex-col items-center p-4">
                <img 
                  src={state.transformed} 
                  alt="Transformed" 
                  className="max-h-[500px] w-auto rounded-lg shadow-2xl border-4 border-white"
                />
                <button
                  onClick={downloadResult}
                  className="mt-6 flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl hover:bg-black transition-colors shadow-lg active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  이미지 다운로드
                </button>
              </div>
            ) : (
              <div className="text-center text-slate-400">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>왼쪽에서 사진을 선택하고 변환을 시작하세요.</p>
              </div>
            )}
          </div>

          <div className="mt-8 bg-blue-50 p-4 rounded-xl">
            <h4 className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-1">
              💡 팁
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              최상의 결과를 위해 정면을 응시하고 표정이 자연스러운 사진을 선택해주세요. 안경 반사가 없거나 조명이 밝은 사진일수록 인공지능이 더 정확하게 인식합니다.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-20 text-slate-400 text-sm pb-10">
        &copy; 2024 ProPhoto Resume. AI-powered portrait transformation.
      </footer>
    </div>
  );
};

export default App;
