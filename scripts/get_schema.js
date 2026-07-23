const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getSchema() {
  // Query information_schema.tables
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name, table_type, table_schema')
    .eq('table_schema', 'public')
    .order('table_name');

  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    return;
  }

  console.log('=== PUBLIC TABLES ===');
  for (const table of tables) {
    console.log(`Table: ${table.table_name}`);
    
    // Get columns for each table
    const { data: columns, error: colsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', table.table_name)
      .order('ordinal_position');
    
    if (columns) {
      for (const col of columns) {
        console.log(`  ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable}, default: ${col.column_default || 'none'})`);
      }
    }
  }

  // Get functions
  const { data: funcs, error: funcsError } = await supabase
    .from('information_schema.routines')
    .select('routine_name, routine_type, data_type')
    .eq('routine_schema', 'public')
    .order('routine_name');
  
  console.log('\n=== FUNCTIONS ===');
  if (funcs) {
    for (const f of funcs) {
      console.log(`${f.routine_type}: ${f.routine_name} (returns: ${f.data_type})`);
    }
  }

  // Get triggers
  const { data: triggers, error: trigError } = await supabase
    .from('information_schema.triggers')
    .select('trigger_name, event_manipulation, event_object_table, action_timing')
    .eq('event_object_schema', 'public')
    .order('trigger_name');
  
  console.log('\n=== TRIGGERS ===');
  if (triggers) {
    for (const t of triggers) {
      console.log(`${t.trigger_name} on ${t.event_object_table} (${t.action_timing} ${t.event_manipulation})`);
    }
  }

  // Get views
  const { data: views, error: viewsError } = await supabase
    .from('information_schema.views')
    .select('table_name, view_definition')
    .eq('table_schema', 'public');
  
  console.log('\n=== VIEWS ===');
  if (views) {
    for (const v of views) {
      console.log(`View: ${v.table_name}`);
      console.log(`  Definition: ${v.view_definition}`);
    }
  }
}

getSchema().catch(console.error);