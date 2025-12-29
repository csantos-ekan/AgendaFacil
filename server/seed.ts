import bcrypt from "bcryptjs";
import { storage } from "./storage";

export async function seedDatabase() {
  try {
    const existingUsers = await storage.getAllUsers();
    
    if (existingUsers.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    const adminPassword = await bcrypt.hash("admin123", 10);
    const colabPassword = await bcrypt.hash("colab123", 10);

    await storage.createUser({
      name: "Administrador Sistema",
      email: "admin@empresa.com",
      password: adminPassword,
      role: "admin",
      status: "ativo",
      cpf: "000.000.000-00",
      avatar: "https://i.pravatar.cc/150?u=admin",
    });

    await storage.createUser({
      name: "Colaborador Teste",
      email: "colab@empresa.com",
      password: colabPassword,
      role: "colaborador",
      status: "ativo",
      cpf: "111.111.111-11",
      avatar: "https://i.pravatar.cc/150?u=colab",
    });

    const sala1 = await storage.createRoom({
      name: "Sala de Conferência A",
      capacity: 20,
      location: "Bloco A, 4º Andar",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
      amenities: [
        { id: "9", name: "Projetor", icon: "video" },
        { id: "3", name: "Ar Condicionado", icon: "wind" },
        { id: "6", name: "Wi-Fi Dedicado", icon: "wifi" },
      ],
      isAvailable: true,
      status: "active",
    });

    await storage.createRoom({
      name: "Meeting Room B",
      capacity: 6,
      location: "Bloco B, 2º Andar",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=600",
      amenities: [
        { id: "1", name: "4K TV / Monitor", icon: "tv" },
        { id: "6", name: "Wi-Fi Dedicado", icon: "wifi" },
      ],
      isAvailable: false,
      status: "active",
    });

    await storage.createRoom({
      name: "Auditório Principal",
      capacity: 100,
      location: "Térreo, Ala Sul",
      image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=600",
      amenities: [
        { id: "9", name: "Projetor", icon: "video" },
        { id: "3", name: "Ar Condicionado", icon: "wind" },
        { id: "6", name: "Wi-Fi Dedicado", icon: "wifi" },
        { id: "8", name: "Sound", icon: "coffee" },
      ],
      isAvailable: true,
      status: "active",
    });

    await storage.createResource({
      name: "Projetor Epson X300",
      category: "Equipamento",
      status: "Disponível",
    });

    await storage.createResource({
      name: "Cabo HDMI 5m",
      category: "Acessório",
      status: "Disponível",
    });

    await storage.createResource({
      name: "Microfone sem fio",
      category: "Equipamento",
      status: "Manutenção",
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
