
import React, { useState, useRef, useEffect } from 'react';
import { ApiKeySelector } from './components/ApiKeySelector';
import { ImageUploader } from './components/ImageUploader';
import { LoadingScreen } from './components/LoadingScreen';
import { ImageFile, AppStep } from './types';
import { swapBagStyle, changeSceneAndOutfit, removeStoredApiKey } from './services/geminiService';

// Simplified options as requested
const GRID_OPTIONS = [
  { label: '6x6', value: '6x6 triangles' },
  { label: '7x7', value: '7x7 triangles' },
  { label: '10x10', value: '10x10 triangles' },
  { label: '5x3', value: '5x3 triangles' },
];

const MATERIAL_OPTIONS = [
  { label: '亮面', value: 'High-gloss glossy PVC material, mirror-like reflective surface, polished vinyl texture, sharp specular highlights, wet plastic look, pristine and smooth finish.' },
  { label: '霧面', value: 'Flat matte finish, frosted polyurethane texture, non-reflective rubberized coating, soft-touch plastic, smooth but dull surface, diffuse lighting interaction.' },
  { label: '金屬', value: 'Brushed metallic texture, shimmering anodized aluminum finish, gunmetal sheen, industrial metal material, fine grainy reflection, futuristic alloy surface.' },
  { label: '皮革', value: 'Realistic pebbled leather grain, premium faux leather texture, satin sheen, embossed organic surface details, soft luxury material, fine stitching details.' },
];

// --- FASHION OPTIONS DATA ---
const HAIR_OPTIONS = [
  { label: '空氣瀏海低包頭', value: 'low bun with airy bangs' },
  { label: '側邊碎髮低馬尾', value: 'low ponytail with soft side strands' },
  { label: '輕盈瀏海中長直髮', value: 'straight medium-length hair with light bangs' },
  { label: '空氣瀏海波波頭', value: 'short wavy bob with airy bangs' },
  { label: '慵懶低髮髻', value: 'loose low chignon with soft tendrils' },
  { label: '耳後中長直髮', value: 'shoulder-length straight hair tucked behind ears' },
];

const TOP_OPTIONS = [
  { label: '白色透膚罩衫', value: 'sheer lightweight blouse in white' },
  { label: '米色透膚罩衫', value: 'sheer blouse in soft beige' },
  { label: '黑色極簡削肩背心', value: 'black sleeveless minimalist top' },
  { label: '灰藍色針織上衣', value: 'light gray-blue knit top' },
  { label: '鼠尾草綠寬鬆上衣', value: 'sage-green loose top' },
  { label: '柔軟白色輕襯衫', value: 'soft white lightweight shirt' },
  { label: '灰褐長袖上衣', value: 'light taupe long-sleeve top' },
];

const BOTTOM_OPTIONS = [
  { label: '奶油白寬褲', value: 'cream wide-leg trousers' },
  { label: '垂墜感米白直筒褲', value: 'off-white drapey straight pants' },
  { label: '米色西裝寬褲', value: 'beige tailored wide trousers' },
  { label: '白色飄逸直筒褲', value: 'white flowy straight-leg pants' },
  { label: '象牙白直筒西褲', value: 'soft ivory straight trousers' },
  { label: '淺灰極簡寬褲', value: 'light gray minimalist wide pants' },
  { label: '淺色水洗直筒牛仔褲', value: 'light-wash straight-leg jeans (Asian minimalist fit)' },
  { label: '藍色高腰牛仔褲', value: 'soft blue high-waisted jeans with clean lines' },
  { label: '米白牛仔直筒褲', value: 'off-white denim straight pants' },
  { label: '米色牛仔寬褲', value: 'beige denim wide-leg jeans' },
  { label: '奶油高腰喇叭褲', value: 'cream high-waisted flare pants' },
  { label: '淺藍牛仔喇叭褲', value: 'light-wash denim flare trousers' },
  { label: '米色垂墜喇叭褲', value: 'soft beige flare pants with drapey fabric' },
];

