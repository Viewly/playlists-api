exports.up = async function(knex) {
  await knex.schema.alterTable("notification", async function(t) {
    await t.dropTimestamps();
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("notification", function(t) {

  });
};
