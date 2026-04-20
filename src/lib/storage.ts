import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';

export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  // Use a unique name or overwrite existing
  const path = `user_uploads/${uid}/avatar_${Date.now()}`;
  return await uploadFile(file, path);
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
  const path = `products/${productId}/${Date.now()}_${file.name}`;
  return await uploadFile(file, path);
}

export async function deleteFolder(path: string): Promise<void> {
  const folderRef = ref(storage, path);
  try {
    const listResult = await listAll(folderRef);
    
    // Delete all files in the folder
    const deleteFilesPromises = listResult.items.map((itemRef) => deleteObject(itemRef));
    
    // Recursively delete subfolders
    const deleteSubfoldersPromises = listResult.prefixes.map((subfolderRef) => deleteFolder(subfolderRef.fullPath));
    
    await Promise.all([...deleteFilesPromises, ...deleteSubfoldersPromises]);
  } catch (error) {
    console.error(`Error deleting folder ${path}:`, error);
  }
}
