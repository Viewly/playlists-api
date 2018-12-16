const { validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');
const { check, body } = require('express-validator/check');
const { validateErrors, matchData } = require('./index');

const createPlaylist = [
  //Mandatory below
  check('title').trim().isLength({ min: 4 }).isString().withMessage('Title is mandatory and must be at least 4 characters.'),
  check('category.id').isInt().withMessage('Category is required. Ex (3)'),
  //Optional below
  check(['url', 'hashtags']).trim().optional().isLength({ min: 4 }).isString(),
  check('description').trim().optional().isLength({ min: 10 }).withMessage('Description must be at least 10 characters.'),
  check('status').optional().isString(),
  check('classification').optional().isString(),
  check('playlist_thumbnail_url').isString().withMessage('Must be a valid url').optional({nullable: true}),
  check('youtube_playlist_id').isString().optional({nullable: true}),
  check('publish_date').optional()
];

const updatePlaylist = [
  check('id').isUUID().withMessage('id is required.'),
  ...createPlaylist
];

const reorderPlaylist = [
  body().isArray()
];

const playlistImport = [
  ...createPlaylist,
  check('yt_url').isURL().withMessage('Youtube playlist url not valid')
];

const addVideo = [
  check('video_id').isString(),
  check('playlist_id').isUUID().withMessage('playlist_id is required.'),
  check('title').isString().trim().isLength({ min: 8 }).withMessage('Title must be contain at least 8 characters.'),
  check('description').isString().trim().optional({ nullable: true }),
  check('thumbnail_url').isURL().trim().optional()
];

const removeVideo = [
  check('playlist_id').isUUID().withMessage('playlist_id (uuid) is required.'),
  check('video_id').isInt().withMessage('video_id (int) is required.'),
];

const updateVideo = [
  check('id').isInt().withMessage('id is required.'),
  check('title').isString().trim().optional().isLength({ min: 4 }).withMessage('Title must be at least 4 characters.'),
  check('description').isString().trim().optional({ nullable: true }).isLength({ min: 20 }).withMessage('Description must be at least 20 characters.'),
];

const uploadFile = [
  check('key').isString().trim().withMessage('key is a required attribute.'),
  check('type').isString().trim().withMessage('type is a required attribute.'),
];

const saveSuggestion = [
  check('type').isString().trim().withMessage('key is a required attribute.').optional(),
  check('title').isString().trim().withMessage('key is a required attribute.').optional(),
  check('description').trim().isString().withMessage('key is a required attribute.').optional(),
  check('url').trim().isURL().withMessage('key is a required attribute.').optional(),
  check('email').isEmail().trim().withMessage('key is a required attribute.').optional(),
  check('playlist_id').isUUID().optional(),
  check('category').optional()
];

const updateSuggestion = [
  check('id').isUUID(),
  ...saveSuggestion
];

const createReview = [
  check('playlist_id').isUUID().withMessage('playlist_id is a required attribute.').optional(),
  check(['title', 'description']).isString().isLength({ min: 5 }),
  check('rating').isInt()
];

const validators = { createPlaylist, updatePlaylist, reorderPlaylist, playlistImport, addVideo, removeVideo, updateVideo, uploadFile, saveSuggestion, updateSuggestion, createReview };
Object.keys(validators).forEach(key => { validators[key].push(validateErrors, matchData) });
module.exports = validators;

