exports.up = async function(knex) {
  await knex.schema.createTable("searchlog", function(t) {
    t.increments();
    t.string('identifier');
    t.string('email');
    t.string('keyword');
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("searchlog");
};
