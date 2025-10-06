// server.js
const express = require('express');
const cors = require('cors');
const { Tiktok } = require('@tobyg74/tiktok-api-dl');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint untuk download TikTok
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL TikTok tidak boleh kosong!'
      });
    }

    // Validasi URL TikTok
    if (!url.includes('tiktok.com')) {
      return res.status(400).json({
        success: false,
        message: 'URL tidak valid! Pastikan URL dari TikTok.'
      });
    }

    console.log('Fetching TikTok data for:', url);

    // Download menggunakan API
    const result = await Tiktok.Downloader(url, {
      version: "v3" // bisa pakai v1, v2, atau v3
    });

    if (result.status === 'success') {
      const data = {
        success: true,
        data: {
          title: result.result.desc || 'No title',
          author: result.result.author?.nickname || 'Unknown',
          username: result.result.author?.unique_id || 'Unknown',
          likes: result.result.statistics?.likeCount || 0,
          comments: result.result.statistics?.commentCount || 0,
          shares: result.result.statistics?.shareCount || 0,
          views: result.result.statistics?.playCount || 0,
          duration: result.result.duration || 0,
          music: result.result.music || 'No music info',
          video: {
            noWatermark: result.result.video || result.result.video1 || null,
            watermark: result.result.videoSD || result.result.video2 || null,
            hd: result.result.videoHD || null
          },
          images: result.result.images || [],
          cover: result.result.cover || null
        }
      };

      res.json(data);
    } else {
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data TikTok. Coba lagi!'
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan: ' + error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TikTok Downloader API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📥 TikTok Downloader API ready!`);
});
