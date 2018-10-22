function confirmEmail(user) {
  return prepareEmail(
    'VIDFLOW-CONFIRM',
    'Vidflow email confirmation!',
    user.email,
    { fname: user.first_name, lname: user.last_name },
  );
}

function resetPasswordEmail(user) {
  return prepareEmail(
    'VIDFLOW-RESET-PASSWORD',
    'Vidflow reset password',
    user.email,
    { fname: user.first_name, lname: user.last_name },
  );
}

function welcomeEmail(user) {
  return prepareEmail(
    'VIDFLOW-WELCOME',
    'Welcome to Vidflow!',
    user.email,
    { fname: user.first_name, lname: user.last_name },
  );
};

function prepareEmail(template, subject, to, vars) {
  const globalVars = {
    list_company: 'Viewly Inc.',
  };
  const message = {
    subject: subject,
    from_email: 'info@view.ly',
    from_name: 'Viewly',
    to: [{
      email: to,
      type: 'to'
    }],
    auto_html: true,
    auto_text: true,
    important: false,
    track_opens: true,
    track_clicks: true,
    merge: true,
    merge_language: 'mailchimp',
    global_merge_vars: prepareVars(globalVars),
    merge_vars: [{
      rcpt: to,
      vars: prepareVars(vars)
    }],
    tags: [
      template
    ],
    metadata: {
      website: 'https://vidflow.io'
    },
    send_at: new Date(),
  };

  return { template_name: template, template_content: {}, message: message }
}

function prepareVars(vars) {
  return Object.keys(vars).map(key => ({
    'name': key,
    'content': vars[key]
  }));
}


module.exports = {
  confirmEmail,
  resetPasswordEmail,
  welcomeEmail
};
