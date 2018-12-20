exports.up = async function(knex) {
  await knex.schema.alterTable("review", function(t) {
    t.string('status');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("review", function(t) {
    t.dropColumn('status');
  });
};
