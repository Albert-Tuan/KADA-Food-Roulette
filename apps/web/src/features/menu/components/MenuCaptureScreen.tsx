import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowLeft, X } from 'lucide-react';
import { menuApi, MenuCaptureResponse } from '../../../api/endpoints/menu';

export const MenuCaptureScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>('rest-1');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const newUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setSelectedFiles(prev => [...prev, ...filesArray]);
      setPreviewUrls(prev => [...prev, ...newUrls]);
      setErrorMessage(null);
    }
    // reset input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const handleCapture = async () => {
    try {
      setIsScanning(true);
      setErrorMessage(null);

      if (selectedFiles.length === 0) {
        setErrorMessage('Vui lòng chọn hoặc chụp ít nhất 1 ảnh menu trước.');
        setIsScanning(false);
        return;
      }
      
      const res: MenuCaptureResponse = await menuApi.captureMenu(restaurantId, selectedFiles);

      // Navigate to review screen with results
      navigate('/spin/menu-review', {
        state: {
          menuId: res.menuId,
          initialItems: res.items,
          confidence: res.confidence,
          previewUrl: previewUrls[0],
        },
      });
    } catch (err: any) {
      console.error('Menu capture API error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Lỗi kết nối đến AI server. Vui lòng kiểm tra backend.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-amber-50/40 p-4 pb-24 text-slate-800 font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white border border-amber-200/60 shadow-sm hover:bg-amber-100/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            📷 Chụp Menu Tại Quán
          </h1>
          <p className="text-xs text-stone-500">Gemini AI Vision sẽ tự động quét và bóc tách</p>
        </div>
      </div>

      {/* Selected Images List */}
      {previewUrls.length > 0 && !isScanning && (
        <div className="flex gap-3 mb-4 overflow-x-auto pb-2 shrink-0 snap-x">
          {previewUrls.map((url, idx) => (
            <div key={idx} className="relative w-20 h-28 shrink-0 rounded-lg overflow-hidden border border-amber-200 shadow-sm snap-start group">
              <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeFile(idx)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Viewfinder Box */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-900 border-2 border-dashed border-amber-300 shadow-lg aspect-[3/4] flex flex-col items-center justify-center text-center group shrink-0">
        {previewUrls.length > 0 ? (
          <div className="relative w-full h-full">
            <img src={previewUrls[previewUrls.length - 1]} alt="Menu Preview" className="w-full h-full object-cover opacity-80" />
            {isScanning && (
              <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-white animate-fade-in">
                <div className="relative mb-4">
                  <Sparkles className="w-12 h-12 text-amber-400 animate-bounce" />
                  <Loader2 className="w-16 h-16 text-amber-500 animate-spin absolute -inset-2" />
                </div>
                <h3 className="font-semibold text-lg text-amber-200">Gemini đang phân tích {previewUrls.length} ảnh...</h3>
                <p className="text-xs text-stone-300 mt-1 max-w-xs">
                  AI đang đọc toàn bộ món ăn và giá tiền từ các ảnh bạn vừa tải lên
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center text-stone-400">
            <div className="p-4 rounded-full bg-amber-500/10 text-amber-500 mb-3 border border-amber-500/20">
              <Camera className="w-10 h-10" />
            </div>
            <p className="text-sm font-medium text-stone-300 mb-1">Có thể chọn nhiều ảnh cùng lúc</p>
            <p className="text-xs text-stone-500 max-w-xs">Đảm bảo đủ ánh sáng và chữ viết rõ ràng để AI bóc tách chính xác nhất</p>
          </div>
        )}

        {/* Input file overlay button */}
        {!isScanning && (
          <label className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur border border-amber-200 text-stone-700 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md hover:bg-white transition-all">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            Chọn ảnh menu từ thiết bị
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-6 shrink-0">
        <button
          onClick={handleCapture}
          disabled={previewUrls.length === 0 || isScanning}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all ${
            previewUrls.length > 0 && !isScanning
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-orange-500/25 active:scale-[0.98]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang phân tích OCR...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Bắt đầu AI OCR Quét Menu
            </>
          )}
        </button>
      </div>

      {/* Features highlight */}
      <div className="mt-6 p-4 rounded-2xl bg-white border border-amber-100 shadow-sm space-y-2.5 text-xs text-stone-600 shrink-0">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>Tự động chuyển định dạng giá tiếng Việt (45k, 45.000đ)</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>Tự phân loại món chính, đồ uống và gán nhãn cay / chay</span>
        </div>
      </div>
    </div>
  );
};

export default MenuCaptureScreen;
