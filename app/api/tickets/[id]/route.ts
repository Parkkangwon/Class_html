import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Ticket, UpdateTicketInput } from '@/types/ticket';

// GET /api/tickets/[id] - Get a single ticket with its messages
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return new NextResponse('Ticket not found', { status: 404 });
    }

    // Check if the user has permission to view this ticket
    if (session.user.role !== 'ADMIN' && ticket.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Mark messages as read if the current user is the ticket owner
    if (ticket.userId === session.user.id) {
      await prisma.ticketMessage.updateMany({
        where: {
          ticketId: params.id,
          userId: { not: session.user.id },
          read: false,
        },
        data: {
          read: true,
        },
      });

      // Update unread count
      await prisma.ticket.update({
        where: { id: params.id },
        data: {
          unreadCount: 0,
        },
      });
    }

    // Format the response
    const formattedTicket = {
      id: ticket.id,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      category: ticket.category,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      userId: ticket.userId,
      userName: ticket.user.name || 'Unknown',
      assignedTo: ticket.assignedTo,
      assignedToUser: ticket.assignedToUser
        ? {
            id: ticket.assignedToUser.id,
            name: ticket.assignedToUser.name,
            email: ticket.assignedToUser.email,
          }
        : null,
      messages: ticket.messages.map((message) => ({
        id: message.id,
        ticketId: message.ticketId,
        content: message.content,
        userId: message.userId,
        userName: message.userId === ticket.userId ? ticket.user.name : 'Support',
        isAdmin: message.isAdmin,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json(formattedTicket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH /api/tickets/[id] - Update a ticket
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only admins can update tickets
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body: UpdateTicketInput = await request.json();
    const { status, priority, assignedTo } = body;

    // Check if the ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!existingTicket) {
      return new NextResponse('Ticket not found', { status: 404 });
    }

    // Update the ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedTo !== undefined && { assignedTo }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // In a real app, you might want to send an email notification here
    // to the ticket owner about the update

    return NextResponse.json({
      id: updatedTicket.id,
      subject: updatedTicket.subject,
      status: updatedTicket.status,
      priority: updatedTicket.priority,
      category: updatedTicket.category,
      createdAt: updatedTicket.createdAt.toISOString(),
      updatedAt: updatedTicket.updatedAt.toISOString(),
      userId: updatedTicket.userId,
      userName: updatedTicket.user.name || 'Unknown',
      assignedTo: updatedTicket.assignedTo,
      assignedToUser: updatedTicket.assignedToUser
        ? {
            id: updatedTicket.assignedToUser.id,
            name: updatedTicket.assignedToUser.name,
            email: updatedTicket.assignedToUser.email,
          }
        : null,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// DELETE /api/tickets/[id] - Delete a ticket
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Only admins can delete tickets
    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Check if the ticket exists
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: params.id },
    });

    if (!existingTicket) {
      return new NextResponse('Ticket not found', { status: 404 });
    }

    // Delete the ticket and its messages
    await prisma.ticket.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
