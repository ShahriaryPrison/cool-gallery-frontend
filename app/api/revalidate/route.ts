import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { DEFAULT_STORE_SLUG } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-revalidate-secret') || req.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.REVALIDATE_SECRET || process.env.INTERNAL_API_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const slug = (body.slug || req.nextUrl.searchParams.get('slug') || DEFAULT_STORE_SLUG) as string;
    const tag = (body.tag || req.nextUrl.searchParams.get('tag')) as string | null;
    const path = (body.path || req.nextUrl.searchParams.get('path')) as string | null;

    if (slug) {
      revalidateTag(`site:${slug}`, { expire: 0 });
      revalidatePath('/', 'layout');
    }

    if (tag) {
      revalidateTag(tag, { expire: 0 });
    }

    if (path) {
      revalidatePath(path, 'layout');
    }

    return NextResponse.json({
      revalidated: true,
      slug: slug ?? null,
      tag: tag ?? null,
      path: path ?? null,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
