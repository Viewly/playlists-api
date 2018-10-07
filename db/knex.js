const config = require('../knexfile.js');

const pg = require('pg');
const PG_DECIMAL_OID = 1700;
// workaround that ensures numeric types are read as numbers, not strings
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat);

module.exports = require('knex')(config);
