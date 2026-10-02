/**
 * A9 – Image upload to Firebase Storage via API route.
 * POST /api/upload-image
 * Accepts multipart/form-data with field "file".
 * Returns: { url: string, storagePath: string }
 */
import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/lib/firebase/admin';
import { verifyToken } from '@/lib/auth-helpers';
import { parseOwnerAuth } from '@/lib/server/ownerAuth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const firebaseUser = await verifyToken(req);
    const ownerAuth = parseOwnerAuth(req);

    if (!firebaseUser && !ownerAuth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const formData = await req.formData();
    const file     = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, WebP, or AVIF.' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File exceeds 5 MB limit' }, { status: 400 });
    }

    const ext         = file.name.split('.').pop();
    const storagePath = `businesses/${uuidv4()}.${ext}`;
    const bucket      = adminStorage.bucket();
    const fileRef     = bucket.file(storagePath);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fileRef.save(buffer, {
      metadata: { contentType: file.type },
    });

    // Make publicly readable
    await fileRef.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    return NextResponse.json({ url, storagePath }, { status: 201 });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error('[POST /api/upload-image]', err);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}
