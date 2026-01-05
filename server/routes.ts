import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { validateReservationTime } from "./validation";
import { checkAllRoomsAvailability } from "./availability";

export const router = Router();

router.post("/auth/login", async (req: Request, res: Response) => {
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

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    return res.json(usersWithoutPasswords);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ message: "Erro ao buscar usuários" });
  }
});

router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ message: "Erro ao buscar usuário" });
  }
});

router.post("/users", async (req: Request, res: Response) => {
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
      cpf,
      avatar,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ message: "Erro ao criar usuário" });
  }
});

router.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status, cpf, avatar } = req.body;
    const updateData: any = { name, email, role, status, cpf, avatar };
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updatedUser = await storage.updateUser(parseInt(req.params.id), updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.json(userWithoutPassword);
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ message: "Erro ao atualizar usuário" });
  }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
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

router.post("/users/:id/avatar", async (req: Request, res: Response) => {
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

router.get("/rooms", async (_req: Request, res: Response) => {
  try {
    const rooms = await storage.getAllRooms();
    return res.json(rooms);
  } catch (error) {
    console.error("Get rooms error:", error);
    return res.status(500).json({ message: "Erro ao buscar salas" });
  }
});

router.get("/rooms/availability", async (req: Request, res: Response) => {
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

router.get("/rooms/:id", async (req: Request, res: Response) => {
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

router.post("/rooms", async (req: Request, res: Response) => {
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

router.put("/rooms/:id", async (req: Request, res: Response) => {
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

router.delete("/rooms/:id", async (req: Request, res: Response) => {
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

router.get("/resources", async (_req: Request, res: Response) => {
  try {
    const resources = await storage.getAllResources();
    return res.json(resources);
  } catch (error) {
    console.error("Get resources error:", error);
    return res.status(500).json({ message: "Erro ao buscar recursos" });
  }
});

router.get("/resources/:id", async (req: Request, res: Response) => {
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

router.post("/resources", async (req: Request, res: Response) => {
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

router.put("/resources/:id", async (req: Request, res: Response) => {
  try {
    const updatedResource = await storage.updateResource(parseInt(req.params.id), req.body);
    
    if (!updatedResource) {
      return res.status(404).json({ message: "Recurso não encontrado" });
    }

    return res.json(updatedResource);
  } catch (error) {
    console.error("Update resource error:", error);
    return res.status(500).json({ message: "Erro ao atualizar recurso" });
  }
});

router.delete("/resources/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteResource(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Recurso não encontrado" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Delete resource error:", error);
    return res.status(500).json({ message: "Erro ao excluir recurso" });
  }
});

router.get("/reservations", async (_req: Request, res: Response) => {
  try {
    const reservations = await storage.getAllReservations();
    return res.json(reservations);
  } catch (error) {
    console.error("Get reservations error:", error);
    return res.status(500).json({ message: "Erro ao buscar reservas" });
  }
});

router.get("/reservations/user/:userId", async (req: Request, res: Response) => {
  try {
    const reservations = await storage.getReservationsByUser(parseInt(req.params.userId));
    return res.json(reservations);
  } catch (error) {
    console.error("Get user reservations error:", error);
    return res.status(500).json({ message: "Erro ao buscar reservas do usuário" });
  }
});

router.get("/reservations/:id", async (req: Request, res: Response) => {
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

router.post("/reservations", async (req: Request, res: Response) => {
  try {
    const { roomId, userId, roomName, roomLocation, date, startTime, endTime, status, clientTimezoneOffset } = req.body;
    
    if (!roomId || !userId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Dados da reserva incompletos" });
    }

    const timeValidation = validateReservationTime(date, startTime, endTime, clientTimezoneOffset);
    if (!timeValidation.isValid) {
      return res.status(400).json({ message: timeValidation.error });
    }

    const allReservations = await storage.getAllReservations();
    const hasConflict = allReservations.some(r => {
      if (r.roomId !== roomId || r.date !== date || r.status === 'cancelled') {
        return false;
      }
      const existingStart = r.startTime;
      const existingEnd = r.endTime;
      const newStart = startTime;
      const newEnd = endTime;
      return (newStart < existingEnd && newEnd > existingStart);
    });

    if (hasConflict) {
      return res.status(409).json({ message: "Já existe uma reserva para esta sala neste horário" });
    }

    const newReservation = await storage.createReservation({
      roomId,
      userId,
      roomName: roomName || "",
      roomLocation: roomLocation || "",
      date,
      startTime,
      endTime,
      status: status || "confirmed",
    });

    return res.status(201).json(newReservation);
  } catch (error) {
    console.error("Create reservation error:", error);
    return res.status(500).json({ message: "Erro ao criar reserva" });
  }
});

router.put("/reservations/:id", async (req: Request, res: Response) => {
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

router.delete("/reservations/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await storage.deleteReservation(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Reserva não encontrada" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("Delete reservation error:", error);
    return res.status(500).json({ message: "Erro ao excluir reserva" });
  }
});
