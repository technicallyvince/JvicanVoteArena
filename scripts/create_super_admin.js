const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://smjcwssdxoasikwjbyig.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GhBc_Nv0FX4TNbXn1soNaQ_dvb2cl5D';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createSuperAdmin() {
  const email = 'admin@jvican.com';
  const password = 'admin@password123';
  const fullName = 'Chief Super Admin';

  console.log(`Attempting to create Super Admin account: ${email}...`);

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'admin',
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error.message);
      // If user already exists, let's try signing in to test credentials
      console.log('Testing sign in with existing credentials...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in test failed:', signInError.message);
      } else {
        console.log('Successfully authenticated as Super Admin!', signInData.user.email);
      }
      return;
    }

    console.log('SUCCESS! Super Admin account created:');
    console.log('User ID:', data.user?.id);
    console.log('Email:', data.user?.email);
    console.log('Session created:', !!data.session);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createSuperAdmin();
