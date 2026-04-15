require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseKey ? 'loaded' : 'missing');

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;