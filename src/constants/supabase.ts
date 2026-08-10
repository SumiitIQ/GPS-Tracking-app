// ============================================================
// SUPABASE CONFIGURATION
// Replace the values below with your own Supabase project keys.
// Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
// ============================================================

export const SUPABASE_URL = 'https://pexkoxqazawomgvhjure.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleGtveHFhemF3b21ndmhqdXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMDA0MjAsImV4cCI6MjEwMTc3NjQyMH0.BTQQUz70AnRwpIM4SI-zpiw-LcZG9ZFTAcL8QE9h2vQ';

// ============================================================
// ARCGIS CONFIGURATION (from web project)
// ============================================================
export const ARCGIS_API_KEY = 'AAPTael6V4-OJo4wTdNt0bUXyDw..nQJaIFjX5sHGvZi6XnIt3KEM_k_BX7Oo6ibU-wQ2DapV_APmCLI9sMq4fzCwNlkOj2hQOWzXTSqb2ramvYjTZ4UbS7piX7SNfsezVhJypSseOQUllHToTJqrdgSnUx4Bs9bj4C3CBobLjXLvNPcl4M1EL7eU-OUqHQ9jDE4FE_fkgZpFtvR7YPPUhiGgM3SK2bqVkEAz0-zHzxZ8DRKxs_EwkCZOXx4GN99F6fGQU_Q7kiHan-wO3U3tcg..AT1_cDI0saH1';

// ArcGIS Satellite Tile URL (Esri World Imagery)
// This works 100% offline after tiles are cached by the WebView
export const ARCGIS_TILE_URL = `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=${ARCGIS_API_KEY}`;
