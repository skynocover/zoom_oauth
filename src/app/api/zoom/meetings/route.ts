import axios from 'axios';

export async function POST(req: Request) {
  const { zoomAccessToken } = await req.json();
  try {
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: '即時會議',
        type: 1, // 1 表示即時會議
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          waiting_room: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${zoomAccessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return Response.json({
      success: true,
      meeting: {
        joinUrl: response.data.join_url,
        meetingId: response.data.id,
        password: response.data.password,
      },
    });
  } catch (error) {
    console.error('創建會議錯誤:', error);
    return Response.json({ error: '創建會議失敗' }, { status: 500 });
  }
}
