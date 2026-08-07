import React, { createContext, useCallback, useContext } from 'react';

export type ZoomIntensity = 'hero' | 'soft';

export interface ZoomRequest {
  element?: HTMLElement | null;
  imageSrc?: string;
  imageFallbacks?: string[];
  radius?: number;
  intensity?: ZoomIntensity;
  onArrive: () => void;
  onFinish?: () => void;
}

interface ZoomContextValue {
  zoom: (request: ZoomRequest) => void;
  isZooming: boolean;
}

const ZoomContext = createContext<ZoomContextValue>({
  zoom: () => undefined,
  isZooming: false,
});

export const useZoomTransition = (): ZoomContextValue => useContext(ZoomContext);

export const ZoomTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const zoom = useCallback((request: ZoomRequest) => {
    request.onArrive();
    if (request.onFinish) {
      request.onFinish();
    }
  }, []);

  return (
    <ZoomContext.Provider value={{ zoom, isZooming: false }}>
      {children}
    </ZoomContext.Provider>
  );
};

