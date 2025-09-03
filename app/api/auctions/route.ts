import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AuctionStatus, ProductCondition } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as AuctionStatus | null;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: any = {};
    
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auction.count({ where }),
    ]);

    return NextResponse.json({
      data: auctions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'title', 'description', 'startPrice', 'category', 
      'condition', 'startDate', 'endDate', 'images'
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const now = new Date();

    if (startDate < now) {
      return NextResponse.json(
        { error: 'Start date must be in the future' },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Create auction
    const auction = await prisma.auction.create({
      data: {
        title: data.title,
        description: data.description,
        startPrice: parseFloat(data.startPrice),
        currentPrice: parseFloat(data.startPrice),
        buyNowPrice: data.buyNowPrice ? parseFloat(data.buyNowPrice) : null,
        bidIncrement: data.bidIncrement ? parseFloat(data.bidIncrement) : 1000,
        startDate,
        endDate,
        category: data.category,
        condition: data.condition as ProductCondition,
        images: data.images,
        sellerId: session.user.id,
        status: 'PENDING', // Will be approved by admin
      },
    });

    return NextResponse.json(auction, { status: 201 });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { error: 'Failed to create auction' },
      { status: 500 }
    );
  }
}
