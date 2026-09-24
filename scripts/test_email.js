const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://smjcwssdxoasikwjbyig.supabase.co';
const SUPABASE_KEY = 'sb_publishable_GhBc_Nv0FX4TNbXn1soNaQ_dvb2cl5D';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testEmails() {
  const emails = [
    'admin@jvican.com',
    'admin.jvican@gmail.com',
    'chiefadmin@jvican.org',
    'admin@voteflow.live'
  ];

  for (const email of emails) {
    console.log(`Testing signup for ${email}...`);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: 'admin@password123',
    });
    if (error) {
      console.log(`❌ Failed for ${email}:`, error.message);
    } else {
      console.log(`✅ Success for ${email}! User ID:`, data.user?.id);
    }
  }
}

testEmails();
