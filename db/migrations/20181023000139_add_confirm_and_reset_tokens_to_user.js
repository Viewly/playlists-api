exports.up = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.boolean('email_confirmed');
    t.uuid('email_confirm_token');
    t.uuid('password_reset_token');
    t.datetime('password_reset_token_expiry');
  });
};

exports.down = async function(knex) {
  await knex.schema.alterTable("user", function(t) {
    t.dropColumn('email_confirmed');
    t.dropColumn('email_confirm_token');
    t.dropColumn('password_reset_token');
    t.dropColumn('password_reset_token_expiry');
  });
};
