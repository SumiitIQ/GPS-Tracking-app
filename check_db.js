const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Extract supabase URL and KEY from lib/supabase.ts
const code = fs.readFileSync('src/constants/supabase.ts', 'utf8');
const urlMatch = code.match(/SUPABASE_URL\s*=\s*'([^']+)'/);
const keyMatch = code.match(/SUPABASE_ANON_KEY\s*=\s*'([^']+)'/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('routes').select('*').limit(1).then(({data, error}) => {
    if (error) console.error(error);
    else console.log(data);
  });
}
