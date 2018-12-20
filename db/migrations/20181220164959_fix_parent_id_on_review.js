exports.up = async function(knex) {
  await knex.schema.alterTable("review", async function(t) {
    await t.dropColumn('parent_id');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("review", function(t) {

  });
};
