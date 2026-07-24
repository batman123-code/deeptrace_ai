require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { initializeApp } = require('firebase/app');

async function testServices() {
  console.log('Testing Supabase Configuration...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase keys missing in .env.local');
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Just check if we can reach the health or basic auth endpoint
      const { data, error } = await supabase.auth.getSession();
      if (error) {
         console.error('❌ Supabase Auth Error:', error.message);
      } else {
         console.log('✅ Supabase connected successfully.');
      }
    } catch(err) {
      console.error('❌ Supabase connection failed:', err.message);
    }
  }

  console.log('\nTesting Firebase Configuration...');
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  if (!firebaseConfig.apiKey) {
    console.error('❌ Firebase keys missing in .env.local');
  } else {
    try {
      const app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully with project:', app.options.projectId);
    } catch(err) {
      console.error('❌ Firebase initialization failed:', err.message);
    }
  }
}

testServices();
