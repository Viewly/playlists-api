exports.up = async function(knex) {
  await knex.schema.createTable("user", function(t) {
    t.uuid('id').primary();
    t.string('email');
    t.string('full_name');
    t.string('password_hash');
    t.string('avatar_url');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("user");
};
