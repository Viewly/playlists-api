exports.up = async function(knex) {
  await knex.schema.createTable("onboarding", function(t) {
    t.increments();
    t.uuid('user_id');
    t.json('categories_ids').defaultTo(JSON.stringify([]));
    t.integer('time_to_spend');
    t.integer('step').defaultTo(0);
    t.timestamps(true, true);
  });
};

exports.down = async function(knex) {
  await knex.schema.dropTable("onboarding");
};
