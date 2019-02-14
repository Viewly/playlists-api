exports.up = async function(knex) {
  await knex.schema.alterTable("purchases", function(t) {
    t.string('purchase_id');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("purchases", function(t) {
    t.dropColumn('purchase_id');
  });
};
