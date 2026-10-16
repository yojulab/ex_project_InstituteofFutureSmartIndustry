'use client';

import { useEffect } from 'react';
import { initUiInspector } from '@/lib/inspector/uiInspector';

export function UiInspector() {
  useEffect(() => {
    initUiInspector();
  }, []);

  return null;
}

export default UiInspector;
