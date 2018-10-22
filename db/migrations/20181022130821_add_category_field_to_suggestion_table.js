exports.up = async function(knex) {
  await knex.schema.alterTable("suggestion", function(t) {
    t.string('category');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("suggestion", function(t) {
    t.dropColumn('category');
  });
};
