exports.up = async function(knex) {
  await knex.schema.createTable("suggestion", function(t) {
    t.increments();
    t.string('type');
    t.string('email');
    t.string('description');
    t.string('title');
    t.uuid('playlist_id');
    t.string('url');
    t.string('status');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("suggestion");
};
