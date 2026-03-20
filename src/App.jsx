import { useState, useRef, useCallback } from 'react'
import Webcam from "react-webcam"
import { Camera, RefreshCw, Printer, Coins, Film, CheckCircle2 } from 'lucide-react'

const TOTAL_PHOTOS = 6;
const COUNTDOWN_START = 3;

const FILTERS = [
  { id: 'none',      name: 'NORMAL',  css: 'none' },
  { id: 'grayscale', name: 'B & W',   css: 'grayscale(100%)' },
  { id: 'sepia',     name: 'VINTAGE', css: 'sepia(100%)' },
  { id: 'vibrant',   name: 'VIBRANT', css: 'contrast(120%) saturate(150%)' },
  { id: 'cool',      name: 'COOL',    css: 'hue-rotate(180deg) saturate(110%)' },
  { id: 'warm',      name: 'WARM',    css: 'sepia(40%) saturate(130%)' },
  { id: 'fade',      name: 'FADE',    css: 'opacity(80%) sepia(20%)' },
  { id: 'contrast',  name: 'POP',     css: 'contrast(150%) brightness(110%)' },
];

const FRAMES = [
  { id: 'none',       name: 'NO FRAME',     padding: 0,  bgColor: '#000000', textColor: '#ffffff', bottomText: '' },
  { id: 'min-white',  name: 'CLASSIC',      padding: 20, bgColor: '#ffffff', textColor: '#000000', bottomText: '' },
  { id: 'polaroid',   name: 'POLAROID',     padding: 24, bgColor: '#f8fafc', textColor: '#1e293b', bottomText: 'PHOTO BOOTH' },
  { id: 'arcade',     name: 'ARCADE',       padding: 24, bgColor: '#ec4899', textColor: '#ffffff', bottomText: 'INSERT COIN TO PLAY' },
  { id: 'bff',        name: 'BESTIES',      padding: 24, bgColor: '#fbcfe8', textColor: '#be185d', bottomText: 'BEST FRIENDS FOREVER ❤️' },
  { id: 'grad',       name: 'CLASS 22-26',  padding: 24, bgColor: '#1e293b', textColor: '#f8fafc', bottomText: 'CLASS OF 2026 🎓' },
  { id: 'bro',        name: 'MY BRO',       padding: 24, bgColor: '#e2e8f0', textColor: '#0f172a', bottomText: 'MY BRO 👊' },
];

/* ── HUD/Overlays ────────────────────────────────── */
function CrtOverlay({ countdown, isCapturing }) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 md:p-6 text-white font-mono text-sm md:text-base text-shadow-sm shadow-black">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-red-500 ${isCapturing ? 'animate-pulse' : ''}`} />
          <span>REC</span>
        </div>
        <div className="text-right">
          <div>CH-3</div>
          <div>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
      
      {/* Center Reticle */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="w-16 h-16 border-2 border-white/50 rounded-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full" />
        </div>
        <div className="absolute w-24 h-px bg-white/50" />
        <div className="absolute h-24 w-px bg-white/50" />
      </div>

      {/* Countdown */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/40">
          <span className="font-display text-[120px] md:text-[180px] font-bold text-white drop-shadow-[0_10px_0_#db2777] animate-countdown-in">
            {countdown}
          </span>
        </div>
      )}
    </div>
  );
}

