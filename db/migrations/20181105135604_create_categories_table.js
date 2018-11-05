exports.up = async function(knex) {
  await knex.schema.createTable("category", function(t) {
    t.increments();
    t.string('name');
    t.string('slug');
  });

  const categories = require('../data/categories');
  await knex.batchInsert('category', categories, categories.length)

};

exports.down = async function(knex) {
  await knex.schema.dropTable("category");
};
