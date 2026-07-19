/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define the player progress type
export interface PlayerProgress {
  id: string; // client-generated UUID
  nickname: string;
  completed_levels: number[];
  updated_at: string;
}

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: SupabaseClient | null = null;

// Initialize Supabase lazily and only if keys are present
export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
    }
  }
  return supabaseInstance;
}

// Generate a random cute kitten nickname in Spanish
export function generateCuteNickname(): string {
  const adjectives = [
    'Aventurero',
    'Dormilón',
    'Divertido',
    'Curioso',
    'Silencioso',
    'Travieso',
    'Gachón',
    'Ronroneador',
    'Cazador',
    'Mimado',
    'Saltarín',
    'Esponjoso',
    'Chiquito',
    'Veloz',
    'Rallado',
  ];
  const nouns = [
    'Michi',
    'Gatito',
    'Gato',
    'Minino',
    'Bigotes',
    'Siamés',
    'Pelusa',
    'Bola de Pelo',
    'Gatito de Caja',
    'Ronrón',
  ];

  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNumber = Math.floor(100 + Math.random() * 900);

  return `${randomNoun} ${randomAdj} #${randomNumber}`;
}

// Get or create unique player credentials locally
export function getOrCreatePlayerLocal(): { id: string; nickname: string } {
  let playerId = localStorage.getItem('gatitos_player_id');
  let nickname = localStorage.getItem('gatitos_player_nickname');

  if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem('gatitos_player_id', playerId);
  }

  if (!nickname) {
    nickname = generateCuteNickname();
    localStorage.setItem('gatitos_player_nickname', nickname);
  }

  return { id: playerId, nickname };
}

// Set custom player nickname
export function updatePlayerNicknameLocal(nickname: string) {
  localStorage.setItem('gatitos_player_nickname', nickname);
}

// Synchronize completed levels with Supabase
export async function syncProgressWithSupabase(
  completedLevels: number[]
): Promise<PlayerProgress | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { id, nickname } = getOrCreatePlayerLocal();

  try {
    // Upsert the player progress
    const { data, error } = await supabase
      .from('gatitos_progress')
      .upsert(
        {
          id,
          nickname,
          completed_levels: completedLevels,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error syncing progress with Supabase:', error);
      return null;
    }

    return data as PlayerProgress;
  } catch (error) {
    console.error('Unexpected error during Supabase sync:', error);
    return null;
  }
}

// Load player progress from Supabase
export async function loadProgressFromSupabase(): Promise<PlayerProgress | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { id } = getOrCreatePlayerLocal();

  try {
    const { data, error } = await supabase
      .from('gatitos_progress')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error loading progress from Supabase:', error);
      return null;
    }

    return data as PlayerProgress;
  } catch (error) {
    console.error('Unexpected error loading from Supabase:', error);
    return null;
  }
}

// Fetch global leaderboard to show how other cats are doing
export interface LeaderboardEntry {
  nickname: string;
  completed_count: number;
  updated_at: string;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    // In Supabase, we can retrieve all player records
    // and sort them by the number of completed levels or general progress
    const { data, error } = await supabase
      .from('gatitos_progress')
      .select('nickname, completed_levels, updated_at')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    // Map to friendly format and sort by number of completed levels descending
    return (data || [])
      .map((row: any) => ({
        nickname: row.nickname || 'Michi Anónimo',
        completed_count: Array.isArray(row.completed_levels)
          ? row.completed_levels.length
          : 0,
        updated_at: row.updated_at,
      }))
      .sort((a, b) => b.completed_count - a.completed_count || new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  } catch (error) {
    console.error('Unexpected error fetching leaderboard:', error);
    return [];
  }
}
