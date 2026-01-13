import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { desc } from "drizzle-orm";
import { storage } from "./storage";
import { validateReservationTime } from "./validation";
import { checkAllRoomsAvailability } from "./availability";
import { parseParticipantEmails } from "./services/email";
import { createCalendarEvent, deleteCalendarEvent, testCalendarConnection } from "./services/calendar";
import { generateToken, authMiddleware, adminMiddleware } from "./auth";
import { encryptCPF, decryptCPF } from "./encryption";
import { auditMiddleware } from "./audit";
import { db } from "./db";
import { auditLogs } from "../shared/schema";

export const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Muitas tentativas de login. Tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

router.get("/auth/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    
    const { password: _, cpf, ...userData } = user;
    return res.json({ 
      user: {
        ...userData,
        cpf: cpf ? decryptCPF(cpf) : undefined
      }
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.post("/auth/login", loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    const user = await storage.getUserByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      email: user.email
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ 
      user: userWithoutPassword,
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/users", authMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, cpf, ...user }) => ({
      ...user,
      cpf: cpf ? decryptCPF(cpf) : undefined
    }));
    return res.json(usersWithoutPasswords);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Erro ao buscar usuários" });
  }
});

router.get("/users/:id", authMiddleware, auditMiddleware('user'), async (req: Request, res: Response) => {
  try {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    const { password, cpf, ...userData } = user;
    const decryptedUser = {
      ...userData,
      cpf: cpf ? decryptCPF(cpf) : undefined
    };
    return res.json(decryptedUser);
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzk0YTNiOCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTEiIGZpbGw9IiNmMWY1ZjkiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIi8+PHBhdGggZD0iTTcgMjAuNjYyVjE5YTQgNCAwIDAgMSA0LTRoMmE0IDQgMCAwIDEgNCA0djEuNjYyIi8+PC9zdmc+";

router.post("/users", authMiddleware, adminMiddleware, auditMiddleware('user'), async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status, cpf, avatar } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nome, email e senha são obrigatórios" });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email já cadastrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await storage.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || "colaborador",
      status: status || "ativo",
      cpf: cpf ? encryptCPF(cpf) : undefined,
      avatar: avatar || DEFAULT_AVATAR,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Erro ao criar usuário" });
  }
});

router.put("/users/:id", authMiddleware, auditMiddleware('user'), async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status, cpf, avatar } = req.body;
    const updateData: any = { name, email, role, status, avatar };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    if (cpf) {
      updateData.cpf = encryptCPF(cpf);
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updatedUser = await storage.updateUser(parseInt(req.params.id), updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const { password: _, cpf: encryptedCpf, ...userData } = updatedUser;
    return res.json({
      ...userData,
      cpf: encryptedCpf ? decryptCPF(encryptedCpf) : undefined
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
});

router.delete("/users/:id", authMiddleware, adminMiddleware, auditMiddleware('user'), async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteUser(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ message: "Erro ao excluir usuário" });
  }
});

router.post("/users/:id/avatar", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ message: "Imagem não fornecida" });
    }

    const updatedUser = await storage.updateUser(parseInt(req.params.id), { avatar });
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error("Upload avatar error:", error);
    return res.status(500).json({ message: "Erro ao atualizar foto de perfil" });
  }
});

