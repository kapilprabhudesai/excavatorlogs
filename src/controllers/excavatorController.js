
import prisma from "../prisma.js";

export const addExcavator = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shortname, regNumber } = req.body;

    // ✅ Check manually first (optional safeguard)
    const existing = await prisma.excavator.findFirst({
      where: { OR: [{ shortname }, { regNumber }] },
    });
    if (existing) {
      return res.status(400).json({ message: "Excavator already exists" });
    }

    const excavator = await prisma.excavator.create({
      data: { shortname, regNumber, userId },
    });

    res.status(201).json(excavator);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getExcavators = async (req, res) => {
  const excavators = await prisma.excavator.findMany({
    where: { userId: req.user.id }
  });
  res.json(excavators);
};


export const deleteExcavator = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if excavator exists
    const existing = await prisma.excavator.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Excavator not found" });
    }

    // ✅ Delete excavator
    await prisma.excavator.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Excavator deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};