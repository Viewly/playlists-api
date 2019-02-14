exports.up = async function(knex) {
  await knex.schema.createTable("purchases", function(t) {
    t.increments();
    t.uuid('user_id');
    t.uuid('playlist_id');
    t.decimal('amount_paid');
    t.integer('status');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("purchases");
};