router.get("/users/:id/export", authMiddleware, auditMiddleware('user'), async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id);
    
    if (req.userId !== targetUserId && req.userRole !== 'admin') {
      return res.status(403).json({ 
        message: "Você só pode exportar seus próprios dados" 
      });
    }

    const user = await storage.getUser(targetUserId);
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const reservations = await storage.getReservationsByUser(targetUserId);
    
    const userCPF = user.cpf ? decryptCPF(user.cpf) : null;
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        format: 'JSON',
        version: '1.0',
        exportedBy: req.userId === targetUserId ? 'user' : 'admin'
      },
      personalData: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: userCPF,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      },
      reservations: reservations.map(r => ({
        id: r.id,
        roomName: r.roomName,
        roomLocation: r.roomLocation,
        date: r.date,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status,
        timestamp: r.timestamp
      })),
      summary: {
        totalReservations: reservations.length,
        activeReservations: reservations.filter(r => r.status === 'confirmed').length,
        cancelledReservations: reservations.filter(r => r.status === 'cancelled').length
      }
    };
    
    const filename = `dados-pessoais-${user.email.replace('@', '-at-')}-${Date.now()}.json`;
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    return res.json(exportData);
  } catch (error) {
    console.error("Export user data error:", error);
    return res.status(500).json({ message: "Erro ao exportar dados" });
  }
});

router.get("/rooms", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const rooms = await storage.getAllRooms();
    const allResources = await storage.getAllResources();
    const availableResourceNames = allResources
      .filter(r => r.status === 'Disponível')
      .map(r => r.name);
    
    const roomsWithFilteredAmenities = rooms.map(room => ({
      ...room,
      amenities: (room.amenities as any[]).filter(
        amenity => availableResourceNames.includes(amenity.name)
      )
    }));
    
    return res.json(roomsWithFilteredAmenities);
  } catch (error) {
    console.error("Get rooms error:", error);
    return res.status(500).json({ message: "Erro ao buscar salas" });
  }
});

router.get("/rooms/availability", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { date, startTime, endTime } = req.query;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: "Data, hora inicial e hora final são obrigatórias" });
    }

    const availability = await checkAllRoomsAvailability(
      date as string,
      startTime as string,
      endTime as string
    );
    
    return res.json(availability);
  } catch (error) {
    console.error("Check availability error:", error);
    return res.status(500).json({ message: "Erro ao verificar disponibilidade" });
  }
});

router.get("/rooms/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const room = await storage.getRoom(parseInt(req.params.id));
    if (!room) {
      return res.status(404).json({ message: "Sala não encontrada" });
    }
    return res.json(room);
  } catch (error) {
    console.error("Get room error:", error);
    return res.status(500).json({ message: "Erro ao buscar sala" });
  }
});

router.post("/rooms", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, capacity, location, image, amenities, isAvailable, status, pricePerHour } = req.body;
    
    if (!name || !capacity || !location) {
      return res.status(400).json({ message: "Nome, capacidade e localização são obrigatórios" });
    }

    const newRoom = await storage.createRoom({
      name,
      capacity,
      location,
      image,
      amenities: amenities || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      status: status || "active",
      pricePerHour,
    });

    return res.status(201).json(newRoom);
  } catch (error) {
    console.error("Create room error:", error);
    return res.status(500).json({ message: "Erro ao criar sala" });
  }
});

router.put("/rooms/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const updatedRoom = await storage.updateRoom(parseInt(req.params.id), req.body);
    
    if (!updatedRoom) {
      return res.status(404).json({ message: "Sala não encontrada" });
    }

    return res.json(updatedRoom);
  } catch (error) {
    console.error("Update room error:", error);
    return res.status(500).json({ message: "Erro ao atualizar sala" });
  }
});

router.delete("/rooms/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteRoom(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Sala não encontrada" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({ message: "Erro ao excluir sala" });
  }
});

router.get("/resources", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const resources = await storage.getAllResources();
    return res.json(resources);
  } catch (error) {
    console.error("Get resources error:", error);
    return res.status(500).json({ message: "Erro ao buscar recursos" });
  }
});

router.get("/resources/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const resource = await storage.getResource(parseInt(req.params.id));
    if (!resource) {
      return res.status(404).json({ message: "Recurso não encontrado" });
    }
    return res.json(resource);
  } catch (error) {
    console.error("Get resource error:", error);
    return res.status(500).json({ message: "Erro ao buscar recurso" });
  }
});

