// Jest global test setup
// Set test environment variables
process.env['NODE_ENV'] = 'test';
process.env['MONGODB_URI'] = 'mongodb://localhost:27017/kujuana_test';
process.env['JWT_ACCESS_SECRET'] = 'a'.repeat(64);
process.env['JWT_REFRESH_SECRET'] = 'b'.repeat(64);
process.env['ENCRYPTION_KEY'] = 'c'.repeat(64);
process.env['UPSTASH_REDIS_REST_URL'] = 'https://test.upstash.io';
process.env['UPSTASH_REDIS_REST_TOKEN'] = 'test-token';
process.env['REDIS_URL'] = 'redis://localhost:6379';
process.env['CLOUDINARY_CLOUD_NAME'] = 'test';
process.env['CLOUDINARY_API_KEY'] = 'test';
process.env['CLOUDINARY_API_SECRET'] = 'test';
process.env['PESAPAL_CONSUMER_KEY'] = 'test';
process.env['PESAPAL_CONSUMER_SECRET'] = 'test';
process.env['PESAPAL_IPN_URL'] = 'https://test.kujuana.com/webhook';
process.env['FLUTTERWAVE_PUBLIC_KEY'] = 'test';
process.env['FLUTTERWAVE_SECRET_KEY'] = 'test';
process.env['FLUTTERWAVE_WEBHOOK_SECRET'] = 'test';
process.env['RESEND_API_KEY'] = 're_test';
