Mailchimp = require('mailchimp-api-v3');
const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);
const list_id = process.env.MAILCHIMP_LIST_ID;
var md5 = require('md5');

async function createUser(user){
  return mailchimp.post(`/lists/${list_id}/members`, {
    email_address: user.email,
    merge_fields: {
      FNAME: user.first_name,
      LNAME: user.last_name,
      VIDFLOWID: user.id
    },

    //ip_signup: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    status: 'subscribed'
  })
  .then((results) => {
    return {success: true, results};
  })
  .catch((err) => {
    return {success: false, err};
  })
}

async function updateUser(user) {
  console.log(md5(user.email))
  return mailchimp.patch(`/lists/${list_id}/members/${md5(user.email)}`, {
    merge_fields: {
      FNAME: user.first_name,
      LNAME: user.last_name,
      CATEGORIES: user.categories.join(','),
      CATEGIDS: user.categories_ids.join(',')
    },
    status: 'subscribed'
  })
  .then((results) => {
    return {success: true, results};
  })
  .catch((err) => {
    return {success: false, err};
  })

}

module.exports = { createUser, updateUser };
