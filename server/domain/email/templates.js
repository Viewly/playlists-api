function confirmEmail(user) {
  return prepareEmail(
    'VIDFLOW-CONFIRM',
    'Vidflow email confirmation!',
    user.email,
    { fname: user.fname, confirm: `${process.env.CURRENT_ENDPOINT}/confirm-email/${user.email_confirm_token}` },
  );
}

function resetPasswordEmail(user) {
  return prepareEmail(
    'VIDFLOW-RESET-PASSWORD',
    'Vidflow reset password',
    user.email,
    { reset: `${process.env.CURRENT_ENDPOINT}/reset-password/${user.password_reset_token}` },
  );
}

function welcomeEmail(user) {
  return prepareEmail(
    'VIDFLOW-WELCOME',
    'Welcome to Vidflow!',
    user.email,
    { fname: user.first_name || user.alias, lname: user.last_name || ' ' },
  );
};

function commentActivityEmail(to_email, comment_sender, playlist, comment_id) {
  return prepareEmail(
    'VIDFLOW-USER-COMMENTED',
    `${comment_sender.first_name || comment_sender.alias} commented on the playlist ${playlist.title}`,
    to_email,
    { comment_sender_name: comment_sender.first_name || comment_sender.alias,  playlist_name: playlist.title, comment_url: `${process.env.CURRENT_ENDPOINT}/playlist/${playlist.url || playlist.id}/comments?id=${comment_id}`},
  );
}

function prepareEmail(template, subject, to, vars) {
  const globalVars = {
    list_company: 'Vidflow Entertainment Inc.',
  };
  const message = {
    subject: subject,
    from_email: 'info@vidflow.com',
    from_name: 'Vidflow',
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
      website: 'https://vidflow.com'
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
  welcomeEmail,
  commentActivityEmail
};
