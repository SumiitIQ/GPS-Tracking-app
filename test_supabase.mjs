import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pexkoxqazawomgvhjure.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleGtveHFhemF3b21ndmhqdXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMDA0MjAsImV4cCI6MjEwMTc3NjQyMH0.BTQQUz70AnRwpIM4SI-zpiw-LcZG9ZFTAcL8QE9h2vQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTest() {
  console.log("1. Signing up a test user...");
  const email = `testuser_${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });

  if (authError) {
    console.error("Auth Error:", authError);
    return;
  }
  const user = authData.user;
  console.log("User created:", user.id);

  console.log("2. Waiting for profile trigger to run...");
  await new Promise(r => setTimeout(r, 2000));

  console.log("3. Testing Storage Upload...");
  const dummyGpx = `<?xml version="1.0" encoding="UTF-8"?><gpx></gpx>`;
  const fileName = `test_track_${Date.now()}.gpx`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('gpx-routes')
    .upload(`${user.id}/${fileName}`, dummyGpx, {
      contentType: 'application/gpx+xml',
      upsert: true
    });
    
  if (uploadError) {
    console.error("Upload failed! Reason:", uploadError);
  } else {
    console.log("Upload successful:", uploadData);
  }

  console.log("4. Testing Database Insert into routes...");
  const { data: insertData, error: insertError } = await supabase.from('routes').insert({
    title: 'Test Expedition',
    gpx_url: `https://fake.url/${fileName}`,
    distance: 100,
    elevation_gain: 0,
    submitter_id: user.id
  });

  if (insertError) {
    console.error("Database Insert failed! Reason:", insertError);
  } else {
    console.log("Database Insert successful!");
  }
}

runTest();