function ProgressIndicators({ total, done }) {
  return (
    <div className="flex gap-2.5 justify-center bg-slate-800 p-3 rounded-2xl border-4 border-slate-700 mx-auto w-fit">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-6 h-6 rounded-full border-4 transition-all duration-300 ${
            i < done ? 'bg-pink-500 border-pink-300 shadow-[0_0_15px_#ec4899]' : 'bg-slate-900 border-slate-600 shadow-inner'
          }`}
        />
      ))}
    </div>
  );
}

/* ── Main App ────────────────────────────────────── */
export default function App() {
  const [step, setStep]               = useState('capture');
  const [photos, setPhotos]           = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown]     = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [showFlash, setShowFlash]     = useState(false);

  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedFrame,  setSelectedFrame]  = useState(FRAMES[1]); // Default to classic

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const triggerFlash = useCallback(() => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 500);
  }, []);

  const startCaptureSequence = async () => {
    setIsCapturing(true);
    setPhotos([]);
    let currentPhotos = [];

    for (let i = 0; i < TOTAL_PHOTOS; i++) {
      for (let c = COUNTDOWN_START; c > 0; c--) {
        setCountdown(c);
        await new Promise(res => setTimeout(res, 1000));
      }
      setCountdown(null);
      await new Promise(res => setTimeout(res, 100)); // Brief pause before snap

      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          triggerFlash();
          currentPhotos.push(imageSrc);
          setPhotos([...currentPhotos]);
        }
      }

      if (i < TOTAL_PHOTOS - 1) {
        await new Promise(res => setTimeout(res, 800)); // Delay between shots
      }
    }

    setIsCapturing(false);
    setStep('preview');
  };

  const drawCollage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || photos.length === 0) return null;
    const ctx = canvas.getContext('2d');

    const imgWidth = 640, imgHeight = 480, cols = 2, rows = 3, gap = 20;
    const frame = selectedFrame;
    const padding = frame.padding;
    const bottomPadding = frame.bottomText ? Math.max(100, padding * 3) : padding;

    const totalWidth  = (imgWidth * cols) + (gap * (cols - 1)) + (padding * 2);
    const totalHeight = (imgHeight * rows) + (gap * (rows - 1)) + padding + bottomPadding;

    canvas.width  = totalWidth;
    canvas.height = totalHeight;

    ctx.fillStyle = frame.bgColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    const loadedImages = await Promise.all(
      photos.map(src => new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      }))
    );

    ctx.filter = selectedFilter.css;
    loadedImages.forEach((img, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      ctx.drawImage(img, padding + col * (imgWidth + gap), padding + row * (imgHeight + gap), imgWidth, imgHeight);
    });
    ctx.filter = 'none';

    if (frame.bottomText) {
      ctx.fillStyle = frame.textColor;
      ctx.font = 'bold 56px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(frame.bottomText, totalWidth / 2, totalHeight - (bottomPadding / 2) + 20);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleDownload = async () => {
    const dataUrl = await drawCollage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `photobooth-${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    }
  };

  const handleReset = () => {
    setPhotos([]);
    setStep('capture');
  };

  return (
    <div className="min-h-screen py-8 px-4 md:py-12 booth-curtain flex items-center justify-center relative overflow-hidden">
      
      {/* Physical Flash Bulb Effect */}
      {showFlash && (
        <div className="absolute inset-0 z-50 bg-white animate-flash pointer-events-none mix-blend-screen" />
      )}

      {/* ── THE MACHINE CASING ── */}
      <main className="w-full max-w-5xl machine-casing p-6 md:p-10 flex flex-col gap-8 relative z-10 border-[12px] border-slate-300">
        
        {/* Marquee Header */}
        <header className="bg-slate-900 rounded-3xl p-4 border-8 border-slate-800 shadow-inner flex flex-col items-center justify-center">
          <div className="flex items-center gap-4 text-pink-500">
            <Coins className="w-8 h-8" />
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-widest text-[#fdf2f8] drop-shadow-[0_0_15px_#ec4899]">
              PHOTO BOOTH
            </h1>
            <Coins className="w-8 h-8" />
          </div>
          <div className="mt-2 flex gap-4 text-xs font-mono text-cyan-400 tracking-widest">
            <span>[ INSERT COIN ]</span>
            <span>[ PRESS START ]</span>
          </div>
        </header>

        {/* ── CAPTURE MODE ── */}
        {step === 'capture' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl mx-auto items-center">
            
            {/* The CRT Monitor Area */}
            <div className="p-4 md:p-6 bg-slate-800 rounded-[32px] border-4 border-slate-600 shadow-2xl relative">
              <div className="crt-monitor aspect-[4/3] w-full">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 1280, height: 960, facingMode: 'user' }}
                  onUserMedia={() => setCameraReady(true)}
                  className="w-full h-full object-cover scale-x-[-1]" /* Mirror the webcam */
                />
                <CrtOverlay countdown={countdown} isCapturing={isCapturing} />
                
                {!cameraReady && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
                    <span className="font-mono text-xl text-green-500 animate-pulse">
                      &gt; BOOTING CAMERA...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Control Deck */}
            <div className="bg-slate-300 p-6 rounded-3xl border-b-[12px] border-slate-400 shadow-inner flex flex-col gap-6">
              
              {!isCapturing && photos.length === 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-slate-700 text-lg flex items-center justify-center gap-2">
                    <Printer className="w-5 h-5 text-purple-600" /> CHOOSE YOUR TEMPLATE
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                    {FRAMES.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFrame(f)}
                        className={`btn-3d px-2 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border-2 ${
                          selectedFrame.id === f.id ? 'btn-3d-pink border-pink-300' : 'btn-3d-slate border-slate-500'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-sm border border-white/40 shadow-inner flex-shrink-0" style={{ background: f.bgColor }} />
                        <span className="truncate">{f.name}</span>
                      </button>
                    ))}
                  </div>
                  <div className="h-1 bg-slate-400/30 rounded-full mt-2" />
                </div>
              )}

              <ProgressIndicators total={TOTAL_PHOTOS} done={photos.length} />
              
              <button
                onClick={startCaptureSequence}
                disabled={!cameraReady || isCapturing}
                className="btn-3d btn-3d-pink w-full py-6 md:py-8 rounded-2xl text-2xl md:text-3xl font-display font-bold flex items-center justify-center gap-4 border-4 border-pink-300"
              >
                <Camera className="w-8 h-8 md:w-10 md:h-10" />
                {isCapturing ? 'CAPTURING...' : 'START SESSION'}
              </button>
            </div>
          </div>
        )}

        {/* ── PREVIEW MODE ── */}
        {step === 'preview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-4xl mx-auto items-start">
            
            {/* The "Printed" Photo Slot */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-full bg-slate-800 p-4 md:p-6 rounded-3xl border-4 border-slate-700 shadow-2xl">
                <div 
                  className="w-full transition-all duration-300 origin-top shadow-2xl animate-slide-up"
                  style={{
                    backgroundColor: selectedFrame.bgColor,
                    padding: `${selectedFrame.padding / 2}px`,
                    paddingBottom: selectedFrame.bottomText ? `${Math.max(48, selectedFrame.padding * 1.5)}px` : `${selectedFrame.padding / 2}px`,
                    borderRadius: '8px', 
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="grid grid-cols-2 gap-2" style={{ filter: selectedFilter.css }}>
                    {photos.map((src, i) => (
                      <img key={i} src={src} className="w-full aspect-[4/3] object-cover rounded-sm border border-black/10" alt={`p-${i}`} />
                    ))}
                  </div>
                  {selectedFrame.bottomText && (
                    <div className="text-center pt-3 mt-1">
                      <span className="font-display font-bold text-xl md:text-2xl" style={{ color: selectedFrame.textColor }}>
                        {selectedFrame.bottomText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-slate-800 rounded-full px-6 py-2 text-slate-300 font-mono text-sm border-2 border-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" /> PHOTOS PROCESSED
              </div>
            </div>

            {/* Editing Control Deck */}
            <div className="bg-slate-300 p-6 rounded-3xl border-b-[12px] border-slate-400 shadow-inner flex flex-col gap-6">
              
              <div className="space-y-3">
                <h3 className="font-display font-bold text-slate-700 text-lg flex items-center gap-2">
                  <Film className="w-5 h-5 text-pink-600" /> SELECT FILTER
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {FILTERS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f)}
                      className={`btn-3d px-2 py-3 rounded-xl font-bold text-xs border-2 ${
                        selectedFilter.id === f.id ? 'btn-3d-pink border-pink-300' : 'btn-3d-slate border-slate-500'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-1 bg-slate-400/30 rounded-full" />

              <div className="space-y-3">
                <h3 className="font-display font-bold text-slate-700 text-lg flex items-center gap-2">
                  <Printer className="w-5 h-5 text-purple-600" /> SELECT FRAME
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {FRAMES.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFrame(f)}
                      className={`btn-3d px-2 py-3 rounded-xl font-bold text-xs border-2 flex items-center justify-center gap-2 ${
                        selectedFrame.id === f.id ? 'btn-3d-pink border-pink-300' : 'btn-3d-slate border-slate-500'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-sm border border-white/40 shadow-inner flex-shrink-0" style={{ background: f.bgColor }} />
                      <span className="truncate">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-1 bg-slate-400/30 rounded-full mt-2" />

              {/* Action Buttons */}
              <button
                onClick={handleDownload}
                className="btn-3d btn-3d-pink w-full py-5 rounded-2xl text-xl font-display font-bold flex items-center justify-center gap-3 border-4 border-pink-300 mt-2"
              >
                <Printer className="w-6 h-6" />
                PRINT / DOWNLOAD
              </button>
              
              <button
                onClick={handleReset}
                className="btn-3d bg-slate-200 text-slate-700 box-shadow-[0_6px_0_0_#94a3b8] hover:bg-white w-full py-4 rounded-2xl text-lg font-display font-bold flex items-center justify-center gap-3 border-4 border-slate-400"
                style={{ boxShadow: '0 5px 0 0 #94a3b8' }}
              >
                <RefreshCw className="w-5 h-5" />
                NEW SESSION
              </button>

            </div>
          </div>
        )}
        
        {/* Machine Air Vents / Base details */}
        <div className="flex justify-between px-8 mt-4 pt-6 border-t border-slate-400/30">
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-12 bg-slate-400 rounded-full shadow-inner" />)}
          </div>
          <div className="font-mono text-slate-400 text-xs font-bold self-end">[ MODEL-X99 ]</div>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-12 bg-slate-400 rounded-full shadow-inner" />)}
          </div>
        </div>

      </main>

      {/* Hidden canvas for collage generation */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
