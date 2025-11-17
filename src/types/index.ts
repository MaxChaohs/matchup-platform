export interface User {
  _id: string;
  id?: string; // 兼容字段
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 隊伍對戰（完整隊伍為單位，一對一）
export interface TeamMatch {
  _id: string;
  id?: string; // 兼容字段
  title: string;
  category: MatchCategory;
  region: Region;
  dayOfWeek: DayOfWeek;
  time: string;
  location: string;
  description?: string;
  creatorId: string | { _id: string; username: string; email: string };
  creatorName: string;
  createdAt: string;
  updatedAt?: string;
  teamSize: number; // 隊伍人數
  maxTeams?: number; // 最多隊伍數（一對一預設為2）
  currentTeams: number; // 已報名隊伍數
  teamName?: string; // 建立者的隊伍名稱
}

// 尋找隊員
export interface PlayerRecruitment {
  _id: string;
  id?: string; // 兼容字段
  title: string;
  category: MatchCategory;
  region: Region;
  dayOfWeek: DayOfWeek;
  time: string;
  location: string;
  description?: string;
  creatorId: string | { _id: string; username: string; email: string };
  creatorName: string;
  createdAt: string;
  updatedAt?: string;
  currentPlayers: number; // 目前隊員數
  neededPlayers: number; // 需要隊員數
  teamName?: string; // 隊伍名稱
}

// 保留舊的 Match 類型以向後兼容（可選）
export interface Match {
  id: string;
  title: string;
  category: MatchCategory;
  region: Region;
  dayOfWeek: DayOfWeek;
  time: string;
  location: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  participants: number;
  maxParticipants?: number;
}

export type MatchCategory = 
  | '籃球' 
  | '足球' 
  | '羽球' 
  | '桌球' 
  | '網球' 
  | '排球' 
  | '其他';

export type Region = '北部' | '中部' | '南部';

export type DayOfWeek = 
  | '週一' 
  | '週二' 
  | '週三' 
  | '週四' 
  | '週五' 
  | '週六' 
  | '週日';

export interface MatchFilters {
  category?: MatchCategory;
  region?: Region;
  dayOfWeek?: DayOfWeek;
}

export type ViewMode = 'team-match' | 'find-player';

