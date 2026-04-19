
type Bucket =
  | "avatars"
  | "banners"
  | "assignments"
  | "resources"
  | "projects"
  | "events"
  | "messages";

const BUCKET_CONFIG: Record<
  Bucket,
  { maxSizeMB: number; allowedTypes: string[] }
> = {
  avatars: {
    maxSizeMB: 2,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  banners: {
    maxSizeMB: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  assignments: { maxSizeMB: 10, allowedTypes: ["*"] },
  resources: { maxSizeMB: 25, allowedTypes: ["*"] },
  projects: {
    maxSizeMB: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  events: {
    maxSizeMB: 5,
    allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  },
  messages: { maxSizeMB: 10, allowedTypes: ["*"] },
};

export async function uploadFile(
  bucket: Bucket,
  file: File,
  userId: string
): Promise<{ url: string } | { error: string }> {
  const config = BUCKET_CONFIG[bucket];

  if (file.size > config.maxSizeMB * 1024 * 1024) {
    return { error: `File too large. Max ${config.maxSizeMB}MB.` };
  }

  if (
    config.allowedTypes[0] !== "*" &&
    !config.allowedTypes.includes(file.type)
  ) {
    return { error: `File type ${file.type} not allowed.` };
  }

  // MOCK UPLOAD: Returning a placeholder since Supabase is removed.
  // TODO: Integrate Vercel Blob or an alternative storage provider for production.
  console.log(`Mock upload to ${bucket}: ${file.name}`);
  const mockUrl = `https://placehold.co/400x400?text=${encodeURIComponent(file.name)}`;
  
  return { url: mockUrl };
}

export async function deleteFile(
  bucket: Bucket,
  url: string
): Promise<void> {
  console.log(`Mock delete from ${bucket}: ${url}`);
}
