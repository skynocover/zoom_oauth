'use client';

import { useState, useCallback, useEffect } from 'react';
import { zoomAuthUrl } from '@/utils/zoom';
import axios from 'axios';

interface ZoomAuthEvent {
  type: 'zoom-auth-success' | 'zoom-auth-error';
  data?: {
    access_token: string;
  };
}

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleZoomAuth = useCallback(async (event: MessageEvent<ZoomAuthEvent>) => {
    if (event.origin !== window.location.origin) return;

    if (event.data.type === 'zoom-auth-success' && event.data.data?.access_token) {
      try {
        // Cast event.source to Window type since we know it's a window in this case
        (event.source as Window)?.close();
        const { data } = await axios.post('/api/zoom/meetings', {
          zoomAccessToken: event.data.data.access_token,
        });
        console.log({ data });
        window.open(data.meeting.joinUrl, '_blank');
      } catch (err) {
        setError('建立會議失敗，請稍後再試');
      }
    } else if (event.data.type === 'zoom-auth-error') {
      setError('Zoom 授權失敗');
      (event.source as Window)?.close();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleZoomAuth);
    return () => {
      window.removeEventListener('message', handleZoomAuth);
    };
  }, [handleZoomAuth]);

  const startMeeting = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const authWindow = window.open(zoomAuthUrl, 'zoom-auth', 'width=600,height=600');
      if (!authWindow) {
        throw new Error('無法開啟認證視窗');
      }
    } catch (error) {
      setError('無法創建會議，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={startMeeting} disabled={isLoading} className="btn btn-primary">
        {isLoading ? '正在創建會議...' : '立即開會'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
}
