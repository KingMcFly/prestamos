import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import SignaturePad from 'signature_pad';

interface SignatureCanvasProps {
  onEnd?: () => void;
}

export interface SignatureCanvasRef {
  isEmpty: () => boolean;
  clear: () => void;
  getDataURL: () => string;
  resize: () => void;
}

export const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(({ onEnd }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && signaturePadRef.current) {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      
      // Ajustar al tamaño del contenedor padre
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(ratio, ratio);
      
      signaturePadRef.current.clear(); 
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0)', // Fondo transparente para mejor blending si se desea
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 2.5,
        velocityFilterWeight: 0.7,
      });

      if (onEnd) {
        signaturePadRef.current.addEventListener("endStroke", onEnd);
      }
      
      // Pequeño delay para asegurar que el DOM está listo
      setTimeout(resizeCanvas, 50);
    }

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      signaturePadRef.current?.off();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    isEmpty: () => signaturePadRef.current?.isEmpty() ?? true,
    clear: () => signaturePadRef.current?.clear(),
    getDataURL: () => signaturePadRef.current?.toDataURL() ?? '',
    resize: resizeCanvas,
  }));

  return (
    <div className="w-full h-full bg-white cursor-crosshair">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block touch-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
});

SignatureCanvas.displayName = 'SignatureCanvas';