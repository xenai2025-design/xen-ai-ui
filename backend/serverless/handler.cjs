// CommonJS serverless handler (.cjs)
const serverlessHttp = require('serverless-http');

// Lazy loading to avoid top-level await issues
let app = null;

async function createApp() {
  if (app) return app;
  
  try {
    // Dynamically import the ES module app from this directory
    const { createApp: createExpressApp } = await import('./app.js');
    app = await createExpressApp();
    return app;
  } catch (error) {
    console.error('Failed to create app:', error);
    throw error;
  }
}

// Export the handler function
module.exports.handler = async (event, context) => {
  try {
    // Create the app if not already done
    if (!app) {
      app = await createApp();
    }
    
    // Create serverless handler
    const serverlessHandler = serverlessHttp(app);
    
    // Handle the request
    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    };
  }
};
