const users = require('./users');
const helpers = require('../../server/utils/helpers');
exports.up = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.string('alias');
  });
  await Promise.all(users.map(x => Promise.all([
    knex.from('video').update({user_id: x.id}).where('user_id', x.alias),
    knex.from('playlist').update({user_id: x.id}).where('user_id', x.alias),
    knex.into('user').insert({alias: x.alias, id: x.id, email: x.email || 'denko+' + helpers.generateUuid().split('-')[0] + '@view.ly'})])//.where('id', x.alias)])
  ));

  await knex.schema.alterTable("video", function(t) {
    t.uuid('user_id').notNullable().alter();
  });
  await knex.schema.alterTable("playlist", function(t) {
    t.uuid('user_id').notNullable().alter();
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.dropColumn('alias');
  });
  await knex.schema.alterTable("video", function(t) {
    t.string('user_id').alter();
  });
  await knex.schema.alterTable("playlist", function(t) {
    t.string('user_id').alter();
  });
};
