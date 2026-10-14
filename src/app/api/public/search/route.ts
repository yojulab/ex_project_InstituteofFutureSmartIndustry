import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Program, Post, Resource, Faq } from '@/models';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({
        query: '',
        programs: [],
        posts: [],
        resources: [],
        faqs: [],
      });
    }

    await connectToDatabase();

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [programs, posts, resources, faqs] = await Promise.all([
      Program.find({
        deletedAt: null,
        $or: [{ title: regex }, { summary: regex }, { target: regex }, { content: regex }],
      })
        .limit(10)
        .lean(),

      Post.find({
        status: 'published',
        deletedAt: null,
        $or: [{ title: regex }, { summary: regex }, { body: regex }],
      })
        .limit(10)
        .lean(),

      Resource.find({
        deletedAt: null,
        $or: [{ title: regex }, { summary: regex }, { authorOrDept: regex }],
      })
        .limit(10)
        .lean(),

      Faq.find({
        isActive: true,
        $or: [{ question: regex }, { answer: regex }],
      })
        .limit(10)
        .lean(),
    ]);

    return NextResponse.json({
      query: q,
      programs: programs.map((p: any) => ({
        id: p._id.toString(),
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        category: p.category,
        status: p.status,
        type: 'program',
      })),
      posts: posts.map((p: any) => ({
        id: p._id.toString(),
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        type: p.type,
        publishedAt: p.publishedAt,
      })),
      resources: resources.map((r: any) => ({
        id: r._id.toString(),
        title: r.title,
        summary: r.summary,
        kind: r.kind,
        authorOrDept: r.authorOrDept,
        type: 'resource',
      })),
      faqs: faqs.map((f: any) => ({
        id: f._id.toString(),
        question: f.question,
        answer: f.answer,
        category: f.category,
        type: 'faq',
      })),
    });
  } catch (error) {
    console.error('[Public Search API] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