const SHOE_OPTIONS = [
  { label: '黑色細帶涼鞋', value: 'black thin one-strap minimalist sandals' },
  { label: '奶油色細帶涼鞋', value: 'cream thin one-strap sandals' },
  { label: '白色極簡涼鞋', value: 'white minimalist single-strap sandals' },
  { label: '米色平底涼鞋', value: 'beige one-strap flat sandals' },
  { label: '黑色厚底樂福鞋', value: 'black chunky minimalist loafers' },
  { label: '奶油厚底樂福鞋', value: 'cream chunky loafers with clean design' },
  { label: '棕色韓系樂福鞋', value: 'brown chunky loafers in Korean minimalist style' },
];

const ATMOSPHERE_OPTIONS = [
  { label: '日系極簡 (低飽和/自然光)', value: 'soft Japanese minimalist vibe with low-saturation tones and natural light' },
  { label: '韓系街頭 (暖調/乾淨)', value: 'clean Korean street-style look with gentle warm lighting' },
  { label: '柔和粉嫩 (空氣感)', value: 'pastel-toned soft atmosphere with airy mood' },
  { label: '清爽自然 (明亮)', value: 'fresh and natural aesthetic with bright soft light' },
  { label: '優雅極簡 (暖中性色)', value: 'elegant minimalist mood in warm neutral tones' },
];

type AppMode = 'swap' | 'styling';

