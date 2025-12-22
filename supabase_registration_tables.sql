-- 在 Supabase SQL Editor 中執行此腳本來建立報名相關資料表

-- 隊伍對戰報名表
CREATE TABLE IF NOT EXISTS match_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES team_matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_name VARCHAR(100),        -- 報名隊伍名稱
  contact_info VARCHAR(255),     -- 聯絡方式
  message TEXT,                  -- 備註訊息
  status VARCHAR(20) DEFAULT 'pending',  -- pending/accepted/rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 確保同一用戶不能重複報名同一對戰
  UNIQUE(match_id, user_id)
);

-- 找隊員報名表
CREATE TABLE IF NOT EXISTS recruitment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recruitment_id UUID REFERENCES player_recruitments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_info VARCHAR(255),     -- 聯絡方式
  message TEXT,                  -- 備註訊息
  status VARCHAR(20) DEFAULT 'pending',  -- pending/accepted/rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 確保同一用戶不能重複報名同一招募
  UNIQUE(recruitment_id, user_id)
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_match_registrations_match_id ON match_registrations(match_id);
CREATE INDEX IF NOT EXISTS idx_match_registrations_user_id ON match_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_applications_recruitment_id ON recruitment_applications(recruitment_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_applications_user_id ON recruitment_applications(user_id);

-- 設定 Row Level Security (RLS)
ALTER TABLE match_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruitment_applications ENABLE ROW LEVEL SECURITY;

-- 允許所有已驗證用戶讀取報名資料（可根據需求調整）
CREATE POLICY "Allow authenticated users to read match_registrations" ON match_registrations
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert match_registrations" ON match_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own registrations" ON match_registrations
  FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated users to read recruitment_applications" ON recruitment_applications
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert recruitment_applications" ON recruitment_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own applications" ON recruitment_applications
  FOR UPDATE USING (true);

