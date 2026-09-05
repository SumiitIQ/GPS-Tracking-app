const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const code = fs.readFileSync('src/constants/supabase.ts', 'utf8');
const urlMatch = code.match(/SUPABASE_URL\s*=\s*'([^']+)'/);
const keyMatch = code.match(/SUPABASE_ANON_KEY\s*=\s*'([^']+)'/);

if (urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('routes').select('id, title, description').then(({data, error}) => {
    console.log(data);
  });
}