const App: React.FC = () => {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [appMode, setAppMode] = useState<AppMode>('swap');
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD_FILES);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  
  // Input Images
  const [originalImage, setOriginalImage] = useState<ImageFile | null>(null);
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
  
  // Configurations - Step 1
  // We use a single string state for bag instructions now, defaulting to 6x6
  const [bagInstruction, setBagInstruction] = useState('6x6 triangles');
  
  // New Color & Material Controls
  const [targetColorHex, setTargetColorHex] = useState('#e3dbd3');
  const [targetMaterial, setTargetMaterial] = useState(MATERIAL_OPTIONS[0].value);
  
  // Configurations - Step 2 (Fashion Selector)
  const [selectedHair, setSelectedHair] = useState(HAIR_OPTIONS[0].value);
  const [selectedTop, setSelectedTop] = useState(TOP_OPTIONS[0].value);
  const [selectedBottom, setSelectedBottom] = useState(BOTTOM_OPTIONS[0].value);
  const [selectedShoes, setSelectedShoes] = useState(SHOE_OPTIONS[0].value);
  const [selectedAtmosphere, setSelectedAtmosphere] = useState(ATMOSPHERE_OPTIONS[0].value);

  // Generated Results
  const [firstResultBase64, setFirstResultBase64] = useState<string | null>(null);
  const [finalResultBase64, setFinalResultBase64] = useState<string | null>(null);
  
  // Color & Texture Corrections
  const [brightness, setBrightness] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [contrast, setContrast] = useState(100); 
  const [hueRotate, setHueRotate] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Disconnect - Open Modal
  const handleDisconnectClick = () => {
    setShowDisconnectConfirm(true);
  };

  // Handle Disconnect - Confirm Action
  const confirmDisconnect = () => {
    removeStoredApiKey();
    setShowDisconnectConfirm(false);
    window.location.reload();
  };

  // Step 1: Generate Bag Swap
  const handleGenerateSwap = async () => {
    // If Styling Mode, skip AI swap and go directly to tune
    if (appMode === 'styling') {
      if (!originalImage) return;
      setFirstResultBase64(originalImage.base64);
      setStep(AppStep.REVIEW_SWAP);
      return;
    }

    // If Swap Mode, perform AI generation
    if (!originalImage || !referenceImage) return;
    
    // Direct usage of the single instruction state
    const finalGrid = bagInstruction;

    const finalColorDesc = `FORCE COLOR: ${targetColorHex} (Hex Code). Material: ${targetMaterial}`;

    setStep(AppStep.GENERATING_SWAP);
    resetFilters();
    
    try {
      const resultBase64 = await swapBagStyle(
        originalImage.base64,
        originalImage.file.type,
        referenceImage.base64,
        referenceImage.file.type,
        finalGrid,
        finalColorDesc
      );
      setFirstResultBase64(resultBase64);
      setStep(AppStep.REVIEW_SWAP);
    } catch (e) {
      alert("生成失敗，請檢查 Key 或圖片。");
      setStep(AppStep.UPLOAD_FILES);
    }
  };

  // Reset Filters Logic
  const resetFilters = () => {
    setBrightness(100);
    setSaturate(100);
    setContrast(100);
    setHueRotate(0);
  };

  // Helper: Apply CSS filters to the base64 image via Canvas and get new Base64
  const getFilteredImageBase64 = async (): Promise<string> => {
    if (!firstResultBase64) throw new Error("No image");
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("No context");

        // Apply filters
        ctx.filter = `brightness(${brightness}%) saturate(${saturate}%) contrast(${contrast}%) hue-rotate(${hueRotate}deg)`;
        ctx.drawImage(img, 0, 0);
        
        // Get data URL (remove header for Gemini API)
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl.split(',')[1]);
      };
      img.onerror = reject;
      img.src = `data:image/png;base64,${firstResultBase64}`;
    });
  };

  // Step 2: Generate Scene/Outfit Swap
  const handleGenerateScene = async () => {
    if (!firstResultBase64) return;
    
    // Construct the combined outfit prompt
    const outfitPrompt = `
      HAIR: ${selectedHair}
      TOP: ${selectedTop}
      BOTTOM: ${selectedBottom}
      SHOES: ${selectedShoes}
      ATMOSPHERE: ${selectedAtmosphere}
    `;

    setStep(AppStep.GENERATING_SCENE);
    try {
      // Bake the filters into the image before sending to AI
      const filteredBase64 = await getFilteredImageBase64();

      const resultBase64 = await changeSceneAndOutfit(
        filteredBase64,
        outfitPrompt
      );
      setFinalResultBase64(resultBase64);
      setStep(AppStep.FINAL_RESULT);
    } catch (e) {
      console.error(e);
      alert("場景更換失敗，請重試。");
      setStep(AppStep.CONFIGURE_SCENE);
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD_FILES);
    setOriginalImage(null);
    setReferenceImage(null);
    setFirstResultBase64(null);
    setFinalResultBase64(null);
    setBagInstruction('6x6 triangles');
    resetFilters();
  };

  // Inline Styles
  const sliderStyle = "w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black";
  const labelStyle = "flex justify-between text-[10px] uppercase text-gray-500 font-bold mb-1";
  const resetBtnStyle = "text-[10px] text-gray-300 hover:text-black px-2";
  const selectStyle = "w-full border-b border-gray-200 py-3 text-xs font-serif focus:border-black outline-none bg-transparent appearance-none cursor-pointer text-center hover:bg-gray-50 transition-colors";

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-gray-100">
      <ApiKeySelector onKeySelected={() => setApiKeyReady(true)} />

      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-serif font-bold text-black tracking-wide">BAO你發</h1>
          </div>
          <div className="flex items-center gap-4">
             {step > AppStep.UPLOAD_FILES && (
               <button 
                onClick={handleReset} 
                className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest"
               >
                 重置
               </button>
             )}
             <button
                onClick={handleDisconnectClick}
                className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                登出
              </button>
          </div>
        </div>
      </header>

      {/* Disconnect Modal */}
      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="font-serif text-xl mb-4">確認登出</h3>
            <p className="text-xs text-gray-500 mb-6">您確定要移除已儲存的 API Key 嗎？下次使用需重新輸入。</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowDisconnectConfirm(false)}
                className="px-6 py-2 border border-gray-200 text-xs font-bold uppercase hover:bg-gray-50"
              >
                取消
              </button>
              <button 
                onClick={confirmDisconnect}
                className="px-6 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800"
              >
                確認移除
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-20">
        
        {/* Step 1: Upload & Configure */}
        {step === AppStep.UPLOAD_FILES && (
          <div className="animate-fade-in-up space-y-8 max-w-3xl mx-auto">
            
            {/* MODE SWITCHER */}
            <div className="flex justify-center mb-6">
               <div className="flex border border-gray-200 rounded-full p-1 bg-gray-50">
                  <button 
                    onClick={() => setAppMode('swap')}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      appMode === 'swap' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    換包模式
                  </button>
                  <button 
                    onClick={() => setAppMode('styling')}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      appMode === 'styling' ? 'bg-black text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    穿搭模式
                  </button>
               </div>
            </div>

            {/* Images Row */}
            <div className="flex flex-row gap-4 h-64 md:h-80 justify-center">
              <ImageUploader
                id="original"
                label="實背照片"
                imagePreview={originalImage?.previewUrl || null}
                onImageSelected={(file, base64, preview) => setOriginalImage({ file, base64, previewUrl: preview, mimeType: file.type })}
                className={appMode === 'swap' ? "w-1/2 h-full" : "w-full max-w-md h-full"}
              />
              
              {appMode === 'swap' && (
                <ImageUploader
                  id="reference"
                  label="參考圖片"
                  imagePreview={referenceImage?.previewUrl || null}
                  onImageSelected={(file, base64, preview) => setReferenceImage({ file, base64, previewUrl: preview, mimeType: file.type })}
                  className="w-1/2 h-full"
                />
              )}
            </div>

            {/* Config Section - ONLY VISIBLE IN SWAP MODE */}
            {appMode === 'swap' && (
              <div className="bg-gray-50 p-6 space-y-6 border border-gray-100">
                 
                 {/* 1. Color Picker */}
                 <div className="flex flex-col items-center space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">步驟 1: 選擇目標顏色</label>
                   <div className="flex items-center gap-4 bg-white p-2 rounded-full border border-gray-200 shadow-sm">
                     <input 
                       type="color" 
                       value={targetColorHex}
                       onChange={(e) => setTargetColorHex(e.target.value)}
                       className="w-8 h-8 rounded-full border-none cursor-pointer bg-transparent"
                       title="點擊選擇顏色"
                     />
                     <span className="font-mono text-sm text-gray-600 w-20">{targetColorHex}</span>
                   </div>
                 </div>

                 {/* 2. Material Selector */}
                 <div className="flex flex-col items-center space-y-2">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">步驟 2: 選擇材質</label>
                   <div className="flex flex-wrap justify-center gap-2">
                      {MATERIAL_OPTIONS.map((mat) => (
                        <button
                          key={mat.label}
                          onClick={() => setTargetMaterial(mat.value)}
                          className={`px-4 py-2 text-xs transition-all duration-300 border ${
                            targetMaterial === mat.value 
                            ? 'bg-black text-white border-black' 
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {mat.label}
                        </button>
                      ))}
                   </div>
                 </div>

                 {/* 3. Grid Selector */}
                 <div className="flex flex-col items-center space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">步驟 3: 設定格數 / 額外指令</label>
                    
                    {/* Main Input */}
                    <input
                      type="text"
                      placeholder="例: 7x7, 扁一點, 10x10"
                      value={bagInstruction}
                      onChange={(e) => setBagInstruction(e.target.value)}
                      className="w-full max-w-xs border-b border-gray-200 text-center text-lg focus:border-black outline-none py-2 placeholder:text-gray-300 font-serif"
                    />

                    {/* Quick Tags */}
                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                      {GRID_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setBagInstruction(opt.value)}
                          className="px-3 py-1 text-[10px] border border-gray-200 rounded-full hover:border-black hover:bg-gray-50 transition-all text-gray-500"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <button
                disabled={!originalImage || (appMode === 'swap' && !referenceImage)}
                onClick={handleGenerateSwap}
                className="w-full md:w-auto px-20 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-gray-200"
              >
                {appMode === 'swap' ? '開始生成' : '直接開始調色'}
              </button>
            </div>
          </div>
        )}

        {/* Processing State */}
        {(step === AppStep.GENERATING_SWAP || step === AppStep.GENERATING_SCENE) && (
          <LoadingScreen message={step === AppStep.GENERATING_SWAP ? "AI 換色運算中..." : "場景重塑中..."} />
        )}

        {/* Step 2: Review & Tune */}
        {(step === AppStep.REVIEW_SWAP || step === AppStep.CONFIGURE_SCENE) && firstResultBase64 && (
          <div className="animate-fade-in flex flex-col lg:flex-row gap-8 items-start justify-center">
            
            {/* Left: Images Column (Side by Side) */}
            <div className="w-full lg:w-2/3 space-y-6">
                <div className={`flex flex-row gap-4 ${appMode === 'styling' ? 'justify-center' : ''}`}>
                    {/* Reference Image (Target) - ONLY IN SWAP MODE */}
                   {appMode === 'swap' && (
                     <div className="w-1/2 opacity-90">
                       <p className="text-[10px] text-center uppercase tracking-widest text-gray-400 mb-2">目標參考圖</p>
                       <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border border-gray-100 relative">
                         <img 
                            src={referenceImage?.previewUrl} 
                            alt="Target" 
                            className="max-w-full max-h-full object-contain"
                         />
                         {/* Color swatch overlay */}
                         <div 
                           className="absolute bottom-2 right-2 w-6 h-6 rounded-full border border-white shadow-sm"
                           style={{ backgroundColor: targetColorHex }}
                           title="目標色"
                         />
                       </div>
                     </div>
                   )}

                    {/* Generated Result (Editable) */}
                   <div className={appMode === 'swap' ? "w-1/2" : "w-full max-w-md"}>
                     <p className="text-[10px] text-center uppercase tracking-widest text-black mb-2 font-bold">
                        {appMode === 'swap' ? '生成結果' : '原始圖片'}
                     </p>
                     <div className="relative bg-white shadow-xl border border-gray-100">
                      <img 
                        src={`data:image/png;base64,${firstResultBase64}`} 
                        alt="Result Step 1" 
                        className="w-full h-auto transition-all duration-100"
                        style={{
                          filter: `brightness(${brightness}%) saturate(${saturate}%) contrast(${contrast}%) hue-rotate(${hueRotate}deg)`
                        }}
                      />
                     </div>
                   </div>
                </div>
            </div>

            {/* Right: Controls Column */}
            <div className="w-full lg:w-1/3 bg-gray-50 p-6 border border-gray-100 h-fit sticky top-24">
               {step === AppStep.REVIEW_SWAP && (
                  <div className="space-y-8">
                     <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                       <h3 className="text-xs font-bold uppercase tracking-widest">參數調整</h3>
                       <button onClick={resetFilters} className="text-[10px] bg-white border border-gray-200 px-2 py-1 uppercase hover:bg-gray-100">
                         重置
                       </button>
                     </div>

                     <div className="space-y-5">
                        {/* Contrast (Texture) */}
                        <div className="space-y-1">
                          <div className={labelStyle}>
                            <span>質感 (光澤/霧面)</span>
                            <div className="flex items-center gap-2">
                              <span>{contrast}%</span>
                              <button onClick={() => setContrast(100)} className={resetBtnStyle}>↺</button>
                            </div>
                          </div>
                          <input 
                            type="range" min="50" max="150" value={contrast} 
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className={sliderStyle}
                          />
                          <p className="text-[9px] text-gray-400 text-right">低=霧面 / 高=亮面</p>
                        </div>

                        {/* Saturation */}
                        <div className="space-y-1">
                          <div className={labelStyle}>
                            <span>飽和度</span>
                            <div className="flex items-center gap-2">
                              <span>{saturate}%</span>
                              <button onClick={() => setSaturate(100)} className={resetBtnStyle}>↺</button>
                            </div>
                          </div>
                          <input 
                            type="range" min="0" max="200" value={saturate} 
                            onChange={(e) => setSaturate(Number(e.target.value))}
                            className={sliderStyle}
                          />
                        </div>

                        {/* Brightness */}
                        <div className="space-y-1">
                          <div className={labelStyle}>
                            <span>亮度</span>
                            <div className="flex items-center gap-2">
                              <span>{brightness}%</span>
                              <button onClick={() => setBrightness(100)} className={resetBtnStyle}>↺</button>
                            </div>
                          </div>
                          <input 
                            type="range" min="50" max="150" value={brightness} 
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className={sliderStyle}
                          />
                        </div>

                        {/* Hue */}
                        <div className="space-y-1">
                          <div className={labelStyle}>
                            <span>色相</span>
                            <div className="flex items-center gap-2">
                              <span>{hueRotate}°</span>
                              <button onClick={() => setHueRotate(0)} className={resetBtnStyle}>↺</button>
                            </div>
                          </div>
                          <input 
                            type="range" min="-180" max="180" value={hueRotate} 
                            onChange={(e) => setHueRotate(Number(e.target.value))}
                            className={sliderStyle}
                          />
                        </div>
                     </div>

                     <div className="flex flex-col gap-3 pt-4">
                       <button 
                        onClick={() => setStep(AppStep.CONFIGURE_SCENE)}
                        className="w-full py-4 bg-black text-white hover:bg-gray-800 transition-all text-xs font-bold uppercase tracking-widest shadow-lg"
                       >
                         下一步: 換場景
                       </button>
                       
                       {appMode === 'swap' && (
                         <button 
                          onClick={handleGenerateSwap} // Re-run Step 1
                          className="w-full py-3 border border-gray-200 text-gray-500 hover:text-black hover:border-black transition-all text-[10px] font-bold uppercase tracking-widest"
                         >
                           不滿意? 重新生成
                         </button>
                       )}
                     </div>
                  </div>
               )}

               {step === AppStep.CONFIGURE_SCENE && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center">
                      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">步驟 2: 搭配您的專屬風格</label>
                      
                      <div className="space-y-4">
                        {/* 1. Hair */}
                        <div className="text-left">
                          <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">髮型</label>
                          <select 
                            value={selectedHair} 
                            onChange={(e) => setSelectedHair(e.target.value)}
                            className={selectStyle}
                          >
                            {HAIR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>

                        {/* 2. Top */}
                        <div className="text-left">
                          <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">上衣</label>
                          <select 
                            value={selectedTop} 
                            onChange={(e) => setSelectedTop(e.target.value)}
                            className={selectStyle}
                          >
                            {TOP_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>

                        {/* 3. Bottom */}
                        <div className="text-left">
                          <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">下身</label>
                          <select 
                            value={selectedBottom} 
                            onChange={(e) => setSelectedBottom(e.target.value)}
                            className={selectStyle}
                          >
                            {BOTTOM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>

                         {/* 4. Shoes */}
                         <div className="text-left">
                          <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">鞋子</label>
                          <select 
                            value={selectedShoes} 
                            onChange={(e) => setSelectedShoes(e.target.value)}
                            className={selectStyle}
                          >
                            {SHOE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>

                        {/* 5. Atmosphere */}
                        <div className="text-left">
                          <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">氛圍</label>
                          <select 
                            value={selectedAtmosphere} 
                            onChange={(e) => setSelectedAtmosphere(e.target.value)}
                            className={selectStyle}
                          >
                            {ATMOSPHERE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-4">
                      <button
                        onClick={handleGenerateScene}
                        className="w-full py-4 bg-black text-white uppercase tracking-widest text-xs font-bold hover:bg-gray-900 shadow-lg"
                      >
                        生成最終圖
                      </button>
                      <button
                        onClick={() => setStep(AppStep.REVIEW_SWAP)}
                        className="w-full py-3 border border-gray-200 text-gray-500 uppercase tracking-widest text-[10px] font-bold hover:text-black hover:border-black"
                      >
                        返回調色
                      </button>
                    </div>
                  </div>
               )}
            </div>

          </div>
        )}

        {/* Final Result */}
        {step === AppStep.FINAL_RESULT && finalResultBase64 && (
          <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
            <div className="flex justify-center">
              <div className="bg-white p-2 shadow-2xl max-w-md w-full">
                <img 
                  src={`data:image/png;base64,${finalResultBase64}`} 
                  alt="Final Result" 
                  className="w-full h-auto block"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
              <button 
                onClick={() => {
                   const link = document.createElement('a');
                   link.href = `data:image/png;base64,${finalResultBase64}`;
                   link.download = 'baobao-style.png';
                   link.click();
                }}
                className="py-3 bg-black text-white hover:bg-gray-800 transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                下載圖片
              </button>
              <button 
                onClick={() => setStep(AppStep.CONFIGURE_SCENE)}
                className="py-3 border border-gray-200 text-gray-600 hover:border-black hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest"
              >
                修改場景
              </button>
            </div>
            <div className="text-center">
              <button 
                onClick={handleReset}
                className="text-[10px] text-gray-300 hover:text-gray-500 underline"
              >
                重新開始
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
