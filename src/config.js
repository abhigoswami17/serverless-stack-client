const config = {
  s3: {
    REGION: 'us-east-2',
    BUCKET: 'notes-img',
  },
  apiGateway: {
    REGION: 'us-east-2',
    URL: 'https://kxoe6fdab2.execute-api.us-east-2.amazonaws.com/prod',
  },
  cognito: {
    REGION: 'us-east-2',
    USER_POOL_ID: 'us-east-2_3lzbkwkcf',
    APP_CLIENT_ID: '7an98uq87875v34t7elubf3scj',
    IDENTITY_POOL_ID: 'us-east-2:d02a8dcf-fd20-43e4-8e9f-0d56604c642b',
  },
};

export default config;
