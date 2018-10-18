const router = require('express').Router();
const playlist = require('../domain/playlist/index');
const youtube = require('../domain/youtube/index');
const thumbnails = require('../domain/playlist/thumbnails');
const video = require('../domain/video/index');
const common = require('../domain/common/index');
const utils = require('../utils/helpers');
const jwt = require('jsonwebtoken');
const jwtPassword = process.env.JWT_PASSWORD;

router.get('/playlists', (req, res) => {
  playlist.getPlaylists(req.query, req.headers).then(playlists => {
    res.json(playlists);
  }).catch(err => res.json(err))
});

router.get('/playlist/:playlist_id', (req, res) => {
  playlist.getPlaylist(req.params.playlist_id).then(playlist => {
    res.json(playlist);
  }).catch(err => res.json(err))
});

router.post('/playlist', async (req, res) => {
  const uuid = req.user_id || 'Viewly';
  playlist.createPlaylist(uuid, req.body).then(id => {
    res.json({id});
  }).catch(err => res.json(err))
});

router.put('/playlist', (req, res) => {
  const uuid = req.user_id || 'Viewly';
  playlist.updatePlaylist(uuid, req.body).then(data => {
    res.json({success: true})
  }).catch(err => res.json(err))
});

router.delete('/playlist/:playlist_id', (req, res) => {
  const uuid = req.user_id || 'Viewly';
  playlist.deletePlaylist(uuid, req.params.playlist_id).then(() => {
    res.json({success: true});
  }).catch(err => res.json(err))
});
router.post('/playlist-reorder/:playlist_id', async (req, res) => {
  const uuid = req.user_id || 'Viewly';
  playlist.reorderPlaylist(uuid, req.params.playlist_id, req.body).then(() => {
    res.json({success: true});
  }).catch(err => res.json(err))
});
router.post('/add-video', (req, res) => {
  const uuid = req.user_id || 'Viewly';
  if (!req.body.playlist_id) res.json({success: false, reason: "playlist_id is mandatory"});
  else {
    video.addVideoToPlaylist(uuid, req.body).then((data) => {
      res.json(data)
    }).catch(err => res.json(err))
  }
});
router.post('/remove-video', (req, res) => {
  const uuid = req.user_id || 'Viewly';
  video.deleteVideo(uuid, req.body.playlist_id, req.body.video_id).then(data => {
    res.json({success: true})
  }).catch(err => res.json(err))
});

router.get('/video-prefill', (req, res) => {
  const uuid = req.user_id || 'Viewly';
  const url = utils.getParameterByName('v', req.query.url);
  if (!url) res.json({success: false, reason: 'URL is a mandatory query param'});
  else {
    youtube.getVideoMetadata(url).then(data => {
      video.createOrUpdateSourceVideo(uuid, data);
      res.json(data)
    }).catch(err => res.json(err))
  }
});

router.get('/categories', (req, res) => {
  res.json(youtube.getCategories());
});

router.put('/video', (req, res) => {
  const uuid = req.user_id || 'Viewly';
  video.updateVideo(uuid, req.body).then(data => {
    res.json({success: true})
  }).catch(err => res.json(err))
});

//Route used to get signed s3 url
router.post('/upload-file', (req, res) => {
  thumbnails.getSignedUrl(req.body).then(data => {
    res.json(data)
  }).catch(err => res.json(err))
});

router.get('/suggestions', (req, res) => {
  common.fetchSuggestions().then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.post('/suggestion', (req, res) => {
  common.saveSuggestion(req.body).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.put('/suggestion', (req, res) => {
  common.updateSuggestion(req.body).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.use((req, res, next) => {
  jwt.verify(req.headers['authorization'], jwtPassword, (err, decoded) => {
    if (err) res.json({error: 'Unauthorized'});
    else {
      req.user = decoded;
      next();
    }
  });
});


module.exports = router;
