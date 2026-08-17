import { File, Directory, Paths } from "expo-file-system";

const STORAGE_DIR = new Directory(Paths.document, "supabase-auth");

async function ensureDir() {
  if (!STORAGE_DIR.exists) {
    STORAGE_DIR.create();
  }
}

export const fileSystemStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      await ensureDir();
      const file = new File(STORAGE_DIR, `${key}.json`);
      if (!file.exists) return null;
      return await file.text();
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await ensureDir();
      const file = new File(STORAGE_DIR, `${key}.json`);
      await file.write(value);
    } catch {}
  },

  async removeItem(key: string): Promise<void> {
    try {
      const file = new File(STORAGE_DIR, `${key}.json`);
      if (file.exists) {
        file.delete();
      }
    } catch {}
  },
};
