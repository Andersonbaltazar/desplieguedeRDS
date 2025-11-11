require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const REGION = process.env.AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET;

if (!BUCKET) {
  console.warn('S3_BUCKET no configurado. Define S3_BUCKET en .env');
}

const client = new S3Client({ region: REGION });

async function uploadFile(buffer, key, contentType) {
  if (!BUCKET) throw new Error('S3_BUCKET no configurado');
  const params = {
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read'
  };

  const cmd = new PutObjectCommand(params);
  await client.send(cmd);

  // URL pública estándar
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(key)}`;
}

module.exports = { uploadFile };
