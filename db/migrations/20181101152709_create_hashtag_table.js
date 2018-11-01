exports.up = async function(knex) {
  await knex.schema.createTable("hashtag", function(t) {
    t.increments();
    t.string('hashtag');
    t.integer('search_count').defaultTo(0);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("hashtag");
};
