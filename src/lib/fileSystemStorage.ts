import { documentDirectory, readAsStringAsync, writeAsStringAsync, getInfoAsync, makeDirectoryAsync, deleteAsync } from "expo-file-system/legacy";

const STORAGE_DIR = `${documentDirectory}supabase-auth/`;

async function ensureDir() {
  const dirInfo = await getInfoAsync(STORAGE_DIR);
  if (!dirInfo.exists) {
    await makeDirectoryAsync(STORAGE_DIR, { intermediates: true });
  }
}

export const fileSystemStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      await ensureDir();
      const filePath = `${STORAGE_DIR}${key}.json`;
      const info = await getInfoAsync(filePath);
      if (!info.exists) return null;
      return await readAsStringAsync(filePath);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await ensureDir();
      const filePath = `${STORAGE_DIR}${key}.json`;
      await writeAsStringAsync(filePath, value);
    } catch {}
  },

  async removeItem(key: string): Promise<void> {
    try {
      const filePath = `${STORAGE_DIR}${key}.json`;
      const info = await getInfoAsync(filePath);
      if (info.exists) {
        await deleteAsync(filePath);
      }
    } catch {}
  },
};