router.post("/resources", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, category, status } = req.body;
    
    if (!name || !category) {
      return res.status(400).json({ message: "Nome e categoria são obrigatórios" });
    }

    const newResource = await storage.createResource({
      name,
      category,
      status: status || "Disponível",
    });

    return res.status(201).json(newResource);
  } catch (error) {
    console.error("Create resource error:", error);
    return res.status(500).json({ message: "Erro ao criar recurso" });
  }
});

router.put("/resources/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const resourceId = parseInt(req.params.id);
    const updatedResource = await storage.updateResource(resourceId, req.body);
    
    if (!updatedResource) {
      return res.status(404).json({ message: "Recurso não encontrado" });
    }

    // Propagar atualização para todas as salas que possuem este recurso
    const allRooms = await storage.getAllRooms();
    for (const room of allRooms) {
      const amenities = room.amenities as Array<Record<string, unknown>> || [];
      const hasResource = amenities.some(a => a.id === resourceId);
      
      if (hasResource) {
        const updatedAmenities = amenities.map(a => 
          a.id === resourceId 
            ? { ...a, name: updatedResource.name, category: updatedResource.category, status: updatedResource.status }
            : a
        );
        await storage.updateRoom(room.id, { amenities: updatedAmenities });
      }
    }

    return res.json(updatedResource);
  } catch (error) {
    console.error("Update resource error:", error);
    return res.status(500).json({ message: "Erro ao atualizar recurso" });
  }
});

router.delete("/resources/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const resourceId = parseInt(req.params.id);
    
    // Remover recurso de todas as salas que o possuem
    const allRooms = await storage.getAllRooms();
    for (const room of allRooms) {
      const amenities = room.amenities as Array<Record<string, unknown>> || [];
      const hasResource = amenities.some(a => a.id === resourceId);
      
      if (hasResource) {
        const updatedAmenities = amenities.filter(a => a.id !== resourceId);
        await storage.updateRoom(room.id, { amenities: updatedAmenities });
      }
    }
    
    const deleted = await storage.deleteResource(resourceId);
    if (!deleted) {
      return res.status(404).json({ message: "Recurso não encontrado" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Delete resource error:", error);
    return res.status(500).json({ message: "Erro ao excluir recurso" });
  }
});

router.get("/reservations", authMiddleware, async (_req: Request, res: Response) => {
  try {
    const reservations = await storage.getAllReservations();
    return res.json(reservations);
  } catch (error) {
    console.error("Get reservations error:", error);
    return res.status(500).json({ message: "Erro ao buscar reservas" });
  }
});

router.get("/reservations/user/:userId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const reservations = await storage.getReservationsByUser(parseInt(req.params.userId));
    return res.json(reservations);
  } catch (error) {
    console.error("Get user reservations error:", error);
    return res.status(500).json({ message: "Erro ao buscar reservas do usuário" });
  }
});

router.get("/reservations/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const reservation = await storage.getReservation(parseInt(req.params.id));
    if (!reservation) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }
    return res.json(reservation);
  } catch (error) {
    console.error("Get reservation error:", error);
    return res.status(500).json({ message: "Erro ao buscar reserva" });
  }
});

