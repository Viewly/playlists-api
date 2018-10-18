const db = require('../../../db/knex');

function saveSuggestion(suggestion) {
  return db.insert({
    type: suggestion.type,
    title: suggestion.title,
    description: suggestion.description,
    url: suggestion.url,
    email: suggestion.email,
    playlist_id: suggestion.playlist_id
  }).into('suggestion');
}

function fetchSuggestions() {
  return db.select('*').from('suggestion');
}

function updateSuggestion(suggestion) {
  return db.update('status', suggestion.status).from('suggestion').where('id', suggestion.id)
}

module.exports = { saveSuggestion, fetchSuggestions, updateSuggestion };
