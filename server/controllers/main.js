const router = require('express').Router();
const playlist = require('../domain/playlist/index');
const youtube = require('../domain/youtube/index');
const thumbnails = require('../domain/playlist/thumbnails');
const video = require('../domain/video/index');
const common = require('../domain/common/index');
const reviews = require('../domain/reviews/index');
const hashtags = require('../domain/hashtags/index');
const utils = require('../utils/helpers');
const validators = require('../validators/main');

router.get('/playlists', utils.authOptional, (req, res) => {
  const uuid = req.user ? req.user.id : null;
  req.query.page = parseInt(req.query.page || 0);
  req.query.limit = parseInt(req.query.limit || 50);
  playlist.getPlaylists(req.query, uuid).then(playlists => {
    res.json(playlists);
  }).catch(err => res.json(err))
});

router.get('/playlist/:playlist_id', utils.authOptional, async (req, res) => {
  const uuid = req.user ? req.user.id : null;
  const playlist_id = await playlist.playlistUuidConvert(req.params.playlist_id);
  playlist.getPlaylist(playlist_id, uuid).then(playlist => {
    res.json(playlist);
  }).catch(err => res.json(err))
});

router.post('/playlist', utils.auth, validators.createPlaylist,async (req, res) => {
  const uuid = req.user.id;
  playlist.createPlaylist(uuid, req.body).then(async (id) => {
    res.json(await playlist.getPlaylist(id));
  }).catch(err => res.json(err))
});

router.put('/playlist', utils.auth, validators.updatePlaylist, (req, res) => {
  const uuid = req.user.id;
  playlist.updatePlaylist(uuid, req.body).then(data => {
    res.json(data)
  }).catch(err => res.json(err))
});

router.delete('/playlist/:playlist_id', utils.auth, (req, res) => {
  const uuid = req.user.id;
  playlist.deletePlaylist(uuid, req.params.playlist_id).then(() => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.post('/playlist-reorder/:playlist_id', utils.auth, async (req, res) => {
  const uuid = req.user.id;
  playlist.reorderPlaylist(uuid, req.params.playlist_id, req.body).then(() => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.post('/playlist-import', utils.auth, validators.playlistImport, (req, res) => {
  const uuid = req.user.id;
  const youtubePlaylistId = utils.getParameterByName('list', req.body.yt_url);
  const playlist = req.body;
  playlist.youtube_playlist_id = youtubePlaylistId;
  youtube.importPlaylistFromYoutube(uuid, playlist).then(() => {
    res.json({success: true});
  }).catch(err => res.json(err))

});

router.post('/add-video', utils.auth, validators.addVideo, (req, res) => {
  const uuid = req.user.id;
  video.addVideoToPlaylist(uuid, req.body).then((data) => {
    res.json(data)
  }).catch(err => res.json(err))

});
router.post('/remove-video', utils.auth, validators.removeVideo, (req, res) => {
  const uuid = req.user.id;
  video.deleteVideo(uuid, req.body.playlist_id, req.body.video_id).then(data => {
    res.json(data)
  }).catch(err => res.json(err))
});

router.get('/video-prefill', utils.auth, (req, res) => {
  const uuid = req.user.id;
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
  youtube.getCategories().then(data => {
    res.json(data)
  }).catch(err => res.json(err));
});

router.put('/video', utils.auth, validators.updateVideo, (req, res) => {
  const uuid = req.user.id;
  video.updateVideo(uuid, req.body).then(data => {
    res.json({success: true})
  }).catch(err => res.json(err))
});

//Route used to get signed s3 url
router.post('/upload-file', validators.uploadFile, (req, res) => {
  thumbnails.getSignedUrl(req.body).then(data => {
    res.json({url: data})
  }).catch(err => res.json(err))
});

router.get('/suggestions', (req, res) => {
  common.fetchSuggestions().then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.post('/suggestion', validators.saveSuggestion, (req, res) => {
  common.saveSuggestion(req.body).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.put('/suggestion', validators.updateSuggestion, (req, res) => {
  common.updateSuggestion(req.body).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.get('/searchlog', (req, res) => {
  common.fetchSearchlog().then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});

router.get('/reviews/:playlist_id', (req, res) => {
  reviews.getReviewsForPlaylist(req.params.playlist_id).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});
//router.use(utils.auth);
router.post('/review', [utils.auth, validators.createReview], (req, res) => {
  const uuid = req.user.id;
  reviews.createReview(uuid, req.body).then(data => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.delete('/review/:review_id', utils.auth, (req, res) => {
  const uuid = req.user.id;
  reviews.deleteReview(uuid, req.params.review_id).then(() => {
    res.json({success: true});
  }).catch(err => res.json(err))
});

router.get('/hashtags', (req, res) => {
  hashtags.getHashtags(req.query.limit).then(data => {
    res.json(data);
  }).catch(err => res.json(err))
});
module.exports = router;