router.post("/reservations", authMiddleware, auditMiddleware('reservation'), async (req: Request, res: Response) => {
  try {
    const { 
      roomId, userId, roomName, roomLocation, date, startTime, endTime, 
      status, clientTimezoneOffset, participantEmails, title, description 
    } = req.body;
    
    if (!roomId || !userId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Dados da reserva incompletos" });
    }

    const timeValidation = validateReservationTime(date, startTime, endTime, clientTimezoneOffset);
    if (!timeValidation.isValid) {
      return res.status(400).json({ message: timeValidation.error });
    }

    const { db } = await import('./db');
    const { reservations } = await import('../shared/schema');
    const { eq, and, ne } = await import('drizzle-orm');
    
    let newReservation;
    
    try {
      newReservation = await db.transaction(async (tx) => {
        const conflicts = await tx.select()
          .from(reservations)
          .where(
            and(
              eq(reservations.roomId, roomId),
              eq(reservations.date, date),
              ne(reservations.status, 'cancelled')
            )
          )
          .for('update');
        
        const hasConflict = conflicts.some(r => {
          return startTime < r.endTime && endTime > r.startTime;
        });
        
        if (hasConflict) {
          throw new Error('RESERVATION_CONFLICT');
        }
        
        const [created] = await tx.insert(reservations).values({
          roomId,
          userId,
          roomName: roomName || "",
          roomLocation: roomLocation || "",
          date,
          startTime,
          endTime,
          status: status || "confirmed",
        }).returning();
        
        return created;
      });
    } catch (error: any) {
      if (error.message === 'RESERVATION_CONFLICT') {
        return res.status(409).json({ 
          message: "Já existe uma reserva para esta sala neste horário" 
        });
      }
      throw error;
    }

    const organizer = await storage.getUser(userId);
    let calendarEventId: string | null = null;
    
    if (organizer?.email) {
      const externalParticipants = parseParticipantEmails(participantEmails || '');
      const calendarAttendees = externalParticipants.filter(
        e => e.toLowerCase() !== organizer.email.toLowerCase()
      );

      try {
        calendarEventId = await createCalendarEvent({
          organizerName: organizer.name,
          organizerEmail: organizer.email,
          roomName: roomName || '',
          roomLocation: roomLocation || '',
          date,
          startTime,
          endTime,
          participants: calendarAttendees,
          title: title || undefined,
          description: description || undefined
        });
        
        if (calendarEventId && newReservation?.id) {
          await storage.updateReservation(newReservation.id, { calendarEventId });
          console.log(`Calendar event ID ${calendarEventId} saved to reservation ${newReservation.id}`);
        }
      } catch (err) {
        console.error('Error creating calendar event:', err);
      }
    }

    return res.status(201).json({ ...newReservation, calendarEventId });
  } catch (error) {
    console.error("Create reservation error:", error);
    return res.status(500).json({ message: "Erro ao criar reserva" });
  }
});

router.put("/reservations/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const updatedReservation = await storage.updateReservation(parseInt(req.params.id), req.body);
    
    if (!updatedReservation) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }

    return res.json(updatedReservation);
  } catch (error) {
    console.error("Update reservation error:", error);
    return res.status(500).json({ message: "Erro ao atualizar reserva" });
  }
});

router.delete("/reservations/:id", authMiddleware, auditMiddleware('reservation'), async (req: Request, res: Response) => {
  try {
    const reservationId = parseInt(req.params.id);
    
    const reservation = await storage.getReservation(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }
    
    if (reservation.calendarEventId) {
      try {
        const calendarDeleted = await deleteCalendarEvent(reservation.calendarEventId);
        if (calendarDeleted) {
          console.log(`Calendar event ${reservation.calendarEventId} deleted for reservation ${reservationId}`);
        } else {
          console.warn(`Failed to delete calendar event ${reservation.calendarEventId} - participants may not be notified`);
        }
      } catch (err) {
        console.error('Error deleting calendar event:', err);
      }
    }
    
    const deleted = await storage.deleteReservation(reservationId);
    if (!deleted) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Delete reservation error:", error);
    return res.status(500).json({ message: "Erro ao excluir reserva" });
  }
});

router.get("/test/calendar", async (_req: Request, res: Response) => {
  console.log('[API] Testing Google Calendar connection...');
  try {
    const result = await testCalendarConnection();
    console.log('[API] Calendar test result:', JSON.stringify(result, null, 2));
    return res.json(result);
  } catch (error: any) {
    console.error('[API] Calendar test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno ao testar conexão',
      error: error.message 
    });
  }
});

router.get("/audit/logs", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    
    const logs = await db.select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(limit)
      .offset(offset);
    
    return res.json({ logs, page, limit });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({ message: "Erro ao buscar logs de auditoria" });
  }
});
