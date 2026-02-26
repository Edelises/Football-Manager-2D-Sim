import { GameDatabase } from './schema';
import { generateDatabase } from './generators';

class DatabaseService {
  private static instance: DatabaseService;
  private db: GameDatabase;

  private constructor() {
    // Initialize with mock data for now
    this.db = generateDatabase();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public getDatabase(): GameDatabase {
    return this.db;
  }

  public getClub(id: string) {
    return this.db.clubs[id];
  }

  public getPlayer(id: string) {
    return this.db.players[id];
  }

  public getCompetition(id: string) {
    return this.db.competitions[id];
  }

  public getAllClubs() {
    return Object.values(this.db.clubs);
  }
}

export const db = DatabaseService.getInstance();
