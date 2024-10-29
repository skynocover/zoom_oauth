import axios from 'axios';
import { zoomConfig } from '@/utils/zoom';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    // 返回一個 HTML 頁面，其中包含向父窗口發送錯誤訊息的腳本
    return new Response(
      `
      <html>
        <script>
          window.opener.postMessage({ type: 'zoom-auth-error' }, '${process.env.NEXT_PUBLIC_APP_URL}');
        </script>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      },
    );
  }

  try {
    const { data } = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: zoomConfig.clientId,
        client_secret: zoomConfig.clientSecret,
        redirect_uri: zoomConfig.redirectUri,
      },
    });

    // 返回一個 HTML 頁面，其中包含向父窗口發送成功訊息的腳本
    return new Response(
      `
      <html>
        <script>
          window.opener.postMessage({ 
            type: 'zoom-auth-success',
            data: ${JSON.stringify(data)}
          }, '${process.env.NEXT_PUBLIC_APP_URL}');
        </script>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      },
    );
  } catch (error) {
    // 返回一個 HTML 頁面，其中包含向父窗口發送錯誤訊息的腳本
    return new Response(
      `
      <html>
        <script>
          window.opener.postMessage({ type: 'zoom-auth-error' }, '${process.env.NEXT_PUBLIC_APP_URL}');
        </script>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      },
    );
  }
}
