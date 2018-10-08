const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.AMAZON_S3_ACCESSKEY,
  secretAccessKey: process.env.AMAZON_S3_SECRET,
  region: process.env.AMAZON_S3_REGION,
});
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});

function getSignedUrl(data) {
  return new Promise((resolve, reject) => {
    const params = { Bucket: process.env.AMAZON_S3_BUCKET, Key: `upload/${data.key}`, ContentType: data.type };
    s3.getSignedUrl('putObject', params, (err, url) => {
      err ? reject(err) : resolve(url);
    });
  });
}
module.exports = { getSignedUrl };
